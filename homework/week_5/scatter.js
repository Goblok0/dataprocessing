/* Made by: Julian Evalle
 * Opdr: D3 Scatter
 *
 * data obtained from:
 * - http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015
 * - http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015
 *
 * This programme creates a scatterplot from specifically structured datasets
 * gained over API and the input from the dropdown menu 
 *
 * notitie naar nakijker: github geeft een foutmelding over externe bronnen als
 * ik de HTML daar probeer te runnen
 * Mixed Content: The page at 'https://goblok0.github.io/dataprocessing/homework/week_5/scatter.html' was loaded over HTTPS, but requested an insecure resource 'http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015'. This request has been blocked; the content must be served over HTTPS.d3.js:5908 Mixed Content: The page at 'https://goblok0.github.io/dataprocessing/homework/week_5/scatter.html' was loaded over HTTPS, but requested an * *
 * insecure resource 'http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015'. This request has been blocked; the content must be served over HTTPS
 */


var dataGlob = [];
window.onload = function() {
    // obtain datasets
    var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015";
    var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015";
    // decodes the JSON files from the sources
    var requests = [d3.json(womenInScience), d3.json(consConf)];

    // ensures that all data is loaded properly before calling any functions
    Promise.all(requests).then(function(response) {
        // preprocesses the data
        dataGlob = preProcess(response);
        // creates the graph with the data
        makeGraph(dataGlob[0], dataGlob[1]);
        }).catch(function(e){
                 throw(e);
                 });
};

// preprocesses the data to a dict with countryinfo seperated and
// an all including array
const preProcess = function(data){
  // extracts "Women in Science"(WIS) data
  var wis = data[0];
  var wisSeries = wis["dataSets"]["0"]["series"];
  var wisCountryNames = wis["structure"]["dimensions"]["series"]["1"]["values"];
  // formats the wis-data
  var wisCountries = extractWisData(wisSeries, wisCountryNames);

  // extracts the "Consumer confidence"(cConf) data
  var cConf = data[1];
  var cConfSeries = cConf["dataSets"]["0"]["series"];
  var cConfCountryNames = cConf["structure"]["dimensions"]["series"]["0"]["values"];
  // formats the cConf-data
  var cConfCountries = extractCConfData(cConfSeries, cConfCountryNames);

  // reorganizes the data seperated between countries
  countryDict = makeCountryDict(wisCountries, cConfCountries);

  // adds all of the data in countryDict to a single array
  countriesArray = [];
  for (let country of Object.keys(countryDict)){
      for (let key of countryDict[country]){
          countriesArray.push(key);
      };
  };

  // returns the country seperated object and the array with all the country data
  return [countryDict, countriesArray];
};

// creates the graph
const makeGraph = function(countryDict, countriesArray){

    // defines the size of the SVG
    var width = 600;
    var height = 600;

    // obtains the values from the dropdown menu
    // obtains the value used for obtaining the x-values
    var xVar = document.getElementById("selXVar");
    var xVar = parseInt(xVar.options[xVar.selectedIndex].value);
    // obtains the value used for obtaining the y-values
    var yVar = document.getElementById("selYVar");
    var yVar = parseInt(yVar.options[yVar.selectedIndex].value);
    // obtains the value used for deciding what the colours represent
    var colourVar = document.getElementById("selColourVar");
    var colourVar = colourVar.options[colourVar.selectedIndex].value;

    // check if a valid selection is given from the drop-down menu's
    if (isNaN(xVar)||isNaN(yVar)){
        var xVar = 1;
        var yVar = 2;
        var colourVar = 0;
    };

    // defines what data to use, (specific country:all countries)
    var selData = (isNaN(parseInt(colourVar))) ? (countryDict[colourVar]):
                                                 (countriesArray);

    // defines the padding for the graph
    pad = {
      top: height * 0.1,
      bottom: height * 0.2,
      left: width* 0.15,
      right: width * 0.05
    };

    // defines the size of the chart
    var wChart = width - pad.left - pad.right;
    var hChart = height - pad.bottom - pad.top;

    // creates the SVG element in the html-body
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    // creates the background of the SVG-element
    svg.append("rect")
       .attr("width", "100%")
       .attr("height", "100%")
       .attr("fill", "grey")
       .attr("opacity", 0.1);


    // isolates the lowest data value of the Y-Variables
    var minY = d3.min(selData, function(d){
                               return d[yVar];
                               });
    // isolates the highest data value of the Y-variables
    var maxY = d3.max(selData, function(d){
                               return d[yVar];
                               });
    // isolates the lowest data values from the X-Variables
    var minX = d3.min(selData, function(d){
                               return d[xVar];
                               });
    // isolates the highest data values from the X-Variables
    var maxX = d3.max(selData, function(d){
                               return d[xVar];
                               });

    // rescales the x-values to the size of the graph
    var xScale = d3.scaleLinear()
                   .domain([minX, maxX])
                   .range([pad.left, wChart - pad.right]);
    // rescales the y-values to the size of the graph
    var yScale = d3.scaleLinear()
                   .domain([0, maxY])
                   .range([height - pad.bottom, pad.top]);

    // obtains all details from each circle made
    var circles = svg.selectAll("circle")
                     .data(selData)
                     .enter()
                     .append("circle");

    // gives attributes to the created circles
    circles.attr("cx", function(d){
                       return xScale(d[xVar]);
                       })
           .attr("cy", function(d){
                       return yScale(d[yVar]);
                       })
           .attr("r", 5)
           .attr("opacity", 1)
           .attr("fill", function(d){
                         var colour = colourPicker(colourVar, d[colourVar])
                         return colour;
                         })
           .attr("data-legend",function(d){
                               return d;
                               });

    // defines the scale for the X-variable
    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickFormat(d3.format("d"));
    // defines the scale for the Y-variable
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

    // extracts the data for the legend from the selected data
    var legData = new Set();
    for (let key of selData){
        legData.add(key[colourVar]);
    };
    // turns the set into an array
    legData = Array.from(legData);

    // creates the legend-element
    var legend = svg.selectAll(".legend")
                    .data(legData)
                    .enter()
                    .append("g")
                    .attr("class","legend")
                    .attr("transform", function(d,i) {
                                       var legX = width - pad.right*4
                                       var legY = pad.top
                                       return "translate(" + legX + ","
                                                           + legY + ")"
                                       })
                    .style("font-size","12px");
    // creates the background for the legend
    legend.append('rect')
          .attr('width', 75)
          .attr('height', legData.length * 16)
          .attr("x", 5)
          .attr("y", -10)
          .style('fill', "white")
          .style('stroke', "black")
          .attr("opacity", 0.05);

    // creates the square-colour symbol in the legend
    legend.append("rect")
          .attr('width', 10)
          .attr('height', 10)
          .attr('x', 20)
          .attr('y', function(d,i){
                     var y = i * 15 - 6;
                     return y;
                     })
          .attr("fill", function(d) {
                        colour = colourPicker(colourVar, d)
                        return colour;
                        });
    // creates the description beloning to each square symbol in the legend
    legend.append('text')
      .attr('x', 50)
      .attr('y', function(d,i){
                 var y = i * 15 + 3;
                 return y;
                 })
      .text(function(d){
        // check if colourVar represents a single country
        var legText = (isNaN(parseInt(colourVar))) ? colourVar:d;
        return legText;});

    // creates the title of the plot
    svg.append("text")
       .attr("transform", "translate(" + (width * 0.5) + ","
                                       + (height * 0.05) + ")")
       .style("text-anchor", "middle")
       .text(getTitle(xVar, yVar, colourVar));
    // creates the X-axis label
    svg.append("text")
       .attr("transform", "translate(" + width * 0.45 + ","
                                       + (height * 0.89) + ")")
       .style("text-anchor", "middle")
       .text(getAxisLabel(xVar));
    // creates the Y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", width * 0.05)
       .attr("x", 0 - (height / 2))
       .style("text-anchor", "middle")
       .text(getAxisLabel(yVar));
};

// Calls upon makegraph with newly inserted dropdown variables
const updateData = function(){
    // obtains the value from selXVar dropdown menu
    var xVar = document.getElementById("selXVar");
    var xVar = parseInt(xVar.options[xVar.selectedIndex].value);
    // obtains the values from the selYVar dropdown menu
    var yVar = document.getElementById("selYVar");
    var yVar = parseInt(yVar.options[yVar.selectedIndex].value);
    // check if both values ar viable, else gives an alert
    if (isNaN(xVar)||isNaN(yVar)){
        return alert("One of the chosen variables is invalid");
    };
    // removes the previously made chart
    d3.select("svg").remove();
    // creates the graph with the new X-Y-Colour variables
    makeGraph(dataGlob[0], dataGlob[1]);
};

// returns a colour depending on which colour variable is selected
const colourPicker = function(colourVar, d){
  // colourselection obtained from http://colorbrewer2.org
  var colourArray =  ['#a50026','#d73027','#f46d43','#fdae61','#fee090',
                      '#e0f3f8','#abd9e9','#74add1','#4575b4','#313695'];
  // colourdictionary used when the colourvar represents a country
  var countryColour = { "FRA": 0,
                        "NLD": 1,
                        "PRT": 2,
                        "DEU": 3,
                        "GBR": 4,
                        "KOR": 5
                      };
  // picks a colour from the colourArray
  // if the selected colour is for all the countries
  if (colourVar == 0){
      var colour = colourArray[countryColour[d]];
  }
  // if the selected colour represents years
  else if (colourVar == 1) {
      var colour = colourArray[d-2007];
  }
  // if the selected colour is a singular country
  else {
      var colour = colourArray[countryColour[colourVar]];
  };
  // returns the colour picked from the colourArray
  return colour;
};

// creates the dictionary with the country as key and the WIS-data as values
const extractWisData = function(wisSeries, wisCountryNames){
  let wisCountries = {};
  // goes through all the countries in wisseries and adds the data to a dict
  // with the country as key and the arrays as values
  for (let index in Object.keys(wisSeries)){
    var countryName = `${wisCountryNames[index]["id"]}`;
    var countryData = wisSeries[`0:${index}`]["observations"];
    wisCountries[countryName] = countryData;
  };
  // returns the created dictionary
  return wisCountries;
};

// creates the dictionary with the country as key and the cConf-data as values
const extractCConfData = function(cConfSeries, cConfCountryNames){
  let cConfCountries = {};
  // goes through all the countries in cConfseries and adds the data to a dict
  // with the country as key and the arrays as values
  for (let index in Object.keys(cConfSeries)){
    var countryName = `${cConfCountryNames[index]["id"]}`;
    var countryData = cConfSeries[`${index}:0:0`]["observations"];
    cConfCountries[countryName] = countryData;
  };
  // returns the created dictionary
  return cConfCountries;
};

// combines the data of cConfCountries and wisCountries
const makeCountryDict = function(wisCountries, cConfCountries){
  let countryDict = {};
  // goes through both dictionaries and adds the data to the new dict
  for (let country of Object.keys(cConfCountries)){
    var countryArray = [];
    for (let i = 0; i < 9; i++){
        var year = i + 2007;
        var wisInYear = parseInt(wisCountries[country][i]);
        var cConfInYear = parseInt(cConfCountries[country][i]);
        // checks if any data is lacking in the current year
        if (isNaN(wisInYear) || isNaN(cConfInYear)){
            continue;
        };

        countryArray.push([country, year, wisInYear, cConfInYear]);
    };
    countryDict[country] = countryArray;
  };
  return countryDict;
};

// returns a string for the label, depending on what's chosen in the dropdown
const getAxisLabel = function(xyVar){
  let labelArray = ["Country", "Year",
                    "Percentage of women in Science(%)",
                    "Consumer Confidence Index"];
  let label = labelArray[xyVar];
  return label;
};

// returns the title composed of axis labels
const getTitle = function(xVar, yVar, colourVar){
  let xLabel = getAxisLabel(xVar);
  let yLabel = getAxisLabel(yVar);
  // check if the colourVar represents a single country and returns
  // a slightly altered title string
  if (isNaN(parseInt(colourVar))) {
    let cLabel = colourVar;
    return `The ${yLabel} over ${xLabel} in ${cLabel}`;
  }
  else {
    let cLabel = getAxisLabel(colourVar);
    return `The ${yLabel} over ${xLabel} per ${cLabel}`;
  };
};
