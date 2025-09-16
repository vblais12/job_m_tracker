import os
from dotenv import load_dotenv
from .data.skills_dic import US_CITIES, CA_CITIES
import requests
import psycopg2
import pandas as pd

load_dotenv()

API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = os.getenv("RAPIDAPI_HOST")

# DB CRED
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

# Creates salaries job table in DB
def create_salary_table(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)
    
    with conn.cursor() as c:

        c.execute("""
            CREATE TABLE IF NOT EXISTS salaries (
                  city TEXT,
                  role TEXT,
                  min_salary NUMERIC(12,2),
                  min_base_salary NUMERIC(12,2),
                  median_salary NUMERIC(12,2),
                  median_base_salary NUMERIC(12,2),
                  PRIMARY KEY (city, role)         
            )
        """)

    conn.commit()
    conn.close()


# Get salary data for top 10 cities
def fetch_salary(country: str, role: str, host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD):
    
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    url = "https://jsearch.p.rapidapi.com/estimated-salary"
    headers = {
        'x-rapidapi-key' : API_KEY,
        'x-rapidapi-host' : API_HOST
    }

    if country == "US":
        cities = US_CITIES
    elif country == "CA":
        cities = CA_CITIES
    else:
        return "Invalid country: {country}"

    salaries_counter = 0

    for city in cities:
        params = {
                "job_title": role,
                "location": city,
                "fields": ["min_salary", "min_base_salary", "median_salary", "median_base_salary"]
            }
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")
        
        data = response.json().get("data", [])

        try:
            with conn.cursor() as c:
                d_city = city
                d_role = role
                d_min_salary = data[0].get("min_salary")
                d_min_base_salary = data[0].get("min_base_salary")
                d_median_salary = data[0].get("median_salary")
                d_median_base_salary = data[0].get("median_base_salary")

                c.execute("""
                    INSERT INTO salaries (city, role, min_salary, min_base_salary, median_salary, median_base_salary)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (d_city, d_role, d_min_salary, d_min_base_salary, d_median_salary, d_median_base_salary))

                if c.rowcount > 0:
                    salaries_counter += 1
        
        except Exception as e:
            print(f"Error saving salary: {e}")
            continue

    print(f"Succesfully inserted salary info for {salaries_counter} cities in {country}, for {role}!")

    conn.commit()
    conn.close()

    return "Success!!"


# QUERY SALARIES FOR TESTING PURPOSES
def query_salaries(host=HOST, port=PORT, dbname=DBNAME, user=USER, password=PASSWORD, location=None):

    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)

    query = """
            SELECT city, role, min_salary, min_base_salary, median_salary, median_base_salary 
            FROM salaries
            """
    with conn.cursor() as c:
        c.execute(query)

        
        df = pd.read_sql(query, conn)

        if location == "US":
            cities = US_CITIES
            df = df[df["city"].isin(cities)]
        elif location == "CA":
            cities = CA_CITIES
            df = df[df["city"].isin(cities)]

    
    conn.close()
    return df


# MAIN
def main():

    df = query_salaries(location=None)

    print(df)



# Run
if __name__ == "__main__":
    main()