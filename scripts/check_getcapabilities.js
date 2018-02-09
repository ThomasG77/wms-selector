const fs = require('fs');
const path = require('path');
const http = require('follow-redirects').http;

const qgis_wms = require('./../demo/data/QGIS_WMS.json');

function buildCapabilitiesUrl (url) {
  const getCapabilitiesParams = {
    'request': 'GetCapabilities',
    'service': 'WMS'
  };
  return `${ url }?${Object.keys(getCapabilitiesParams).map((key) => key + '=' + getCapabilitiesParams[key]).join('&')}`;
}



qgis_wms.forEach(layer => {
  const cleanedUrl = layer.url.replace('https', 'http');
  const getCapabilitiesUrl = buildCapabilitiesUrl(cleanedUrl);
  if (getCapabilitiesUrl.indexOf('geosignal') === -1) {
    writeFileFromCapabilities(getCapabilitiesUrl);
  }
});

function writeFileFromCapabilities(url) {
  http.get(url, res => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', data => {
      body += data;
    });
    res.on('end', () => {
      const fileName = url.split('?')[0]
        .replace('http://', '')
        .replace(/[\/\-.]/g, '_');
      // console.log(fileName);
      // console.log(body);
      fs.writeFile('./tmp/' + fileName, body, function (err) {
        if (err) {
          console.log(err);
        };
        console.log('Retrieved WMS list');
        console.log(url.split('?')[0]);
      });
    });
  });

}