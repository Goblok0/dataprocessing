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

  // women researchers as a percentage of total researchers
  // countries: FRA: France, DEU: Germany, KOR: Korea, NLD: Netherlands, PRT: Portugal, GBR: United Kingdom
  var wis = data[0]
  var wisSeries = wis["dataSets"]["0"]["series"]
  var wisCountryNames = wis["structure"]["dimensions"]["series"]["1"]["values"]
  console.log(wis)
  // console.log(wisCountryNames)

  var wisCountries = {}
  for (let index in Object.keys(wisSeries)){
    var countryName = `${wisCountryNames[index]["id"]}`
    var countryData = wisSeries[`0:${index}`]["observations"]
    wisCountries[countryName] = countryData
  }
  console.log(wisCountries)

  // Consumer Confidence
  // countries FRA: France, NLD: Netherlands, PRT:Portugal, DEU: Germany, GBR: United Kingdom, KOR: Korea
  var cConf = data[1]
  var cConfSeries = cConf["dataSets"]["0"]["series"]
  var cConfCountryNames = cConf["structure"]["dimensions"]["series"]["0"]["values"]
  // console.log(wisSeries)
  // console.log(cConfCountryNames)

  var cConfCountries = {}
  for (let index in Object.keys(cConfSeries)){
    var countryName = `${cConfCountryNames[index]["id"]}`
    var countryData = cConfSeries[`${index}:0:0`]["observations"]
    cConfCountries[countryName] = countryData
  }
  console.log(cConfCountries)

  var countryDict = {}
  for (let country of Object.keys(cConfCountries)){
    console.log(country)
    var countryArray = []
    for (let i = 0; i < 9; i++){
        var year = i + 2007
        var wisInYear = parseInt(wisCountries[country][i])
        var cConfInYear = parseInt(cConfCountries[country][i])
        countryArray.push([country, year, wisInYear, cConfInYear])
    }
    console.log(countryArray)
    countryDict[country] = countryArray
  }
  console.log(countryDict)

  var width = 500
  var height = 500

  pad = {
    top: height * 0.05,
    bottom: height * 0.1,
    left: width* 0.1,
    right: width * 0.01
  };

  var wChart = width - pad.left - pad.right;
  var hChart = height - pad.bottom - pad.top;

  selCountry = "FRA"
  console.log(countryDict[`${selCountry}`])
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)

  svg.append("rect")
     .attr("width", "100%")
     .attr("height", "100%")
     .attr("fill", "grey")
     .attr("opacity", 1);


  circles = svg.selectAll("circle")
               .data(countryDict[`${selCountry}`])
               .enter()
               .append("circle")

  // isolates the lowest data value from the data
  var minWis = d3.min(countryDict[`${selCountry}`], function(d){
                            return d[2];
                          });
  // isolates the highest data value from the data
  var maxWis = d3.max(countryDict[`${selCountry}`], function(d){
                             return d[2];
                           });
  // isolates the starting year from the data
  var minYear = d3.min(countryDict[`${selCountry}`], function(d){
                             return d[1];
                           });
  // isolates the last year from the data
  var maxYear = d3.max(countryDict[`${selCountry}`], function(d){
                              return d[1];
                            });

  // rescales the x-values to the size of the graph
  var xScale = d3.scaleLinear()
             .domain([minYear, maxYear])
             .range([pad.left, wChart - pad.right]);
  // rescales the y-values to the size of the graph
  var yScale = d3.scaleLinear()
             .domain([0, maxWis])
             .range([hChart , pad.top]);


  circles.attr("cx", function(d){
                 return d[1];
                 })
         .attr("cy", function(d){
                    return d[2];
                 })
         .attr("r", 5)
         .attr("opacity", 1)
         .attr("fill", function(d) {
             // colScale works, but colour is only black or blue
             // return "rgb(0,0," + (colScale(d)) + ")"
                        return "black";
                        })

};
