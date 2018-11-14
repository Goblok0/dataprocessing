import csv
import pandas as pd
import matplotlib.pyplot as plt
import json

OUTPUT_CSV = 'countries.csv'
INPUT_CSV = 'input.csv'


def load():
    """
    Loads and preprocesses the relevant data from the input file and writes
    it to a new CSV file.
    Makes a pandas dataframe from the the newly made CSV file
    """
    # creates new output file
    with open(OUTPUT_CSV, 'w', newline='') as output_file:

        # writes headers into output file
        writer = csv.writer(output_file)
        writer.writerow(['Country', 'Region', 'Pop.Density(per s. mi.)',
                         'Infant mortality (per 1000 births)',
                         'GDP ($ per capita) dollars'])

        # opens input file
        with open(INPUT_CSV, newline="") as input_file:
            reader = csv.DictReader(input_file)
            # skips the header
            next(reader, None)
            # iterates through input file and extracts specific data
            for row in reader:
                # check if the current row contains something
                if row:
                    # extracts the relevant data in the row
                    country = row['Country']
                    region = row['Region']
                    pop_density = row['Pop. Density (per sq. mi.)']
                    mortality = row['Infant mortality (per 1000 births)']
                    GDP = row['GDP ($ per capita) dollars']

                    # check if any of the row are empty
                    if not (country and region and pop_density
                            and mortality and GDP):
                        continue
                    # check if any of the relevant columns have missing data
                    if "unknown" in (pop_density, mortality, GDP):
                        continue

                    # replaces the commas in the string and
                    # converts the values to floats
                    pop_density = pop_density.replace(",", ".")
                    pop_density = float(pop_density)
                    mortality = mortality.replace(",", ".")
                    mortality = float(mortality)
                    # isolates the numerical value in the string
                    GDP = GDP.split(" ")
                    GDP = int(GDP[0])

                    # writes the info to a new row in the output file
                    writer.writerow([country, region, pop_density,
                                     mortality, GDP])

    # creates a pandas dataframe from the output file and returns it
    with open(OUTPUT_CSV, 'r', newline='') as output_file:
        df = pd.read_csv(output_file)

    return df


def GDP_details(df):
    """
    Isolates GDP data from the dataframe and calculates the mean, median, mode
    and standard deviation and creates a histogram of the GDP data
    """

    # isolates the GDP column from the dataframe
    df_GDP = df['GDP ($ per capita) dollars']
    # removes the outlier of this specific dataframe
    df_GDP = df_GDP.drop(df_GDP.idxmax())

    # calculates the mean, median, mode and
    # standard deviations from the GDP data
    GDP_mean = round(df_GDP.mean(), 2)
    GDP_median = df_GDP.median()
    GDP_mode = df_GDP.mode().get(0)
    GDP_std = round(df_GDP.std(), 2)

    # prints the calculated values
    print(f"The mean of the GDP is {GDP_mean}")
    print(f"The median of the GDP is {GDP_median}")
    print(f"The mode of the GDP is {GDP_mode}")
    print(f"The standard deviation of the GDP is {GDP_std}")

    # plots the values to a histogram
    df_GDP.plot.hist(14)
    # draw the mean and median vertical lines in the histogram
    line1 = plt.axvline(GDP_mean, color='b', linestyle='dashed', linewidth=1)
    line2 = plt.axvline(GDP_median, color='r', linestyle='dashed', linewidth=1)
    # create legend and labels
    plt.legend((line1, line2), ('mean', 'median'))
    plt.xlabel('GDP ($ per capita) dollars')

    plt.show()


def mortality_details(df):
    """
    isolates the mortality data from the dataframe and extracts the minimum,
    maximum, median and the quantiles from the data and creates a boxplot
    """

    # isolates mortality column from input file
    df_mort = df['Infant mortality (per 1000 births)']

    # creates the boxplot of the data
    df_mort.plot.box()

    # finds the lowest and highest mortality values
    mort_min = df_mort.min()
    mort_max = df_mort.max()
    # calculates the quantiles of the current dataframe
    mort_quantiles = df_mort.quantile([0.25, 0.75])
    firts_quantile = mort_quantiles.get(0.25)
    mort_median = df_mort.median()
    third_quantile = mort_quantiles.get(0.75)

    # writes the calculated data into the plot
    plt.text(0.55, mort_min - 3, "min: " + str(mort_min))
    plt.text(0.55, mort_max - 3, "max: " + str(mort_max))
    plt.text(1.1, firts_quantile - 3, "1st quar.: " + str(firts_quantile))
    plt.text(1.1, mort_median - 3, "median: " + str(mort_median))
    plt.text(1.1, third_quantile - 3, "3rd quar.: " + str(third_quantile))

    # writes the labels and title
    plt.ylabel('mortality/1000 births')

    plt.show()


def convert(df):
    """
    Changes the dataframe data to a dictionary format and converts it
    to a json file
    """
    # opens the previously made CSV file
    with open(OUTPUT_CSV, 'r', newline='') as csv_file:
        # reads the CSV file
        reader = csv.DictReader(csv_file)
        total_dict = {}
        # adds the country details to a dictionary with the country name
        # as a key in the total_dict
        for row in reader:
            country = row['Country']
            country_dict = {
                "Region": row['Region'],
                "Pop. Density(per sq. mi.)": row['Pop.Density(per s. mi.)'],
                "Infant mortality (per 1000 births)":
                row['Infant mortality (per 1000 births)'],
                "GDP": row['GDP ($ per capita) dollars']
                }
            total_dict[f"{country}"] = country_dict

    # converts and saves the total_dict to a JSON file
    with open('data.json', 'w') as outfile:
        json.dump(total_dict, outfile)


if __name__ == "__main__":
    df = load()
    GDP_details(df)
    mortality_details(df)
    convert(df)
