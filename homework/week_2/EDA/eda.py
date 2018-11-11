import csv
import pandas as pd
import matplotlib.pyplot as plt
import json

OUTPUT_CSV = 'countries.csv'
INPUT_CSV = 'input.csv'

def load():
    # open file
    # index_list = []
    with open(OUTPUT_CSV, 'w', newline='') as output_file:

        writer = csv.writer(output_file)
        writer.writerow(['Country', 'Region', 'Pop.Density(per s. mi.)',
                         'Infant mortality (per 1000 births)',
                         'GDP ($ per capita) dollars'])

        with open(INPUT_CSV, newline="") as input_file:
            reader = csv.DictReader(input_file)
            for row in reader:
                if row:
                    # isolates the year and rating variables from the current row
                    country = row['Country']
                    region = row['Region']
                    pop_density = row['Pop. Density (per sq. mi.)']
                    mortality = row['Infant mortality (per 1000 births)']
                    GDP = row['GDP ($ per capita) dollars']

                    if ("Pop" in pop_density or "Infant" in mortality
                        or "GDP" in GDP):
                        continue

                    if not pop_density or pop_density == "unknown":
                        continue
                    if not mortality or mortality == "unknown":
                        continue
                    if not GDP or GDP == "unknown":
                        continue

                    pop_density = pop_density.replace(",",".")
                    pop_density = float(pop_density)

                    mortality = mortality.replace(",",".")
                    mortality = float(mortality)

                    GDP = GDP.split(" ")
                    GDP = int(GDP[0])

                    # index_list.append(country)

                    if country and region and pop_density and mortality and GDP:

                        writer.writerow([country, region, pop_density, mortality, GDP])
    with open(OUTPUT_CSV, 'r', newline='') as output_file:
        df = pd.read_csv(output_file)

    return df

def GDP_details(df):

    # print(df)
    df_GDP = df['GDP ($ per capita) dollars']
    GDP_mean = df_GDP.mean()
    GDP_median = df_GDP.median()
    GDP_mode = df_GDP.mode()
    GDP_std = df_GDP.std()

    # print(f"The mean of the GDP is {GDP_mean}")
    # print(f"The median of the GDP is {GDP_median}")
    # print(f"The mode of the GDP is {GDP_mode}")
    # print(f"The standard deviation of the GDP is {GDP_std}")

    df_GDP.plot.hist(100)
    plt.show()

def mortality_details(df):

    df_mort = df['Infant mortality (per 1000 births)']
    df_mort.plot.box()

    mort_min = df_mort.min()
    plt.text(0.55, mort_min-3, "min: " + str(mort_min))

    mort_max = df_mort.max()
    plt.text(0.55, mort_max-3, "max: " + str(mort_max))

    mort_quantiles = df_mort.quantile([0.25, 0.75])
    firts_quantile = mort_quantiles.get(0.25)
    plt.text(1.1, firts_quantile-3, "1st quar.: " + str(firts_quantile))

    mort_median = df_mort.median()
    plt.text(1.1, mort_median-3, "median: " + str(mort_median))

    third_quantile = mort_quantiles.get(0.75)
    plt.text(1.1, third_quantile-3, "3rd quar.: " + str(third_quantile))

    plt.show()

def convert(df):

    df.to_json('output.txt')
    # for row in df:
    #     country = row['Country']
    #     region = row['Region']
    #     pop_density = row['Pop. Density (per sq. mi.)']
    #     mortality = row['Infant mortality (per 1000 births)']
    #     GDP = row['GDP ($ per capita) dollars']

        # row.to_json()*


if __name__ == "__main__":
    df = load()
    GDP_details(df)
    mortality_details(df)
    convert(df)
