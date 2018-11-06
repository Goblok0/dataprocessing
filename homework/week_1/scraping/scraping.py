#!/usr/bin/env python
# Name: Julian Evalle
# Student number: 11286369
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

import re

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    + Title
    + Rating
    + Year of release (only a number!)
    + Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    title_list = []
    rating_list = []
    year_list = []
    runtimes = []
    actors_list = []
    for section in dom.find_all('div', {"class": "lister-item mode-advanced"}):

        # isolates the titles
        for title in section.find_all('a'):
            url = title.get('href')
            if "adv_li_tt" in url:
                #print(link.string)
                title_list.append(title.string)

        # isolates the rating
        # excerpt for-loop
        for rating in section.find_all('strong'):
            print(rating.string)
            #print(rating)

            try:
                float(rating.string)
                rating_list.append(rating.string)

            except:
                rating_list.append("N/A")

        # isolates years
        # print(section.find_all("span", {"class": "lister-item-year text-muted unbold"}))

        for year in section.find_all("span", {"class": "lister-item-year text-muted unbold"}):

            if year.string is None:
                year_list.append("N/A")

            else:
                year = year.string.replace('(','').replace(')','')

                if " " in year:
                    year = year.split(" ")
                    year = year[1]

                if year.isnumeric():
                    #print(stripped_year)
                    year_list.append(year)

                else:
                    year_list.append("N/A")

        # isolate actors/actresses to a list per movie
        actors = []
        for actor in section.find_all('a'):
            url = actor.get('href')

            if "adv_li_st" in url:
                #print(actor.string)
                actors.append(actor.string)

        if not actors:
            actors = "N/A"

        else:
            actors = ', '.join(actors)

        actors_list.append(actors)

        # isolates runtime
        if section.find_all("span", {"class": "runtime"}):
            for runtime in section.find_all("span", {"class": "runtime"}):
                # print(runtime.string)
                splittime = runtime.string.split()
                # print(splittime[0])
                runtimes.append(splittime[0])

        else:
            runtimes.append("N/A")




    print(len(title_list))
    print(len(rating_list))
    # print(year_list)
    print(len(year_list))
    print(len(runtimes))
    print(len(actors_list))

    full_details = []
    full_details.append(title_list)
    full_details.append(rating_list)
    full_details.append(year_list)
    full_details.append(runtimes)
    full_details.append(actors_list)

    print(len(full_details))
    return full_details


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    title_loc = 0
    rating_loc = 1
    year_loc = 2
    actors_loc = 4
    runtime_loc = 3

    for index in range(50):
        # print(detail)
        writer.writerow([movies[title_loc][index],
                        movies[rating_loc][index],
                        movies[year_loc][index],
                        movies[actors_loc][index],
                        movies[runtime_loc][index]])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE MOVIES TO DISK


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
