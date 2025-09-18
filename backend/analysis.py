import pandas as pd
from dotenv import load_dotenv
import os
import psycopg2
from backend.process_skills import top_skills_per_query
from backend.data.skills_dic import US_STATES, CA_PROV_TERR
import json

load_dotenv()

# DB CRED
HOST = os.getenv("DB_HOST") or os.getenv("HOST")
PORT = os.getenv("DB_PORT") or os.getenv("PORT", "5432")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")



# This function returns a dataframe with the number of job postings as per a given frequency (daily vs weekly vs monthly, etc...)
# Takes in a frequency argument, start and end date, and a group_by argument (default: search_query, to get job postings per role)
# Returns DF

#TODO: USE c.cursor() and row.fetchall() because pandas aint liking Postgres
def job_volume_over_time(
        host=HOST,
        port=PORT, 
        dbname=DBNAME, 
        user=USER, 
        password=PASSWORD,
        freq = "W",
        start_date = None,
        end_date = None,
        group_by = "search_query",
        dedupe = True,
        visualize = False,
):
    
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    params = []
    where = ["date_posted IS NOT NULL"]   # Make sure date not null and not an empty string
    
    if start_date:
        where.append("date_posted >= date(%s)")
        params.append(start_date)
    if end_date:
        where.append("date_posted <= date(%s)")
        params.append(end_date)

    count_expr = "COUNT(DISTINCT id)" if dedupe else "COUNT(*)"

    if group_by:
        allowed_groups = json.loads(os.getenv("ALLOWED_GROUPS", "[]"))
        if group_by not in allowed_groups:
            raise ValueError(f"Invalid group_by. Allowed: {allowed_groups}")
        sql = f"""
        SELECT date(date_posted) AS d, {group_by} AS group_key, {count_expr} AS job_count
        FROM job_listings
        WHERE {" AND ".join(where)}
        GROUP BY d, group_key
        ORDER BY d
        """

        
        df = pd.read_sql(sql, conn, params=params)
        conn.close()

        if df.empty:
            return pd.DataFrame(columns=["date", "job_count"])

        # Organize into 
        df["d"] = pd.to_datetime(df["d"])
        pivot = df.pivot(index="d", columns="group_key", values="job_count").fillna(0)

        if freq != "D":
            pivot = pivot.resample(freq).sum()

        result_df = pivot.reset_index().rename(columns={"d": "date"})
        
        
        return result_df
    
    
    else:
        print(f"Function called with no group_by param, exiting...")
        return None
        


# Function that returns top skills for each role 
# Returns a DF
def top_skills(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, role=None, top_k=10, visualize=False):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    # Get skills and frequency from job_skills table 
    query = """
    SELECT js.skill, COUNT(*) as freq
    FROM job_skills js
    """

    # if role parameter set, match with role and add to param 
    if role:
        query += " WHERE js.search_query ILIKE %s"
        params = (f"%{role}%",)
    else:
        params = ()

    # Group by skill, order by frequency and only get top k skills
    query += " GROUP BY js.skill ORDER BY freq DESC LIMIT %s"
    params += (top_k,)


    df = pd.read_sql(query, conn, params=params)
    conn.close()
    
    
    return df


# Function that returns count of on site vs remote jobs
# Returns a DF
def remote_vs_onsite(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, visualize=False):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    query = """
        SELECT
            CASE
                WHEN job_is_remote = 'true' THEN 'Remote'
                ELSE 'Onsite/Hybrid'
            END as work_type,
            COUNT(*) as count
        FROM job_listings
        GROUP BY work_type
    """

    df = pd.read_sql(query, conn)
    conn.close()


    return df


# Analyze and visualize the geographic distribution of jobs
def geographic_distribution(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, location=None):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)
    
    query = """
        SELECT job_state, COUNT(*) as job_count
        FROM job_listings
        WHERE job_state != 'Remote'
        GROUP BY job_state
        ORDER BY job_count DESC
    """
    
    df = pd.read_sql(query, conn)

    if location == "US":
        states = US_STATES
        df = df[df["job_state"].isin(states)]
    elif location == "CA":
        prov_terr = CA_PROV_TERR
        df = df[df["job_state"].isin(prov_terr)]


    conn.close()
    
    return df

# MAIN
def main():
    # Job volume
    pass

if  __name__ == "__main__":
    main()