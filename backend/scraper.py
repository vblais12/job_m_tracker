# Job Market Intelligence Tracker v1
# Author: Viktor Blais (GitHub: https://github.com/vblais12)
# Fetch Job listings and store in database for analysis

import requests
from datetime import datetime
import sqlite3
import os
from dotenv import load_dotenv
import hashlib
load_dotenv()

API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = os.getenv("RAPIDAPI_HOST")

DB_PATH = os.getenv("DB_PATH")

# Function initializes a SQLite database and creates a job table
# Nothing happens if database was already created
#
def init_database(db_path=DB_PATH):

    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect(db_path)  # Create / Connect to the database
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            job_title TEXT,
            date_posted TEXT,
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
def fetch_jobs(query="Machine Learning", location='', pages=9, date_posted="today"):

    url = 'https://jsearch.p.rapidapi.com/search'

    search_query = f"{query} {location}".strip()

    params = {
        "query" : search_query,
        "page" : "1",
        "num_pages" : str(pages),
        "country" : "us",
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
def store_jobs(jobs, db_path='data/job_listings.db'):
    init_database(db_path)
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    for job in jobs:
        try:
            job_id = job.get("job_id")
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
                INSERT OR IGNORE INTO jobs (id, job_title, date_posted, job_is_remote, employer_name, job_employment_type, job_city, job_country, job_state, job_description, qualifications, apply_link, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (job_id, job_title, date_posted, job_is_remote, employer_name, job_employment_type, job_city, job_country, job_state, job_description, qualifications, apply_link, search_query))

        except Exception as e:
            print(f"Error saving job: {e}")
            continue
    
    conn.commit()
    conn.close()
    print(f"Stored {len(jobs)} jobs to the database ({db_path})")



# Counts how many jobs are in the DB (TOTAL and per role)
def job_counts(db_path=DB_PATH):
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Total jobs
    c.execute("SELECT COUNT(*) FROM jobs")
    total_jobs = c.fetchone()[0]

    # Jobs grouped by search_query
    c.execute("""
        SELECT search_query, COUNT(*) as count
        FROM jobs
        GROUP BY search_query
        ORDER BY count DESC
    """)
    counts_by_query = c.fetchall()

    conn.close()

    return total_jobs, counts_by_query



# Main
# TOOD: Split web dev into front/back end?
def main():
    # roles = ['Machine Learning engineer', 'Front-end developer', 'Back-end developer']

    roles = ['Machine Learning engineer', 'Software engineer']
    all_jobs = []

    for role in roles:
        try:
            jobs = fetch_jobs(query=role, pages=20, date_posted="today")
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"Error while fetching job for {role}: {e}")
    
    store_jobs(all_jobs)
    total_jobs, jobs_by_query = job_counts(DB_PATH)
    print(f"Total jobs in the database: {total_jobs}")
    print(f"Jobs per query: ")
    for role, count in jobs_by_query:
        print(f"-----{role}: {count}")




# Run
if __name__ == "__main__":
    main()
