import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer, IconLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import {scaleThreshold} from 'd3-scale';

// Source data GeoJSON
const DATA_URL =
  'test_geojson_2018_testidx.json'; // eslint-disable-line

export const COLOR_SCALE = scaleThreshold()
  .domain([0,100,200,300,400,500,600,700,800,900,1000,10000])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38]
  ]);

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
  <div>${object.properties.valuePerSqm} / m<sup>2</sup></div>
  <div><b>Growth</b></div>
  <div>${Math.round(object.properties.growth * 100)}%</div>
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
  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: 0,
      getFillColor: f => COLOR_SCALE(f.properties.sales_2018),
      getLineColor: [255, 255, 255],
      pickable: true,
      /* pointType: 'icon',
      getIcon: f=>'marker',
      // getPixelOffset: [0, 0],
      //getPosition: [-89, 39],
      getIconSize: 5,
      iconSizeScale: 8,
      iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 128,
          mask: false
        }
      }, */

    }),
    new IconLayer({
      id: 'IconLayer_background',
      data: icon_data,
      
      /* props from IconLayer class */
    
      getIcon: d => ({
        url: 'white_background.png',
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        mask: false
      }),
      getPosition: d => d.coordinates,
      getSize: d => d.size,
      /* iconAtlas: 'svg_43026.svg',
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 128,
          mask: false
        }
      }, */
      // onIconError: null,
      // sizeMaxPixels: Number.MAX_SAFE_INTEGER,
      // sizeMinPixels: 0,
      sizeScale: 500,
      sizeUnits: "meters",
      pickable: false,
      alphaCutoff: 0,
      getColor: [0,0,0,200],
      opacity: 100
    }),
    new IconLayer({
      id: 'IconLayer',
      data: icon_data,
      
      /* props from IconLayer class */
    
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
      /* iconAtlas: 'svg_43026.svg',
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 128,
          mask: false
        }
      }, */
      // onIconError: null,
      //sizeMaxPixels: 50,
      // sizeMinPixels: 0,
      sizeScale: 500,
      sizeUnits: "meters",
      pickable: false,
      alphaCutoff: 0,
      getColor: [0,0,0,200],
      opacity: 90
    }),
    
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
/* export function renderToDOM(container) {
  render(<App />, container);
} */
