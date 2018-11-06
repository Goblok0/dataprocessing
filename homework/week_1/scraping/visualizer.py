#!/usr/bin/env python
# Name: Julian Evalle
# Student number: 11286369
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
# data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}
data_dict = {int(key): [] for key in range(START_YEAR, END_YEAR)}

with open(INPUT_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        #print(row['Title'], row['Year'])
        year = int(row['Year'])
        rating = float(row['Rating'])

        data_dict[year].append(rating)

x = data_dict.keys()
y = []

for year in range(START_YEAR, END_YEAR):
    # print(year)
    avg = round(sum(data_dict[year]) / len(data_dict[year]), 2)
    y.append(avg)

plt.plot(x,y)
plt.axis([2007.80, 2017.20, 7.5, 10])

for x,y in zip(x,y):
    plt.text(x-0.1,y+0.1,str(y))

plt.ylabel('avg rating')
plt.xlabel('year')

if __name__ == "__main__":
    # print(data_dict)
    plt.show()
