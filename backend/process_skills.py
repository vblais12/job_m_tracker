from tqdm import tqdm
from backend.extract_skills import *
import os
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

# DB CRED
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")



# Function to process job postings in DB, extract skills and store into job_skills table
# TODO: check and fix all the queries 
def process_jobs(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, new_jobs_only=True):

    DB_migration(host, port, dbname, user, password)

    # 2) Connect to DB
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    with conn.cursor() as c:
        if new_jobs_only:
            # Only jobs with no entries in job_skills
            c.execute("""
                SELECT id, job_description, qualifications, search_query
                FROM job_listings
                WHERE NOT EXISTS (
                    SELECT 1 FROM job_skills s WHERE s.job_id = job_listings.id
                )
            """)
        else:
            # Process everything
            c.execute("SELECT id, job_description, qualifications, search_query FROM job_listings")

        jobs = c.fetchall()
        print(f"Found {len(jobs)} job(s) to process.")

        # 3) Build the NLP pipeline 
        NLP = build_pipeline()
        

        # 4) Process jobs
        for job_id, desc, qualifications, search_query in tqdm(jobs, desc="Extracting skills"):
            text = " ".join(filter(None, [desc, qualifications]))  # skip None, concatenates desc and qualifications into 1 string
            skills = extract_skills(NLP, text)  # List of tuples (skills, confidence)

            # 5) Batch insert
            c.executemany("""
                INSERT INTO job_skills (job_id, skill, confidence, search_query, source_model)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (job_id, skill) DO UPDATE
                    SET confidence = EXCLUDED.confidence,
                    search_query = EXCLUDED.search_query,
                    source_model = EXCLUDED.source_model;
            """, [(job_id, skill, float(confidence), search_query, MODEL_ID) for skill, confidence in skills])


    conn.commit()
    conn.close()
    print(f"Processed {len(jobs)} job(s) and stored skills in job_skills.")




# Get the top N most frequent skills for each search_query (role)
# Returns dict: {search_query: [(skill, count), ...]}
def top_skills_per_query(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, top_n=10):
   
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    with conn.cursor() as c:
        # Run query
        c.execute("""
            SELECT search_query, skill, COUNT(*) as freq
            FROM job_skills
            GROUP BY search_query, skill
            ORDER BY search_query, freq DESC;
        """)
        rows = c.fetchall()
        conn.close()

    # Organize into defaultdict (to prevent KeyError)
    results = defaultdict(list)
    for search_query, skill, freq in rows:
        if len(results[search_query]) < top_n:
            results[search_query].append((skill, freq))

    return dict(results)   # converting back to normal dict


def main():
    #TODO: set new_jobs_only to TRUE when setting up ETL job
    process_jobs(HOST, PORT, DBNAME, USER, PASSWORD, new_jobs_only=True)
    top_skills = top_skills_per_query(top_n=50)
    for query, skills in top_skills.items():
        print(f"Top skills for {query}:")
        for skill, freq in skills:
            print(f"----- {skill}: {freq}")


if __name__ == "__main__":
    main()
