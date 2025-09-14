import psycopg2
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# DB CRED
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")


def get_recent_listings(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):
    
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)


    query = """
            SELECT job_title, employer_name, apply_link, search_query 
            FROM job_listings
            WHERE date_posted = CURRENT_DATE - INTERVAL '1 day'
            """
    
    df = pd.read_sql(query, conn)

    conn.close()

    return df
    
# MAIN
def main():

    df = get_recent_listings()

    print(df)


# RUN
if __name__ == "__main__":
    main()