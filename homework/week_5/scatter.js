/* Made by: Julian Evalle
 * Opdr: D3 Scatter
 */


window.onload = function() {
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    process(response);
  }).catch(function(e){
    throw(e);
  });
};

const process = function(data){
  // console.log(data)
  // per country[0-8: 2007-2015]

  // women in science
  // countries: FRA: France, DEU: Germany, KOR: Korea, NLD: Netherlands, PRT: Portugal, GBR: United Kingdom
  wis = data[0]
  wisSeries = wis["dataSets"]["0"]["series"]
  wisCountryNames = wis["structure"]["dimensions"]["series"]["1"]["values"]
  console.log(wis)
  // console.log(wisCountryNames)

  wisCountries = {}
  for (let index in Object.keys(wisSeries)){
    var countryName = `${wisCountryNames[index]["id"]}`
    var countryData = wisSeries[`0:${index}`]["observations"]
    wisCountries[countryName] = countryData
  }
  console.log(wisCountries)

  // frequency
  // countries FRA: France, NLD: Netherlands, PRT:Portugal, DEU: Germany, GBR: United Kingdom, KOR: Korea
  cConf = data[1]
  cConfSeries = cConf["dataSets"]["0"]["series"]
  cConfCountryNames = cConf["structure"]["dimensions"]["series"]["0"]["values"]
  // console.log(wisSeries)
  // console.log(cConfCountryNames)

  cConfCountries = {}
  for (let index in Object.keys(cConfSeries)){
    var countryName = `${cConfCountryNames[index]["id"]}`
    var countryData = cConfSeries[`${index}:0:0`]["observations"]
    cConfCountries[countryName] = countryData
  }
  console.log(cConfCountries)

  dataArray = []



};
