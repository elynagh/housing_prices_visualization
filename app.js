import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer, IconLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import {scaleThreshold} from 'd3-scale';

// Source data GeoJSON
const DATA_URL =
  'geojson_heatmap.json'; // eslint-disable-line

export const COLOR_SCALE = scaleThreshold()
  .domain([0,.2,.4,.6,.8,.9,1])
  .range([
    [253, 216, 179],
    [253, 216, 179],
    [253, 167, 98],
    [242, 112, 29],
    [196, 65, 3],
    [167, 48, 4],
    [127, 39, 4]
  ]);

var margin = { top: 20, right: 10, bottom: 5, left: 10 },
width = 300 - margin.left - margin.right,
height = 150 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#legend_heatmap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  //.attr("transform",
  //    "translate(" + margin.left + "," + margin.top + ")");

var z = d3.scaleSequential(d3.interpolateOranges)
z.domain([0, 1]);
var legend = svg.selectAll(".legend")
    .data(z.ticks(6).slice(1).reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (0) + "," + (45 + i * 20) + ")"; });

legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", z);

//var percentage = d3.format(".0%");
//var percentageFormat = z.ticks(6).slice(1).reverse().map(each => percentage(each));
legend.append("text")
    .attr("x", 25)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(d3.format(""));

svg.append("text")
    .attr("class", "label")
    .attr("x", 0)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text("Change in normalized average sales");

    svg.append("text")
    .attr("class", "label")
    .attr("x", 0)
    .attr("y", 30)
    .attr("dy", ".35em")
    .text("price from 2018 to 2021");

const INITIAL_VIEW_STATE = {
  latitude: 39.95,
  longitude: -83,
  zoom: 10.5,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]];

function getTooltip({object}) {
  console.log(object);
  return (
    object && {
      html: `\
  <div><b>Zipcode</b></div>
  <div>${object.properties.ZCTA5CE10} / ZIP code</div>
  <div><b>2018 to 2021 average price change</b></div>
  <div>${object.properties.change}%</div>
  `
    }
  );
}

function svgToDataURL(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: false}
};

const icon_data = [
  {svg: "svg_43026.svg", coordinates: [-83.1944130,40.0208503], size: 5},
  {svg: "svg_43123.svg", coordinates: [-83.075,39.8694893], size: 6},
  {svg: "svg_43228.svg", coordinates: [-83.1256614,39.95], size: 4},
  {svg: "svg_43204.svg", coordinates: [-83.078,39.9612916], size: 4},
  {svg: "svg_43221.svg", coordinates: [-83.068,40.014], size: 4},
  {svg: "svg_43220.svg", coordinates: [-83.0742437,40.0491532], size: 4},
  {svg: "svg_43214.svg", coordinates: [-83.0162692,40.0517339], size: 4},
  {svg: "svg_43085.svg", coordinates: [-83.02,40.095], size: 4},
  {svg: "svg_43231.svg", coordinates: [-82.938,40.0793330], size: 4},
  {svg: "svg_43230.svg", coordinates: [-82.8708749,40.0357633], size: 6},
  {svg: "svg_43213.svg", coordinates: [-82.8621340,39.9668733], size: 4},
  {svg: "svg_43125.svg", coordinates: [-82.87,39.8380522], size: 5},
  {svg: "svg_43207.svg", coordinates: [-82.9628316,39.8946789], size: 6},
  {svg: "svg_43209.svg", coordinates: [-82.9307207,39.9536159], size: 4},
  {svg: "svg_43203.svg", coordinates: [-82.9690263,39.9730840], size: 2},
  {svg: "svg_43215.svg", coordinates: [-83,39.965], size: 4},
  {svg: "svg_43202.svg", coordinates: [-83.005,40.0198116], size: 3},
  {svg: "svg_43201.svg", coordinates: [-82.9999465,39.9908298], size: 2.5},
  {svg: "svg_43210.svg", coordinates: [-83.0232273,40.0054346], size: 2.5},
  {svg: "svg_43205.svg", coordinates: [-82.9620715,39.9570186], size: 2.5},
  {svg: "svg_43212.svg", coordinates: [-83.0428237,39.9871455], size: 2.75},
  {svg: "svg_43206.svg", coordinates: [-82.9741749,39.9424523], size: 2.75}]

export default function App({data = DATA_URL, mapStyle = MAP_STYLE}) {
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  let polyLayer = new PolygonLayer({
    id: 'ground',
    data: landCover,
    stroked: false,
    getPolygon: f => f,
    getFillColor: [0, 0, 0, 0]
  });

  let geoLayer = new GeoJsonLayer({
    id: 'geojson',
    data,
    opacity: 0.8,
    stroked: false,
    filled: true,
    extruded: true,
    wireframe: true,
    getElevation: 0,
    getFillColor: f => COLOR_SCALE(f.properties.change),
    getLineColor: [255, 255, 255],
    pickable: true,
  })

  let iconBackground = new IconLayer({
    id: 'IconLayer_background',
    data: icon_data,
    getIcon: d => ({
      url: 'white_background.PNG',
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      mask: false
    }),
    getPosition: d => d.coordinates,
    getSize: d => d.size,
    sizeScale: 500,
    sizeUnits: "meters",
    pickable: false,
    alphaCutoff: 0,
    getColor: [0,0,0,200],
    opacity: 100
  })

  let iconPlot = new IconLayer({
    id: 'IconLayer',
    data: icon_data,
    getIcon: d => ({
      url: d.svg,
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      mask: false
    }),
    getPosition: d => d.coordinates,
    getSize: d => d.size,
    sizeScale: 500,
    sizeUnits: "meters",
    pickable: false,
    alphaCutoff: 0,
    getColor: [0,0,0,200],
    opacity: 90
  })

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    polyLayer,
    geoLayer,
    iconBackground,
    iconPlot,
    
  ];

  return (
    <DeckGL
      layers={layers}
      effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

render(<App name='World' />, document.getElementById('app'));

