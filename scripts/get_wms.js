const fs = require('fs');
const https = require('https');
var parseString = require('xml2js').parseString;

const url =
  'https://raw.githubusercontent.com/igeofr/qgis2/master/flux/QGIS_WMS.xml';
https.get(url, res => {
  res.setEncoding('utf8');
  let body = '';
  res.on('data', data => {
    body += data;
  });
  res.on('end', () => {
    const fileName = url.split('/').slice(-1)[0].replace('xml', 'json');
    // body = JSON.parse(body);
    parseString(body, function (err, result) {
      const content = result.qgsWMSConnections.wms.map(wms => ({
        name: wms['$'].name,
        url: wms['$'].url.replace('?', ''),
      }));
      fs.writeFile(fileName, JSON.stringify(content, null, ' '), function (err) {
        if (err) {
          return new Error(err);
        };
        console.log('Retrieved WMS list');
      });
    });
  });
});


