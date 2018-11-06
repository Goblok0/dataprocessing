#!/usr/bin/env python
# Name: Julian Evalle
# Student number: 11286369
# Program Template created by M.Prog UvA
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {int(key): [] for key in range(START_YEAR, END_YEAR)}

# opens the CSV file created by scraping.py
with open(INPUT_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    # goes through each row in the CSV file and appends all individual
    # ratings to its respective year
    for row in reader:
        # isolates the year and rating variables from the current row
        year = int(row['Year'])
        rating = float(row['Rating'])

        # adds the rating as a value to the data_dict dictionary
        data_dict[year].append(rating)

# creates the lists for the x and y coordinate
x = data_dict.keys()
y = []

for year in range(START_YEAR, END_YEAR):
    # calculates the average rating for each year in the data_dict
    avg = round(sum(data_dict[year]) / len(data_dict[year]), 2)

    # appends the calculated average to the y list
    y.append(avg)

# plots the x and y axis values from the x and y lists
plt.plot(x,y)

# narrows down the values on the x and y axis
plt.axis([2007.80, 2017.20, 7.5, 10])

# adds the numerical value of each point above themselves in the graph
for x,y in zip(x,y):
    plt.text(x - 0.1, y + 0.1, str(y))

# creates the labels
plt.ylabel('avg rating')
plt.xlabel('year')

if __name__ == "__main__":
    # print(data_dict)
    plt.show()
