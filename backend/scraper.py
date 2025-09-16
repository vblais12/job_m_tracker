# Job Market Intelligence Tracker v1
# Author: Viktor Blais (GitHub: https://github.com/vblais12)
# Fetch Job listings and store in database for analysis

import requests
from datetime import datetime
import psycopg2
import os
from dotenv import load_dotenv
import hashlib
load_dotenv()

API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = os.getenv("RAPIDAPI_HOST")

# DB CRED
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

# Function connects to AWS RDS instance, connects to database and creates a job table
# Nothing happens if database was already created
def init_database(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    with conn.cursor() as c:

        c.execute("""
            CREATE TABLE IF NOT EXISTS job_listings (
                id TEXT PRIMARY KEY,
                job_title TEXT,
                date_posted DATE,
                job_is_remote TEXT,
                employer_name TEXT,
                job_employment_type TEXT,
                job_city TEXT,
                job_country TEXT,
                job_state TEXT,
                job_description TEXT,
                qualifications TEXT,
                apply_link TEXT,
                search_query TEXT
            )
        """)

    conn.commit()
    conn.close()


# Prevents againsts storing repeated job postings for the same job as different jobs.
def generate_job_key(title, employer, city, description):

    raw = f"{title}|{employer}|{city}|{description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()




# API call, fetches jobs and returns json dictionary of jobs
# TODO: Maybe had some location features
#
def fetch_jobs(query="Machine Learning", location="US", pages=9, date_posted="today"):

    url = 'https://jsearch.p.rapidapi.com/search'

    search_query = f"{query}".strip()

    params = {
        "query" : search_query,
        "page" : "1",
        "num_pages" : str(pages),
        "country" : {location},
        "date_posted" : date_posted,
    }

    headers = {
        'x-rapidapi-key' : API_KEY,
        'x-rapidapi-host' : API_HOST
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        raise Exception(f"API Error: {response.status_code} - {response.text}")
    

    jobs_data = response.json().get("data", [])

    for job in jobs_data:
        job['search_query'] = search_query


    return jobs_data


# Stores jobs in job listings database
#
#
def store_jobs(jobs, host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):

    init_database(host, port, dbname, user, password)
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    job_inserted_counter = 0

    with conn.cursor() as c:       # automatically takes care of closing cursor (even if error occurs)
        for job in jobs:
            try:
                job_title = (job.get("job_title") or "").strip()
                date = job.get("job_posted_at_datetime_utc")
                date_posted = ""
                if date:
                    try:
                        date_posted = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y-%m-%d")
                    except ValueError:
                        date_posted = date   # if date formatting doesnt work
                job_is_remote = job.get("job_is_remote") or ""
                employer_name = (job.get("employer_name") or "").strip()
                job_employment_type = job.get("job_employment_type") or ""
                job_city = (job.get("job_city") or "Remote").strip()
                job_country = job.get("job_country") or "Remote"
                job_state = job.get("job_state") or "Remote"
                job_description = job.get("job_description") or ""
                job_highlights = job.get("job_highlights", {})
                qualifications_raw = job_highlights.get("Qualifications", [])
                if isinstance(qualifications_raw, list):        # converting list to string
                    qualifications = ". ".join(qualifications_raw)
                else:
                    qualifications = qualifications_raw or "Not specified"
                apply_link = job.get("job_apply_link") or ""
                search_query = job.get("search_query") or ""
                job_id = generate_job_key(job_title, employer_name, job_city, job_description)

                c.execute("""
                    INSERT INTO job_listings (id, job_title, date_posted, job_is_remote, employer_name, job_employment_type, job_city, job_country, job_state, job_description, qualifications, apply_link, search_query)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING;
                """, (job_id, job_title, date_posted, job_is_remote, employer_name, job_employment_type, job_city, job_country, job_state, job_description, qualifications, apply_link, search_query))

                if c.rowcount > 0:  # only count if inserted
                    job_inserted_counter += 1


            except Exception as e:
                print(f"Error saving job: {e}")
                continue
    
    conn.commit()
    conn.close()
    print(f"Stored {job_inserted_counter} jobs to the database")



# Counts how many jobs are in the DB (TOTAL and per role)
def job_counts(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, location=None):
    
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    with conn.cursor() as c:

        # Total jobs

        if location:
            c.execute("""
                SELECT COUNT(*) FROM job_listings
                WHERE LOWER(job_country) = LOWER(%s)
            """, (location,))
            total_jobs = c.fetchone()[0]

             # Jobs grouped by search_query
            c.execute("""
                SELECT search_query, COUNT(*) as count
                FROM job_listings
                WHERE LOWER(job_country) = LOWER(%s)
                GROUP BY search_query
                ORDER BY count DESC
            """, (location,))

            counts_by_query = c.fetchall()


        else:
            c.execute("SELECT COUNT(*) FROM job_listings")
            total_jobs = c.fetchone()[0]

            # Jobs grouped by search_query
            c.execute("""
                SELECT search_query, COUNT(*) as count
                FROM job_listings
                GROUP BY search_query
                ORDER BY count DESC
            """)
            counts_by_query = c.fetchall()

    
    conn.close()
    # return total_jobs, counts_by_query

    return {
        "total_jobs": total_jobs,
        "counts_by_query": counts_by_query
    }



# Main
def main():
    # roles = ['Machine Learning engineer', 'Front-end developer', 'Back-end developer']
    
    roles = ['Machine Learning engineer', 'Software engineer']
    all_jobs = []

    for role in roles:
        try:
            jobs = fetch_jobs(query=role, location="CA", pages=30, date_posted="3days")
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"Error while fetching job for {role}: {e}")
    
    store_jobs(all_jobs)
    
    
    jobs = job_counts(HOST, PORT, DBNAME, USER, PASSWORD)
    print(f"Total jobs in the database: {jobs['total_jobs']}")
    print(f"Jobs per query: ")
    for role, count in jobs['counts_by_query']:
        print(f"-----{role}: {count}")




# Run
if __name__ == "__main__":
    main()
