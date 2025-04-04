import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OpenLayers Map</title>
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/ol@9.1.0/ol.css">
      <script src="https://unpkg.com/ol@9.1.0/dist/ol.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          var map = new ol.Map({
            target: "map",
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([-103.35, 20.66]), // Guadalajara, MX
              zoom: 12,
            }),
          });
        });
      </script>
    </body>
    </html>
  `;

const MapView = () => {
  return (
    <View style={{ flex: 1 }}>
      <WebView originWhitelist={["*"]} source={{ html: htmlContent }} />
    </View>
  );
};

export default MapView;
