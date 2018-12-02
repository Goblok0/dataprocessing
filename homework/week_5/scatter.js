/* Made by: Julian Evalle
 * Opdr: D3 Scatter
 *
 * data obtained from:
 * - http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015
 * - http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015
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
  // console.log(wis)
  // console.log(wisCountryNames)

  var wisCountries = {}
  for (let index in Object.keys(wisSeries)){
    var countryName = `${wisCountryNames[index]["id"]}`
    var countryData = wisSeries[`0:${index}`]["observations"]
    wisCountries[countryName] = countryData
  }
  // console.log(wisCountries)

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
  // console.log(cConfCountries)

  var countryDict = {}
  for (let country of Object.keys(cConfCountries)){
    // console.log(country)
    var countryArray = []
    for (let i = 0; i < 9; i++){
        var year = i + 2007
        var wisInYear = parseInt(wisCountries[country][i])
        var cConfInYear = parseInt(cConfCountries[country][i])
        if (isNaN(wisInYear) || isNaN(cConfInYear)){
            console.log(wisInYear)
            console.log(cConfInYear)
            continue
        }

        countryArray.push([country, year, wisInYear, cConfInYear])
    }
    // console.log(countryArray)
    countryDict[country] = countryArray
  }
  // console.log(countryDict)
  // contains the data of all countries in one array
  countriesArray = []
  for (let country of Object.keys(countryDict)){
      for (let key of countryDict[country]){
          countriesArray.push(key)
      };
  };
  // console.log(countriesArray)


  var width = 500
  var height = 500

  // corresponds to the variable in the array [country, year, wisInYear, cConfInyear]
  var xVar = 1
  var yVar = 2
  var colourVar = 0

  pad = {
    top: height * 0.1,
    bottom: height * 0.2,
    left: width* 0.15,
    right: width * 0.05
  };

  var wChart = width - pad.left - pad.right;
  var hChart = height - pad.bottom - pad.top;

  var selCountry = "FRA"
  var selCountryData = countryDict[`${selCountry}`]
  var selData = countriesArray
  // var selData = selCountryData
  // console.log(selData)


  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)

  svg.append("rect")
     .attr("width", "100%")
     .attr("height", "100%")
     .attr("fill", "grey")
     .attr("opacity", 0.1);


  // isolates the lowest data value from the data
  var minY = d3.min(selData, function(d){
                            return d[yVar];
                          });
  // console.log(minY)
  // isolates the highest data value from the data
  var maxY = d3.max(selData, function(d){
                             return d[yVar];
                           });
  // console.log(maxY)
  // isolates the starting year from the data
  var minX = d3.min(selData, function(d){
                             return d[xVar];
                           });
  // console.log(minX)
  // isolates the last year from the data
  var maxX = d3.max(selData, function(d){
                              return d[xVar];
                            });
  // console.log(maxX)

  // rescales the x-values to the size of the graph
  var xScale = d3.scaleLinear()
             .domain([minX, maxX])
             .range([pad.left, wChart - pad.right]);
  // rescales the y-values to the size of the graph
  var yScale = d3.scaleLinear()
             .domain([0, maxY])
             .range([height - pad.bottom, pad.top]);


  var circles = svg.selectAll("circle")
                   .data(selData)
                   .enter()
                   .append("circle")

  circles.attr("cx", function(d){
                 return xScale(d[xVar]);
                 })
         .attr("cy", function(d){
                    return yScale(d[yVar]);
                 })
         .attr("r", 5)
         .attr("opacity", 1)
         .attr("fill", function(d) {
                       var colour = colourPicker(colourVar, d[0])
                        return colour;
                        })
         .attr("data-legend",function(d) {
                        return d})


    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickFormat(d3.format("d"));
    var yAxis = d3.axisLeft()
                  .scale(yScale);

    // creates the X-axis
    svg.append("g")
       .attr("transform", "translate("+ 0 + ","
                                      + (height - pad.bottom) + ")")
       .call(xAxis);
    // creates the Y-axis
    svg.append("g")
       .attr("transform", "translate("+ (pad.left * 0.8) + ","
                                      + 0 + ")")
       .call(yAxis);

    svg.append("g")

    var legData = new Set();
    for (let key of selData){
        legData.add(key[colourVar])
    }
    legData = Array.from(legData)

    var legend = svg.selectAll(".legend")
                    .data(legData)
                    .enter()
                    .append("g")
                    .attr("class","legend")
                    .attr("transform", function(d,i) {
                          var legX = width - pad.right*4
                          var legY = pad.top
                          return "translate(" + legX + "," + legY + ")"
                    })
                    .style("font-size","12px")

        legend.append('rect')
              .attr('width', width-(pad.right * 17))
              .attr('height', legData.length * 16)
              .attr("x", 5)
              .attr("y", -10)
              .style('fill', "white")
              .style('stroke', "black")
              .attr("opacity", 0.05);

        legend.append("rect")
              .attr('width', 10)
              .attr('height', 10)
              .attr('x', 20)
              .attr('y', function(d,i){
                         var y = i * 15 - 6
                         return y
              })
              .attr("fill", function(d) {
                    colour = colourPicker(colourVar, d)
                    return colour;
                  });


        legend.append('text')
          .attr('x', 50)
          .attr('y', function(d,i){
                     var y = i * 15 + 3
                     return y
          })
          .text(function(d) { return d;})

        svg.append("text")
           .attr("transform", "translate(" + (width * 0.5) + ","
                                           + (height * 0.05) + ")")
           .style("text-anchor", "middle")
           .text(getTitle(xVar, yVar, colourVar));
        // creates the X-axis label
        svg.append("text")
           .attr("transform", "translate(" + width * 0.5 + ","
                                           + (height * 0.99) + ")")
           .style("text-anchor", "middle")
           .text(getAxisLabel(xVar));
        // creates the Y-axis label
        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", width * 0.025)
           .attr("x", 0 - (height / 2))
           .style("text-anchor", "middle")
           .text(getAxisLabel(yVar));

};
// countries FRA: France, NLD: Netherlands, PRT:Portugal, DEU: Germany, GBR: United Kingdom, KOR: Korea

const colourPicker = function(colourVar, d){
  var colourArray =  ['#a50026','#d73027','#f46d43','#fdae61','#fee090',
                      '#e0f3f8','#abd9e9','#74add1','#4575b4','#313695']

  if (colourVar == 0){
      var countryColour = {
        "FRA": 0,
        "NLD": 1,
        "PRT": 2,
        "DEU": 3,
        "GBR": 4,
        "KOR": 5
      }
      var colour = colourArray[countryColour[d]]
  }

  return colour
}
// [country, year, wisInYear, cConfInyear]
const getAxisLabel = function(xyVar){
  let labelArray = ["Countries", "Year",
                    "Percentage of women in Science(%)",
                    "Consumer Confidence Index"]
  let label = labelArray[xyVar]
  return label
}
const getTitle = function(xVar, yVar, colourVar){
  let xLabel = getAxisLabel(xVar)
  let yLabel = getAxisLabel(yVar)
  let cLabel = getAxisLabel(colourVar)

  return `The ${yLabel} over ${xLabel} per ${cLabel}`
}
