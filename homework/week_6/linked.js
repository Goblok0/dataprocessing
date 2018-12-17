/* Made by: Julian Evalle
 * Opdr: Linked Views
 *
 * This programme creates a interactable chloropleth map and bar chart
 *
 * data obtained from:
 * - https://discovery.opendatasoft.com/explore/dataset/global-shark-attack-c/export/
 *
 * Note to begeleider: de "UO" achter de radio buttons staat voor unordered,
 * omdat ik niet de tijd had om een manier te implementeren om ze te ordenen
 * verder geven ze problemen met grote data zoals die van USA, wat betreft labeling
 * Dus sex, type and fatal zijn werkende opties, de overige keuzes heb ik erin
 * gelaten omdat ze bij kleinere landen nog enige data kunnen weergeven.
 * Verder lukte het me niet om de opzet van scaleBand neer te zetten voor de
 * x-labels in de barchart, dus ik heb het mogelijk op een minder efficiente manier opgezet
 */


// define globally obtainable data
var dataGlob = [];
// loads in the data when page is opened
window.onload = function() {
    // decodes the JSON file
    var requests = [d3.json("shark.json"), d3.json("worldmap.json")];
    // ensures that all data is loaded properly before calling any functions
    Promise.all(requests).then(function(response) {
        // preprocesses the data
        dataGlob = preProcess(response);
        // sets up the chloropleth map
        chloroSetUp(dataGlob[0], dataGlob[2]);
    }).catch(function(e){
             throw(e);
             });
};
// preprocesses the data
const preProcess = function(sharkData) {

  var worldArray = [];
  worldmap = sharkData[1];
  sharkData = sharkData[0];
  // extracts from the JSON to a dict
  var dataDict = makeDict(sharkData);
  // copies data from dataDict to a chloropleth usable structure
  for (country of Object.keys(dataDict)){
      worldArray.push({"name": country,
                       "value": dataDict[country].length});
  };
  return [worldArray, dataDict, worldmap];
}
// creates the chloropleth map
const chloroSetUp = function(data, worldmap) {

    d3.select("body")
      .append("p")
      .text("Julian Evalle, 11286369, opdr Linked Views, Data obtained from:" +
            "https://discovery.opendatasoft.com/explore/dataset/global-shark-attack-c/export/");
    d3.select("body")
      .append("p")
      .text("");
    d3.select("body")
      .append("p")
      .text("Credit to: Alan Dunning, Tooltip:" +
            "https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7");
    d3.select("body")
      .append("p")
      .text("Credit to: Micah Stubbs, Chlorograph v4 code:" +
            "http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f ");
    d3.select("body")
      .append("p")
      .text("Prevalence of shark attacks in the world")
      .style("font-size","50px")

    // set dimensions for chloropleth SVG
    var width = 1500;
    var height = 600;
    // find lowest and highest values of the world data
    var worldMin = d3.min(data, function(d){
                               return d.value;
                               });
    var worldMax = d3.max(data, function(d){
                                return d.value;
                                });
    // set scaler for alpha colour
    var colScale = d3.scaleLinear()
                     .domain([worldMin, 150])
                     .range([0.3, 1]);
    // creates svg element for the chloropleth map
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append('g')
                .attr('class', 'map');
    // makes legend data for the chloropleth map
    var legData = [[0, "Low amount of recorded shark attacks"],
                   [100, "~100 recorded shark attack"],
                   [150, "150+ recorded amounts of shark attacks"]]
    // creates legend element
    var legend = svg.selectAll(".legend")
                    .data(legData)
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d,i) {
                                       var legX = 993
                                       var legY = 265
                                       return "translate(" + legX + ","
                                                           + legY + ")"
                                       })
                    .style("font-size","20px");
    // creates the background for the legend
    legend.append('rect')
          .attr('width', 400)
          .attr('height', legData.length * 20)
          .attr("x", 0)
          .attr("y", -20)
          .style('fill', "white")
          .attr("opacity", 0.2)
          .style('stroke', "black");

    // creates the square-colour symbol in the legend
    legend.append("rect")
          .attr('width', 50)
          .attr('height', 20)
          .attr('x', 10)
          .attr('y', function(d,i){
                     var y = i * 15 - 15;
                     return y;
                     })
          .attr("fill", function(d) {
                        var colValue = colScale(d[0]);
                        var colour = `rgba(255,0,0,${colValue})`;
                        return colour;
                        });
    // creates the description beloning to each square symbol in the legend
    legend.append('text')
          .attr('x', 70)
          .attr('y', function(d,i){
                     var y = i * 15;
                     return y;
                     })
          .text(function(d){
                return d[1];
                });

    // sets dimensions for the svg of the barchart
    var svgChartW = width * 0.5;
    var svgChartH = height * 0.8;
    // creates svg for the barchart
    var svgChart = d3.select("body")
                     .append("svg")
                     .attr("width", svgChartW)
                     .attr("height", svgChartH);
    // sets background for the barchat svg
    svgChart.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "grey")
            .attr("opacity", 0.1)
            .attr('stroke', "black");

    // sets up the map of the chloropleth
    var projection = d3.geoMercator()
                       .scale(130)
                       .translate( [width * 0.3, height / 1.5]);
    var path = d3.geoPath()
                 .projection(projection);

    var attacksByCountry = {};
    var sharkAttacks = data;
    // merges the data to attacksByCountry dict
    sharkAttacks.forEach(function(d) {
                         attacksByCountry[d.name] = +d.value;
                         });
    worldmap.features.forEach(function(d) {
                              d.population = attacksByCountry[d["properties"]["name"]]
                              });
    // sets up the tooltip, credits to Alan Dunning
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "toolTip");
    // sets data to the countries
    svg.append("g")
       .attr("class", "countries")
       .selectAll("path")
       .data(worldmap.features)
       .enter().append("path")
               .attr("d", path)
               .style("fill", function(d) {
                               var value = attacksByCountry[d["properties"]["name"]];
                               // check the country has any data
                               if (value == undefined){
                                   var colour = "DarkGrey";
                               }
                               else{
                                   var colValue = colScale(value);
                                   var colour = `rgba(255,0,0,${colValue})`;
                               };
                               return colour;
                               })
               .style('stroke', 'white')
               .style('stroke-width', 1.5)
               .style("opacity", 0.8)
               // tooltips
               .style("stroke", "white")
               .style('stroke-width', 0.3)
               .on('mouseover',function(d){
                              tooltip.style("left", d3.event.pageX - 50 + "px")
                                     .style("top", d3.event.pageY - 70 + "px")
                                     .style("display", "inline-block")
                                     .html(`${d.properties.name}:` +
                                            `${d.population} records`);
                              d3.select(this)
                                .style("opacity", 1)
                                .style("stroke","black")
                                .style("stroke-width", 1);
                              })
               .on('mouseout', function(d){
                               tooltip.style("display", "none");
                               d3.select(this)
                                 .style("opacity", 0.8)
                                 .style("stroke", "white")
                                 .style("stroke-width", 0.3);
                               })
               // updates barchart when country is clicked on
               .on("click", function(d){
                            updateBars(dataGlob[1][d.properties.name], svgChart,
                                       svgChartW, svgChartH)
                            });

};
// creates and updates the barchart
const updateBars = function(data, svg, width, height) {
    // check if there is data to display
    if (data == undefined){
        return alert("No data for this country");
    };
    // check which if an option is selected from the radio buttons
    try{
        var selVar = parseInt(d3.select('input[name="option"]:checked').node().value);
    }
    catch(err){
        return alert("Not yet selected a variable from the radion buttons");
    };

    var xSet = new Set();
    var yDict = {};
    // array version of xSet
    // (Array.from(xSet) did not work, when I tried. worked in the previous assigment)
    var xList = [];
    // extracts x label data
    for (variable of data){
        xSet.add(variable[selVar]);
    };
    // gives numerical values to each xLabel and changes xSet to arrays
    // (Array.from(xSet) did not work, when I tried. worked in the previous assigment)
    for (variable of xSet){
        yDict[variable] = 0;
        xList.push([`${variable}`]);
    };
    // increments xLabel data
    for (variable of data){
        yDict[variable[selVar]]++;
    };
    // changes yDict values to a keyless array
    var valuesList = makeValuesList(yDict);

    // defines padding for the chart
    var pad = { top: height * 0.1,
                bottom: height * 0.3,
                left: width * 0.1,
                right: width * 0.1
              };
    // defines dimensions for the chart
    var chartW = width - pad.left - pad.right;
    var chartH = height - pad.top - pad.bottom;
    // takes maxValue from list
    var max = d3.max(valuesList, function(valuesList){
                                 return d3.max(valuesList);
                                 });
    // scales y values
    var yScale = d3.scaleLinear()
                   .domain([0, max])
                   .range([chartH, pad.top]);
    // sets tooltip for the bars
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "toolTip");
    // places bars in the chart
    var bars = svg.selectAll(".bar")
        					.remove()
        					.exit()
        					.data(valuesList);
    // defines attributes for the bars
    var barWidth = chartW / (xSet.size);
    bars.enter()
  		  .append("rect")
    		.attr("class", "bar")
    		.attr("x", function(d, i){
                   var xCor = i * barWidth + pad.left;
                   return xCor;
                   })
    		.attr("y", function(d){
                   return yScale(d[0]) + pad.bottom;
                   })
    		.attr("height", function(d){
                        return chartH - yScale(d[0]);
                        })
    		.attr("width", barWidth - 1)
    		.attr("fill", function(d, i){
    			            var colour = colourPicker(i);
    				          return colour;
    		              })
        // shows tooltip for the bar
        .on('mouseover',function(d){
                        tooltip.style("left", d3.event.pageX - 50 + "px")
                               .style("top", d3.event.pageY - 70 + "px")
                               .style("display", "inline-block")
                               .html(`${d[0]} record(s)`);
                        d3.select(this)
                          .style("opacity", 1)
                          .style("stroke", "black")
                          .style("stroke-width", 1);
                        })
        .on('mouseout', function(d){
                        tooltip.style("display", "none");
                        d3.select(this)
                          .style("opacity", 0.8)
                          .style("stroke", "white")
                          .style("stroke-width", 0.3);
                        });

    // removes previously made axis
    svg.selectAll(".axis")
			 .remove()
			 .exit();
    // sets y axis
    var yAxis = d3.axisLeft()
                  .scale(yScale);
    // creates the Y-axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate("+ (pad.left - 10) + ","
                                      + (height * 0.3) + ")")
       .call(yAxis);

    // removes title
    svg.selectAll(".title")
			 .remove()
			 .exit();
    // creates the title
    svg.append("text")
       .attr("class", "title")
       .attr("transform", "translate(" + (width * 0.5) + ","
                                       + (height * 0.2) + ")")
       .style("text-anchor", "middle")
       .text( function(d){
              var insert = getTitle(selVar);
              return `Victims of shark attacks by ${insert}`;
              })
       .style("font-size","30px");

    // removes y label
    svg.selectAll(".ylab")
			 .remove()
			 .exit();
    // creates the Y-axis label
    svg.append("text")
       .attr("class", "ylab")
       .attr("transform", "rotate(-90)")
       .attr("y", width * 0.04)
       .attr("x", 0 - (height * 0.65))
       .style("text-anchor", "middle")
       .text("Number of recorded occurences");

    // sets up x-labels
    var legend = svg.selectAll(".legend")
                    .remove()
                    .exit()
                    .data(xList)
                    .enter()
                    .append("g")
                    .attr("class","legend")
                    .attr("transform", function(d,i) {
                                       var legX = pad.left;
                                       var legY = height - pad.bottom;
                                       return "translate(" + legX + ","
                                                           + legY + ")";
                                       })
                    .style("font-size","15px");
   // places x-labels
   legend.append('text')
         .attr('x', function(d,i){
                    var xCor =  i * barWidth + (barWidth / 2);
                    return xCor;
                    })
         .attr('y', height * 0.25)
         .style("text-anchor", "middle")
         .text(function(d){
               // check if colourVar represents a single country
               text = `${d[0]}`
               return text;
               });
};
// changes the whole uppercase countries to a usable casing
const changeCase = function(country) {
    // check if data has a countryname
    if (country == undefined){
        return undefined;
    };
    country = country.split(" ");
    var casedCountry = [];
    // changes string to a proper casing
    for (word of country){
        var cased = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        casedCountry.push(cased);
    };
    casedCountry = casedCountry.join(" ");
    // check if current country is USA and sets proper casing
    if (casedCountry == "Usa"){
        casedCountry = "USA";
    };
    return casedCountry;
}
// extracts and restructures the inserted data
const makeDict = function(sharkData) {
    var dataDict = {};
    for (index in Object.keys(sharkData)){
        var data = sharkData[index]["fields"];
        var country = data["country"];
        // check if the countryname is present in the data
        if (country == undefined){
            continue;
        };
        var activity = data["activity"];
        var sex = data["sex"];
        var date = data["date"];
        var time = data["time"];
        var year = data["year"];
        var type = data["type"];
        var fatal = data["fatal_y_n"];
        // change the country string to a usable casing
        country = changeCase(country);
        var dataList = [country, activity, sex, year, date, time, type, fatal];
        // check if country has been previously encountered
        if (!(`${country}` in dataDict)){
            dataDict[country] = [];
        };
        dataDict[country].push(dataList);
    };
    return dataDict;
};
// creates the values list from the yDict
const makeValuesList = function(yDict) {
    var valuesList = [];
    // changes data from yDict to an ordered array
    for (key of Object.keys(yDict)){
        var inList = [];
        inList.push(yDict[key]);
        valuesList.push(inList);
    };
    return valuesList;
};
// returns a colour for the barchart
const colourPicker = function(i) {
  // colourselection obtained from http://colorbrewer2.org
  var index = i%5;
  var colourArray =  ['#a50026','#d73027','#f46d43','#fdae61','#fee090'];
  return colourArray[index];
};
// creates a title depending on the radio button variable
const getTitle = function(selVar) {
    let labelArray = ["-", "activity", "gender", "year", "date", "time",
                      "type", "fatalness"];
    let label = labelArray[selVar];
    return label;
};
