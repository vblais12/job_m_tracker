import psycopg2
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# DB CRED
HOST = os.getenv("DB_HOST") or os.getenv("HOST")
PORT = os.getenv("DB_PORT") or os.getenv("PORT", "5432")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")


def get_recent_listings(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, location=None):
    
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)


    query = """
            SELECT job_title, employer_name, job_country, apply_link, search_query 
            FROM job_listings
            WHERE date_posted = CURRENT_DATE - INTERVAL '1 day'
            """
    
    df = pd.read_sql(query, conn)

    if location == "US":
        df = df[df["job_country"] == "US"]
    elif location == "CA":
        df = df[df["job_country"] == "CA"]

    
    conn.close()

    return df
    
# MAIN
def main():

    df = get_recent_listings()

    print(df)


# RUN
if __name__ == "__main__":
    main()