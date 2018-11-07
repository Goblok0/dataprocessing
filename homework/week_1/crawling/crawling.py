#!/usr/bin/env python
# Name: Julian Evalle
# Student number: 11286369
# Template made by: M.Prog UvA
#
# this program searches through the top 250 movies on IMDB and extracts certain
# details per movie and places it in a CSV file
"""
This script crawls the IMDB top 250 movies.
"""

import os
import csv
import codecs
import errno

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# global constants
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Utility functions (no need to edit):


def create_dir(directory):
    """
    Create directory if needed.
    Args:
        directory: string, path of directory to be made
    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    """

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already existing backup directory
            # are not handled, so the exception is re-raised and the
            # script will crash here.
            raise


def save_csv(filename, rows):
    """
    Save CSV file with the top 250 most popular movies on IMDB.
    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    """
    Save HTML to file.
    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file
    """

    with open(filename, 'wb') as f:
        f.write(html)


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


def main():
    """
    Crawl the IMDB top 250 movies, save CSV with their information.
    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    """

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print('Setting up backup dir if needed ...')
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print('Access top 250 page, making backup ...')
    top_250_html = simple_get(TOP_250_URL)
    top_250_dom = BeautifulSoup(top_250_html, "lxml")

    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print('Scraping top 250 page ...')
    url_strings = scrape_top_250(top_250_dom)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print('Scraping movie %d ...' % i)

        # Grab web page
        movie_html = simple_get(url)

        # Extract relevant information for each movie
        movie_dom = BeautifulSoup(movie_html, "lxml")
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print('Saving CSV ...')

    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:

def scrape_top_250(soup):
    """
    Scrape the IMDB top 250 movies index page.
    Args:
        soup: parsed DOM element of the top 250 index page
    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    """
    movie_urls = set()
    # beginning of the movie link
    link = "https://www.imdb.com"

    # searches for all movielinks one the page
    for title in soup.find_all('a'):
        url = title.get('href')

        # check if an url was extracted
        if url == None:
            pass
        # check if the url refers to moviepage
        elif "chttp_tt" in url:
            # completes the url to the moviepage
            complete_url = link + url
            movie_urls.add(complete_url)

    return movie_urls


def scrape_movie_page(dom):
    """
    Scrape the IMDB page for a single movie
    Args:
        dom: BeautifulSoup DOM instance representing the page of 1 single
            movie.
    Returns:
        A list of strings representing the following (in order):
        +title,
        +year,
        +duration,
        +genre(s) (semicolon separated if several),
        +director(s)(semicolon separated if several),
        +writer(s) (semicolon separated if several),
        +actor(s) (semicolon separated if several),
        +rating,
        +number of ratings.
    """
    # finds the title on the moviepage
    title = dom.find('h1')

    # extracts the title part of the found text
    split_title = title.text.split("(")
    title = split_title[0].strip()

    # extracts the year part of the found text
    year = split_title[1]
    year = year.replace(")","")

    # extracts the year of release from the moviepage
    time = dom.find('time')
    time = time.text.strip()

    # extracts the genres from the movie page
    genres = set()

    # ensures only the genres from the genres on the top of the page
    # are isolated
    title_wrapper = dom.find('div',{"class": "title_wrapper"})

    # searches through the isolated title_wrapper
    for genre in title_wrapper.find_all("a"):
        url = genre.get('href')

        # check if the url contains something
        if url == None:
            continue

        # check if the url involves a link to a genre
        elif "genres" in url:
            genre = genre.text.strip()
            genres.add(genre)

    # joins the found genres to one string
    genres = '; '.join(genres)

    directors = []
    writers = []
    stars = []

    # isolates the part of the page with staff info
    people_wrapper = dom.find('div',{"class": "plot_summary_wrapper"})
    for person in people_wrapper.find_all('a'):
        url = person.get('href')

        # check if the url contains something
        if url == None:
            continue

        # check if the found url refers to a director's page
        elif "tt_ov_dr" in url:
            director = person.text.strip()
            directors.append(director)

        # check if the found url refers to a writer's page
        elif "tt_ov_wr" in url:
            writer = person.text.strip()
            writers.append(writer)

        # check if the found url refers to an actors/actresses's page
        elif "tt_ov_st_sm" in url:
            star = person.text.strip()
            stars.append(star)

    # removes the non-names from their respective list
    if "credit" in directors[-1]:
        del directors[-1]

    if "credit" in writers[-1]:
        del writers[-1]

    if "cast & crew" in stars[-1]:
        del stars[-1]

    # joins the lists to one string
    directors = '; '.join(directors)
    writers = '; '.join(writers)
    stars = '; '.join(stars)

    # finds the rating of the movie on the page
    rating = dom.find('span',{"itemprop": "ratingValue"})
    rating = rating.string

    # finds the rating count of the movie on the page
    rating_num = dom.find('span',{"itemprop": "ratingCount"})
    rating_num = rating_num.string

    # combines all the found information to one list
    movie_details = []
    movie_details.append(title)
    movie_details.append(year)
    movie_details.append(time)
    movie_details.append(genres)
    movie_details.append(directors)
    movie_details.append(writers)
    movie_details.append(stars)
    movie_details.append(rating)
    movie_details.append(rating_num)

    return movie_details


if __name__ == '__main__':

    main()
