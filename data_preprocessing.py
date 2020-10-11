# download dataset from toronto open data
!curl -o "COVID19 cases.csv" https://ckan0.cf.opendata.inter.prod-toronto.ca/download_resource/e5bf35bc-e681-43da-b2ce-0242d00922ad?format=csv

# import libraries and dataset
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt

#import covid-19 cases per neighbourhood
file = pd.read_csv("COVID19 cases.csv")
covid = pd.DataFrame(file['Neighbourhood Name'].value_counts()).reset_index().rename(columns = {'index':'Neighbourhood','Neighbourhood Name':'Cases'})

#import neighbourhood profile
profile = pd.read_csv("neighbourhood-profiles-2016-csv.csv")

#import geojson boundary file 
geo = gpd.read_file("Neighbourhoods.json")[['AREA_NAME','geometry']]


# RRENAME THE NEIGHBOURHOODS CONSISTENTLY ACROSS ALL THREE DATASETS

# begin by removing all bracketed numbers in the geo dataset
geo['AREA_NAME'] = [i[0] for i in geo["AREA_NAME"].str.split(" \(")]

covid_names = covid['Neighbourhood'].sort_values().values
profile_names = profile.columns[6:].sort_values().values
geo_names = geo['AREA_NAME'].sort_values().values

# "COMPARING COVID AND GEO"
for i in range(140):
    if covid_names[i]!=geo_names[i]:
        print(covid_names[i],i,geo_names[i])
        covid['Neighbourhood'].replace(covid_names[i],geo_names[i],inplace=True)

# "COMPARING NHOOD-PROFILE AND GEO"
for i in range(140):
    if profile_names[i]!=geo_names[i]:
        print(profile_names[i],i,geo_names[i])
        profile.rename(columns={profile_names[i]:geo_names[i]},inplace=True)

# GET 2016 POPULATION OF NEIGHBOURHOODS
population = profile[profile['Characteristic'] == 'Population, 2016'].drop(["_id","Category","Data Source","Characteristic","Topic"],axis=1).transpose().rename(columns={2:"Population"})

# Convert strings to numbers
population['Population'] = population['Population'].replace({",":""},regex=True).astype(int)

# COMBINE POPULATION DATASET WITH COVID DATASET TO MAKE PERCAPITA CASE DATASET
covid = covid.set_index("Neighbourhood")
perCapitaCovid = 100*covid['Cases']/population['Population']
covid['perCapita'] = perCapitaCovid
covid['Population'] = population['Population']

# GET THE AVERAGE INCOME OF NEIGHBOURHOOD
avgIncome = profile.iloc[2354:2355].drop(["_id","Category","Data Source","Characteristic","Topic"],axis=1).transpose().rename(columns={2354:"AVG_INC"})

# Convert strings to numbers
avgIncome['AVG_INC'] = avgIncome['AVG_INC'].replace({",":""},regex=True).astype(int)

# Merge Average Income Data with COVID Cases Data
income_covid = pd.merge(avgIncome[1:],covid,left_index=True,right_index=True)
income_covid_map = pd.merge(geo,income_covid,left_on = 'AREA_NAME',right_index=True)
income_covid_map = gpd.GeoDataFrame(income_covid_map,geometry="geometry")
income_covid_map.crs={'init':'epsg:4326'}

# CONVERT CASES AND INCOME TO LOGARITHMIC FOR COLORSCALE
import numpy as np
income_covid_map['log_AVG_INC'] = np.log(income_covid_map['AVG_INC'])
income_covid_map['log_Cases'] = np.log(income_covid_map['Cases'])
income_covid_map['log_perCapita'] = np.log(income_covid_map['perCapita'])

# Export Processed Data as JSON
income_covid_map.to_file("IncomeCases.json",orient = 'records', driver='GeoJSON')