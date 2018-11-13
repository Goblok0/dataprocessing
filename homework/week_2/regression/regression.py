import csv
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn import linear_model

OUTPUT_CSV = 'agriculture.csv'
INPUT_CSV = 'input.csv'

def load():

    # creates new output file
    with open(OUTPUT_CSV, 'w', newline='') as output_file:

        # writes headers into output file
        writer = csv.writer(output_file)
        writer.writerow(['Country', 'Region', 'Arable (%)', 'Agriculture'])

        # opens input file
        with open(INPUT_CSV, newline="") as input_file:
            reader = csv.DictReader(input_file)

            # skips the header
            next(reader, None)

            # iterates through input file and extracts specific data
            for row in reader:

                # check if the current row contains something
                if row:

                    # isolates the year and rating variables from the current row
                    country = row['Country']
                    region = row['Region']
                    arable = row['Arable (%)']
                    agriculture = row['Agriculture']

                    # check if the row is empty
                    if not (country and region and arable and agriculture):
                        continue

                    # check if all of the relevant columns contain data
                    if "unknown" in (arable, agriculture):
                        continue

                    # replaces the commas in the string and converts the values to floats
                    arable = arable.replace(",",".")
                    arable = float(arable)

                    agriculture = agriculture.replace(",",".")
                    agriculture = float(agriculture)

                    # writes the info to a new row in the output file
                    writer.writerow([country, region, arable, agriculture])

    with open(OUTPUT_CSV, 'r', newline='') as output_file:
        df = pd.read_csv(output_file)

    return df

def regression(df):

    data = pd.read_csv("agriculture.csv")
    matrix= np.matrix(data)
    x,y = matrix[:,2], matrix[:,3]
    x = np.array(x)
    y = np.array(y)
    x,y = x.reshape(-1,1), y.reshape(-1,1)

    lm = linear_model.LinearRegression()
    model = lm.fit(x,y)
    m = model.coef_[0][0]
    b = model.intercept_[0]

    print(f"formula: y = {m}x + {b}")

    #draw line
    plt.plot([0, 60], [b, m*100+b], color='r',linestyle='-', linewidth=1)
    plt.scatter(x[:,0], y[:,0], color= 'c', s=2)

    plt.xlabel('percentage arable land')
    plt.ylabel('amount of agraculture in the economic sector')
    plt.title('correlation between the amount of arable land and agraculture')

    plt.show()



    # print(x)
    # print(y)

if __name__ == "__main__":
    df = load()
    regression(df)
