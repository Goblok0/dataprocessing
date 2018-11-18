#dataset: https://data.world/popculture/imdb-5000-movie-dataset
import csv
import json

INPUT_CSV = "IMDB.csv"

def convert():
    tot_dict = {}
    with open(INPUT_CSV, 'r') as input_file:
        reader = csv.DictReader(input_file)

        # id = 0
        for id, row in enumerate(reader):
            if row:
                sub_dict = {}
                for header in list(reader.fieldnames):
                    sub_dict[header] = row[header]
                    tot_dict[id] = sub_dict
                    # id += 1

    with open('data.json', 'w') as outfile:
        json.dump(tot_dict, outfile)

if __name__ == "__main__":
    convert()
