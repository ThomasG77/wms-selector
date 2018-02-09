import './wmsSelectorControl.css';
import './modal.css';

import ol from 'ol';
import Control from 'ol/control/control';
import WMSCapabilitiesFormat from 'ol/format/wmscapabilities';
import iconURL from './images/mActionAddWmsLayer.svg';

let refListener;

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
const WmsSelectorControl = function(url, opt_options) {

  var options = opt_options || {};

  var img = document.createElement('img');
  img.src = iconURL;

  const modalOverLay = createModalOverlay();
  document.body.appendChild(modalOverLay);

  addListWMSSelect(url).
  then((selectElement) => {
    // console.log(selectElement);
    modalOverLay.firstChild.appendChild(selectElement);
    const tableReference = document.createElement('div');
    tableReference.id = 'unique-table';
    refListener = tableReference.addEventListener('click', e => {
      if (e.target.tagName === 'TD') {
        const tr = e.target.parentElement;
        [...tr.parentElement.children]
          .filter(child => child !== tr && child.classList.contains('selected'))
          .forEach(child => {
            child.classList.remove('selected');
          })
        e.target.parentElement.classList.add('selected');
      } else if(e.target.tagName === 'TR') {
        e.target.classList.add('selected');
      }
    });

    var parentDivReference = document.createElement('div');
    parentDivReference.appendChild(tableReference);

    modalOverLay.firstChild.appendChild(parentDivReference);
  });

  var handleButton = (e) => {
    console.log(this, e);
    openModal(modalOverLay);
  };

  img.addEventListener('click', handleButton, false);
  img.addEventListener('touchstart', handleButton, false);

  var element = document.createElement('div');
  element.className = 'wms-selector ol-unselectable ol-control';
  element.appendChild(img);

  Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(WmsSelectorControl, Control);

function createModalOverlay() {
  const modalOverLay = document.createElement('div');
        modalOverLay.id = 'overlay';
        modalOverLay.className = 'overlay is-hidden';

  const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

  const buttonClose = document.createElement('span');
        buttonClose.className = 'button-close';
        buttonClose.addEventListener('click', e => {
          closeModal(modalOverLay);
        })
  const h3 = document.createElement('h3');
        h3.innerText = 'Modal Heading';
  const p = document.createElement('p');
        p.innerText = 'Modal Content';

  modalContent.appendChild(buttonClose);
  modalContent.appendChild(h3);
  modalContent.appendChild(p);

  modalOverLay.appendChild(modalContent);
  return modalOverLay;
}

function openModal(element) {
  element.classList.remove("is-hidden");
}

function closeModal(element) {
  element.classList.add("is-hidden");
}


function addListWMSSelect(url) {

  return fetch(url).then(response => response.json())
    .then(function(json) {
      var selectElement = document.createElement('select');

      const d = document.createDocumentFragment();
      const optionNoValue = document.createElement('option');
      optionNoValue.value = '';
      optionNoValue.innerText = 'No WebService selected';
      d.appendChild(optionNoValue);

      const options = json.reduce((acc, curr) => {
        const option = document.createElement('option');
        option.value = curr.url;
        option.innerText = curr.name;
        acc.appendChild(option);
        return acc;
      }, d);
      selectElement.appendChild(options);
      selectElement.addEventListener('change', e => {
        if (e.currentTarget.value) {
          console.log(e.currentTarget.value);
          // const wmsSource = createWmsSource(mainUrl, e.currentTarget.value);
          // wms.setSource(wmsSource);
          const capabilitiesUrl = buildCapabilitiesUrl(e.currentTarget.value);
          fetchTableData(capabilitiesUrl);
        } else {
          // wms.setSource(emptyWmsSource);
          console.log('Empty');
        }
      });
      // document.body.appendChild(selectElement);
      return Promise.resolve(selectElement);
    });
}

function createTable(layersInfo) {
  const table = document.createElement('table');
  const head = table.createTHead();
  const headerRow = head.insertRow(0);

  const headers = [{
    header: 'Name', key: 'Name'
  }, {
    header: 'Title', key: 'Title'
  }, {
    header: 'Abstract', key: 'Abstract'
  }];

  headers.forEach(element => {
    const th = document.createElement('th');
    th.innerText = element.header;
    headerRow.appendChild(th);
  })

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  layersInfo.forEach(info => {
    const row = tbody.insertRow();
    headers.forEach(header => {
      const cell = row.insertCell();
      // Append a text node to the cell
      const text = document.createTextNode(info[header.key]);
      cell.appendChild(text);
    })
  })

  return table;
}


function buildCapabilitiesUrl (url) {
  const getCapabilitiesParams = {
    'request': 'GetCapabilities',
    'service': 'WMS'
  };
  return `${ url }?${Object.keys(getCapabilitiesParams).map((key) => key + '=' + getCapabilitiesParams[key]).join('&')}`;
}

function fetchTableData(url) {
  var parser = new WMSCapabilitiesFormat();
  fetch('https://cors-anywhere.herokuapp.com/' + url).then(response => response.text())
    .then(function(text) {
      var result = parser.read(text);
      // var selectElement = document.createElement('select');
      const layersInfo = result.Capability.Layer.Layer.map(layer => {
        const {
          Name, Title, Abstract
        } = layer;
        return {Name, Title, Abstract: Abstract || ''};
      });
      const uniqueTable = document.getElementById('unique-table');
      if (uniqueTable.firstChild) {
        uniqueTable.removeChild(uniqueTable.firstChild);
      }
      uniqueTable.appendChild(createTable(layersInfo));
      // const d = document.createDocumentFragment();
      // const optionNoValue = document.createElement('option');
      // optionNoValue.value = '';
      // optionNoValue.innerText = 'Pas de couche';
      // d.appendChild(optionNoValue);

      // const options = result.Capability.Layer.Layer.reduce((acc, curr) => {
      //   const option = document.createElement('option');
      //   option.value = curr.Name;
      //   option.innerText = curr.Title;
      //   // option.Abstract
      //   acc.appendChild(option);
      //   return acc;
      // }, d);
      // selectElement.appendChild(options);
      // selectElement.addEventListener('change', e => {
      //   if (e.currentTarget.value) {
      //     const wmsSource = createWmsSource(mainUrl, e.currentTarget.value);
      //     wms.setSource(wmsSource);
      //   } else {
      //     wms.setSource(emptyWmsSource);
      //   }
      // });
      // document.body.appendChild(selectElement);
    });
}

export default WmsSelectorControl;