#!/usr/bin/env python
# Name: Julian Evalle
# Student number: 11286369
# Program Template created by M.Prog UvA
#
# This program extracts specific information from the target URL and writes it
# to a CSV file
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

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
    + Runtime (only a number!)
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

        # isolates the rating from the current section
        for rating in section.find_all('strong'):

            # check if the string inside rating is a float/exists, else
            # appends N/A to the rating list
            try:
                float(rating.string)
                rating_list.append(rating.string)

            except:
                rating_list.append("N/A")

        # isolates year from the current section
        year = section.find("span", {"class": "lister-item-year text-muted unbold"})

        # check if a string can be extracted from year
        if year.string is None:
            year_list.append("N/A")

        else:
            # removes all parentheses from the string
            year = year.string.replace('(','').replace(')','')

            # check if two or more words exist in the string
            # selects the year part of the string
            if " " in year:
                year = year.split(" ")
                year = year[1]

            # check if the isolated year is numeric, else appends N/A
            # to the year_list
            if year.isnumeric():
                #print(stripped_year)
                year_list.append(year)

            else:
                year_list.append("N/A")

        # isolate actors/actresses to a list per movie
        actors = []
        for actor in section.find_all('a'):

            # extracts the link from actor
            url = actor.get('href')

            # check if the current link will redirect to an actor
            # and appends it to the actor list
            if "adv_li_st" in url:
                actors.append(actor.string)

        # check if any actors were found in the current section
        if not actors:
            actors = "N/A"

        # transforms the list in actors to a single string
        else:
            actors = ', '.join(actors)

        # appends the actors list to actors_list
        actors_list.append(actors)

        # isolates runtime from the current section
        if section.find_all("span", {"class": "runtime"}):
            runtime = section.find("span", {"class": "runtime"})

            # isolates the numeric part of the string and appends
            # it to the runtimes list
            splittime = runtime.string.split()
            runtimes.append(splittime[0])

        else:
            runtimes.append("N/A")

    # creates and fills the list that's going to be returned with
    # the extracted data
    full_details = []
    full_details.append(title_list)
    full_details.append(rating_list)
    full_details.append(year_list)
    full_details.append(runtimes)
    full_details.append(actors_list)

    return full_details

def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # define which list in the full_details list contains what information
    title_loc = 0
    rating_loc = 1
    year_loc = 2
    actors_loc = 4
    runtime_loc = 3

    # write all the extracted data to its respective column
    for index in range(50):
        writer.writerow([movies[title_loc][index],
                        movies[rating_loc][index],
                        movies[year_loc][index],
                        movies[actors_loc][index],
                        movies[runtime_loc][index]])

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
