#!/usr/bin/env python
# Name:
# Student number:
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
    link = "https://www.imdb.com"

    for title in soup.find_all('a'):
        url = title.get('href')
        # print(title)
        if url == None:
            pass
        elif "chttp_tt" in url:
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
    # YOUR SCRAPING CODE GOES HERE:
    # Return everything of interest for this movie (all strings as specified
    # in the docstring of this function).

    title = dom.find('h1')

    split_title = title.text.split("(")
    title = split_title[0].strip()

    year = split_title[1]
    year = year.replace(")","")

    time = dom.find('time')
    time = time.text.strip()

    genres = set()
    title_wrapper = dom.find('div',{"class": "title_wrapper"})
    for genre in title_wrapper.find_all("a"):
        url = genre.get('href')

        if url == None:
            continue

        elif "genres" in url:
            genre = genre.text.strip()
            genres.add(genre)

    genres = '; '.join(genres)

    directors = []
    writers = []
    stars = []

    people_wrapper = dom.find('div',{"class": "plot_summary_wrapper"})
    for person in people_wrapper.find_all('a'):
        url = person.get('href')

        if url == None:
            continue

        elif "tt_ov_dr" in url:
            director = person.text.strip()
            directors.append(director)

        elif "tt_ov_wr" in url:
            writer = person.text.strip()
            writers.append(writer)

        elif "tt_ov_st_sm" in url:
            star = person.text.strip()
            stars.append(star)

    if "credit" in directors[-1]:
        del directors[-1]

    if "credit" in writers[-1]:
        del writers[-1]

    if "cast & crew" in stars[-1]:
        del stars[-1]

    directors = '; '.join(directors)
    writers = '; '.join(writers)
    stars = '; '.join(stars)

    rating = dom.find('span',{"itemprop": "ratingValue"})
    rating = rating.string

    rating_num = dom.find('span',{"itemprop": "ratingCount"})
    rating_num = rating_num.string

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

def save_csv(outfile, movies):

    with open(filename, 'w', newline='', encoding='utf-8') as f:

        writer = csv.writer(f)
        writer.writerow(['title', 'runtime', 'genre(s)', 'directors', 'writer(s)',
                        'actor(s)', 'rating(s)', 'number of rating(s)'])

        title_loc = 0
        year_loc = 1
        runtime_loc = 2
        genres_loc = 3
        directors_loc = 4
        writers_loc = 5
        actors_loc = 6
        rating_loc = 7
        rate_num_loc = 8

        for index in range(len(movies)):
            writer.writerow([movies[index][title_loc],
                            movies[index][runtime_loc],
                            movies[index][genres_loc],
                            movies[index][directors_loc],
                            movies[index][writers_loc],
                            movies[index][actors_loc],
                            movies[index][rating_loc],
                            movies[index][rate_num_loc]])

if __name__ == '__main__':
    # error when using main():
        # Traceback (most recent call last):
        #   File "crawling.py", line 284, in <module>
        #     main()  # call into the progam
        #   File "crawling.py", line 123, in main
        #     top_250_dom = BeautifulSoup(top_250_html, "lxml")
        #   File "C:\Users\rejev\AppData\Local\Programs\Python\Python37-32\lib\site-packages\beautifulsoup4-4.6.3-py3.7.egg\bs4\__init__.py", line 246, in __init__
        #     elif len(markup) <= 256 and (
        # TypeError: object of type 'NoneType' has no len()
    main()
    # html = simple_get(TOP_250_URL)
    #
    #
    # # parse the HTML file into a DOM representation
    # dom = BeautifulSoup(html, 'html.parser')
    #
    # # extract the movies (using the function you implemented)
    # movie_urls = scrape_top_250(dom)
    #
    # movies = []
    # for movie in movie_urls:
    #
    #     html = simple_get(movie)
    #     # parse the HTML file into a DOM representation
    #     dom = BeautifulSoup(html, 'html.parser')
    #     movie_details = scrape_movie_page(dom)
    #     movies.append(movie_details)
    #
