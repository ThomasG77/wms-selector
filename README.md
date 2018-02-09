# WMS Selector

## Purpose

The goal of this project is to ease addition of WMS layer from getCapabilities
This is an "early stage release" (too many things missing but working samples)

## How to

We supposed you have installed Node. If not, go to the [official website](https://nodejs.org) for instructions

Then do:

    git clone https://github.com/ThomasG77/wms-selector.git
    cd wms-selector
    npm install
    npm run demo:dev

You should see two uses cases:

* On the bottom of the map, you can choose among layers listed from a hard coded getCapabilities
* If you click on the button below the +, - for zooming unzooming, you will open a popup and see a list of web services refering to WMS endpoints. When you choose one, you will get a list of layers. Clicking on one will highlight it.

## Roadmap

At the moment, the missings parts are:

* select one or more layers and then add it/them to the map in the second scenario
* deal with projection verification and choose to support or not reprojection on client side when server can't provide WMS with the "right" projection for both scenarios
* Call a third party WMS from an URL instead of taking it from an existing list of WMS
* Manage "proxyfying" because not all WMS are CORS friendly for client side consumption
* improve UI/UX (ugly at the moment and not practical when a long list of layers in getCapabilities return)
* fix/bypass Parcel library bundling issue requiring us to duplicate `data` directory in `dist/data` and `demo/data`
* Testing suite

## Credits

* The logo for the button is coming from QGIS project.
* The list of WMS is from https://github.com/igeofr/qgis2/tree/master/flux and we've made some changes in the format. Moreover, some WMS are done or are in fact WMTS (QGIS export both together)

# Contact

Feel free to ask details or make a PR if you feel you can improve current code and sample.

* contact(at)webgeodatavore.com