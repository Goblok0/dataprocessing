# Made by: Julian Evalle
#
# This program converts a CSV file to a JSON file with the values in each
# row being assigned to a row dictionary with the header as key per column
# in that row


import csv
import json

INPUT_CSV = "data.csv"

# converts the CSV file to a JSON string
def convert():
    tot_dict = {}
    # opens the CSV file
    with open(INPUT_CSV, 'r') as input_file:
        reader = csv.DictReader(input_file)
        # assigns each column in the row to a row dictionary with
        # the header of that columns as a key
        for id, row in enumerate(reader):
            # check if the row contains any data
            if row:
                sub_dict = {}
                # goes through each column with a header in the row
                for header in list(reader.fieldnames):
                    sub_dict[header] = row[header]
                    tot_dict[id] = sub_dict
    # creates a new JSON file and converts the tot_dict into it
    with open('data.json', 'w') as outfile:
        json.dump(tot_dict, outfile)

if __name__ == "__main__":
    convert()
