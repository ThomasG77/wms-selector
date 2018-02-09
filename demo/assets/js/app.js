import 'ol/ol.css';

import OlMap from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZSource from 'ol/source/xyz';
import OSMSource from 'ol/source/osm';
import TileWMSSource from 'ol/source/tilewms';
import WMSCapabilitiesFormat from 'ol/format/wmscapabilities';
import proj from 'ol/proj';

import WmsSelectorControl from './../../../src/wmsSelectorControl';

var map = new OlMap({
  layers: [
    new TileLayer({
      source: new OSMSource()
    })
  ],
  target: 'map',
  view: new View({
    center: proj.fromLonLat([2.81250, 46.89023]),
    zoom: 6
  })
});

const wms = new TileLayer();
const emptyWmsSource = new TileWMSSource();
map.addLayer(wms);

const wmsSelectorControl = new WmsSelectorControl('/dist/data/QGIS_WMS.json');

map.addControl(wmsSelectorControl);

function createWmsSource(url, layers) {
  return new TileWMSSource({
    url: url,
    params: {
      'LAYERS': layers,
      'TILED': true
    },
    transition: 0
  })
};

var wmsList = [{
  name: 'Zonages Sandre', url: 'http://services.sandre.eaufrance.fr/geo/zonage'
}, {
  name: 'Géologie', url: 'http://geoservices.brgm.fr/geologie'
}, {
  name: 'Risques', url: 'http://geoservices.brgm.fr/risques'
}];

const mainUrl = 'http://services.sandre.eaufrance.fr/geo/zonage';
const getCapabilitiesParams = {
  'request': 'GetCapabilities',
  'service': 'WMS'
};
const getCapabilitiesUrl = `${ mainUrl }?${Object.keys(getCapabilitiesParams).map((key) => key + '=' + getCapabilitiesParams[key]).join('&')}`;

var parser = new WMSCapabilitiesFormat();

fetch(getCapabilitiesUrl).then(response => response.text())
  .then(function(text) {
    var result = parser.read(text);
    var selectElement = document.createElement('select');

    const d = document.createDocumentFragment();
    const optionNoValue = document.createElement('option');
    optionNoValue.value = '';
    optionNoValue.innerText = 'Pas de couche';
    d.appendChild(optionNoValue);

    const options = result.Capability.Layer.Layer.reduce((acc, curr) => {
      const option = document.createElement('option');
      option.value = curr.Name;
      option.innerText = curr.Title;
      // option.Abstract
      acc.appendChild(option);
      return acc;
    }, d);
    selectElement.appendChild(options);
    selectElement.addEventListener('change', e => {
      if (e.currentTarget.value) {
        const wmsSource = createWmsSource(mainUrl, e.currentTarget.value);
        wms.setSource(wmsSource);
      } else {
        wms.setSource(emptyWmsSource);
      }
    });
    document.body.appendChild(selectElement);
  });
