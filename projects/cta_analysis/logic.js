var geojson = "data/CTA_RailLines.geojson";
var ridership = "data/ridership_by_line_year.csv";

var globalRiderData = {};
var widthScale;
var myMap;

Promise.all([
  d3.json(geojson),
  d3.csv(ridership),
]).then(([geoData, riderData]) => {

  riderData.forEach(row => {
    var key = row.variable.toLowerCase();
    globalRiderData[key] = globalRiderData[key] || {};
    for (let i = 2001; i < 2018; i++) {
      globalRiderData[key][i] = +row[i];
    }
  });

  widthScale = generateScale(globalRiderData, "absolute");

  geoData = processGeoJSON(geoData);

  var linesLayer = L.geoJSON(geoData, {
    style: feature => ({color: feature.properties.line, opacity: 0.75})
  })

  createSlider();
  createLinesMap(linesLayer);
  
  // initialize each route's data
  d3.selectAll("path.leaflet-interactive")
    .datum(function() {
      var color = this.getAttribute("stroke");
      return globalRiderData[color];
    })

  updateLineWidth(); // call to initialize
});

function processGeoJSON(data) {
  var newData = Object.create(data);
  newData.features = []
  
  var colors = ["red", "blue", "brown", "purple", "green", "orange", "pink", "yellow"];
  var lines, newFeature;
  colors.forEach(color => {

    data.features.forEach(feature => {
      lines = feature.properties.LINES.toLowerCase();
      if (lines.includes(color)) {
        newFeature = JSON.parse(JSON.stringify(feature)); // clone feature
        newFeature.properties.line = color;
        newData.features.push(newFeature);
      }
    })
  })
  return newData;
}

function generateScale(data, mode="absolute") {
  
  var vals = d3.values(globalRiderData).map(d => d3.values(d));

  if (mode === "absolute") {

    var vals = [].concat.apply([], vals);
    var range = d3.extent(vals); 
    
    return function(val, color) {
      return d3.scaleLinear()
        .domain(range)
        .range([0.5, 25])(val);
    }
  } else if (mode === "relative") {

    var keys = d3.keys(globalRiderData);
    var ranges = vals.map(d => d3.extent(d))
    var mapping = {}
    for (let i = 0; i < keys.length; i++) {
      mapping[keys[i]] = ranges[i]
    }

    return function(val, color) {
      return d3.scaleLinear()
        .domain(mapping[color])
        .range([10, 10 * mapping[color][1] / mapping[color][0]])(val)
    }

  } else {
    console.error("Invalid scale type specified");
  }
}

function createSlider() {
  var slider = document.getElementById('slider');
  noUiSlider.create(slider, {
    start: 1,
    range: {
      'min': 2001,
      'max': 2017
    },
    step: 1,
    tooltips: true,
    format: {
      from: value => value.replace(".00", ""),
      to: value => value,
    }
  });
  slider.noUiSlider.on('change', updateLineWidth);
}

function updateLineWidth() {
  var slider = document.getElementById('slider');
  var year = +slider.noUiSlider.get();

  d3.selectAll("path.leaflet-interactive")
    .transition()
    .attr("stroke-width", (d, i, sel) => {
      var color = sel[i].getAttribute("stroke");
      return widthScale(d[year], color);
    })
}

function createLinesMap(linesLayer) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ"); // public access token

  var overlays = {
  "CTA Lines": linesLayer
  }

  // Create a new map
  myMap = L.map("map", {
  center: [
    41.9091, -87.6298
  ],
  zoom: 11,
  layers: [streetmap, linesLayer]
  });

  L.control.slider({position: "topright"}).addTo(myMap);

  var attribution = L.control.attribution({prefix: false})
  attribution.addAttribution("<a href='methodology.html'>Attributions and Methodology</a>")
  attribution.addTo(myMap);
}