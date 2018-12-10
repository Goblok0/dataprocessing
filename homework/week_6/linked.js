// http://sharkattackfile.net/
// https://discovery.opendatasoft.com/explore/dataset/global-shark-attack-c/export/

// data = d3.json("shark.json")
var dataGlob = []
window.onload = function() {
    // decodes the JSON file
    // var worldmap = "http://bl.ocks.org/micahstubbs/raw/8e15870eb432a21f0bc4d3d527b2d14f/a45e8709648cafbbf01c78c76dfa53e31087e713/world_countries.json";
    var requests = [d3.json("shark.json"), d3.json("worldmap.json")];

    // ensures that all data is loaded properly before calling any functions
    Promise.all(requests).then(function(response) {
        // preprocesses the data
        console.log(response)
        dataGlob = preProcess(response);
        console.log(dataGlob[0])
        chloroSetUp(dataGlob[0])
        }).catch(function(e){
                 throw(e);
                 });

        // creates the graph with the data
        // makeGraph(dataGlob[0], dataGlob[1]);

};
const preProcess = function(sharkData){
  var dataDict = {}
  var worldArray = []
  // console.log(sharkData[0])
  sharkData = sharkData[0]
  for (index in Object.keys(sharkData)){
      // console.log(index)
      // console.log(sharkData[index])
      var data = sharkData[index]["fields"]

      var country = data["country"]
      var activity = data["activity"]
      var sex = data["sex"]

      var date = data["date"]
      var time = data["time"]
      var year = data["year"]

      var type = data["type"]
      var fatal = data["fatal_y_n"]

      dataList = [country, activity, sex, year, date, time, type, fatal]
      // dictEntry = {"country": country,
      //              "activity": activity,
      //              "sex": sex,
      //              "year": year,
      //              "date": date,
      //              "time": time,
      //              "type": type,
      //              "fatal": fatal}

      if (!(`${country}` in dataDict)){
        dataDict[country] = []
      }
      // dataDict[country].push(dictEntry)
      dataDict[country].push(dataList)

  }
  idCount = 0
  for (country of Object.keys(dataDict)){
      // console.log(country)
      worldArray.push({"id": idCount,
                       "name": country,
                       "value": dataDict[country].length})
      idCount += 1
  }
  // console.log(worldArray)
  return [worldArray, dataDict]
}

const chloroSetUp = function(data){
    width = 960
    height = 600

    pad = { top: height * 0.1,
            bottom: height * 0.2,
            left: width* 0.15,
            right: width * 0.05
          };
    var color = d3.scaleThreshold()
                  .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
                  .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

    var path = d3.geoPath();

    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append('g')
                .attr('class', 'map');

    var projection = d3.geoMercator()
                       .scale(130)
                       .translate( [width / 2, height / 1.5]);

    var path = d3.geoPath()
                 .projection(projection);
    svg.call(tip);
    makeChloro()
}
const makeChloro = function(){
      // http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f

}
