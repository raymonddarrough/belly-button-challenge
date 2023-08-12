// Belly Button Biodiversity - app.js

// Color palette for Gauge Chart
var arrColorsG = ["#5899DA", "#E8743B", "#19A979", "#ED4A7B", "#945ECF", "#13A4B4", "#525DF4", "#BF399E", "#6C8893", "white"];

// Define the data URL
var dataUrl = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Function to fetch data
function fetchData(url) {
  return d3.json(url);
}

// Function to build metadata panel
function buildMetadata(sample) {
  fetchData(dataUrl).then((data) => {
    var metadata = data.metadata;
    var result = metadata.find(sampleobject => sampleobject.id == sample);

    var panel = d3.select("#sample-metadata");
    panel.html(""); // Clear previous content

    Object.entries(result).forEach(([key, value]) => {
      panel.append("h6").text(`${key}: ${value}`);
    });
  }).catch((error) => {
    console.error("Error while fetching metadata:", error);
  });
}

// Build the Gauge Chart
function gaugeChart(data) {
  if (data.wfreq === null) {
    data.wfreq = 0;
  }

  let level = parseFloat(data.wfreq) * 20; // Calculate the angle in degrees (0-180)
  let degrees = 180 - level;
  let radius = 0.5;
  let radians = (degrees * Math.PI) / 180;

  let x = radius * Math.cos(radians);
  let y = radius * Math.sin(radians);

  let mainPath = 'M -.0 -0.025 L .0 0.025 L ';
  let pathX = String(x);
  let space = ' ';
  let pathY = String(y);
  let pathEnd = ' Z';
  let path = mainPath.concat(pathX, space, pathY, pathEnd);

  let trace = [{
      type: 'scatter',
      x: [0], y: [0],
      marker: { size: 50, color: '2F6497' },
      showlegend: false,
      name: 'WASH FREQ',
      text: data.wfreq,
      hoverinfo: 'text+name'
    },
    {
      values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition: 'inside',
      textfont: {
        size: 16
      },
      marker: {
        colors: [...arrColorsG]
      },
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '2-1', '0-1', ''],
      hoverinfo: 'text',
      hole: 0.5,
      type: 'pie',
      showlegend: false
    }
  ];

  let layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '#2F6497',
      line: {
        color: '#2F6497'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> <b>Scrub Per Week</b>',
    height: 550,
    width: 550,
    xaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', trace, layout, { responsive: true });
}

// Build a Gauge Chart
function buildGaugeChart(sample) {
  console.log("sample", sample);

  d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then(data => {
    var objs = data.metadata;
    //console.log("objs", objs);

    var matchedSampleObj = objs.filter(sampleData =>
      sampleData["id"] === parseInt(sample));
    //console.log("buildGaugeChart matchedSampleObj", matchedSampleObj);

    gaugeChart(matchedSampleObj[0]);
  }).catch((error) => {
    console.error("Error while fetching gauge chart data:", error);
  });
}

// Function to build bubble and bar charts
function buildCharts(sample) {
  fetchData(dataUrl).then((data) => {
    var samples = data.samples;
    var result = samples.find(sampleobject => sampleobject.id == sample);

    var ids = result.otu_ids;
    var labels = result.otu_labels;
    var values = result.sample_values;

    // Build a Bubble Chart
    var layoutBubble = {
      margin: { t: 0 },
      xaxis: { title: "OTU ID" },
      hovermode: "closest"
    };

    var dataBubble = [{
      x: ids,
      y: values,
      text: labels,
      mode: "markers",
      marker: {
        color: ids,
        size: values
      }
    }];

    Plotly.newPlot("bubble", dataBubble, layoutBubble);

    // Build a Bar Chart
    var barData = [{
      y: ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(),
      x: values.slice(0, 10).reverse(),
      text: labels.slice(0, 10).reverse(),
      type: "bar",
      orientation: "h"
    }];

    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      margin: { t: 30, l: 150 }
    };

    Plotly.newPlot("bar", barData, barLayout);
  }).catch((error) => {
    console.error("Error while fetching bubble and bar chart data:", error);
  });
}

// Initialize the dashboard
function init() {
  var selector = d3.select("#selDataset");

  fetchData(dataUrl).then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector.append("option").text(sample).property("value", sample);
    });

    // Event listener for ID dropdown change
    selector.on("change", function () {
      optionChanged(this.value); // Call the optionChanged function to update the charts and metadata
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    optionChanged(firstSample); // Call the optionChanged function to initialize with the default sample
  }).catch((error) => {
    console.error("Error while initializing:", error);
  });
}

// Function to handle dropdown change
function optionChanged(sample) {
  buildMetadata(sample);
  buildCharts(sample);
  buildGaugeChart(sample);
}

// Call the initialization function
init();