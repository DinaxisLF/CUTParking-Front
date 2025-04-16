// components/MapView.tsx
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

type MapViewProps = {
  latitude: number;
  longitude: number;
};

const MapView: React.FC<MapViewProps> = ({ latitude, longitude }) => {
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
          /* Hide OpenLayers attribution button */
        .ol-attribution, .ol-zoom {
          display: none !important;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/ol@9.1.0/ol.css">
      <script src="https://unpkg.com/ol@9.1.0/dist/ol.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          const longitude = ${longitude};
          const latitude = ${latitude};

          const allowedExtent = ol.proj.transformExtent(
            [${longitude - 0.01}, ${latitude - 0.01}, ${longitude + 0.01}, ${
    latitude + 0.01
  }],
            'EPSG:4326',
            'EPSG:3857'
          );

          const marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude])),
          });

          const vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
              features: [marker],
            }),
            style: new ol.style.Style({
              image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: 'red' }),
                stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
              }),
            }),
          });

          const map = new ol.Map({
            target: "map",
            layers: [
              new ol.layer.Tile({ source: new ol.source.OSM() }),
              vectorLayer
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([longitude, latitude]),
              zoom: 16,
              extent: allowedExtent,          // Restrict to this area
              multiWorld: false,             // Prevent wrapping around the world
              constrainOnlyCenter: false      // Fully constrain the view
            }),
          });

          map.getView().setMinZoom(16);
          map.getView().setMaxZoom(18);

        });
      </script>
    </body>
    </html>
  `;

  return (
    <View
      style={{
        flex: 1,
        height: 300,
        width: 300,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 20,
        marginLeft: 10,
        borderWidth: 1, // Add border width
        borderColor: "#e2e8f0", // Light gray border (adjust color as needed)
      }}
    >
      <WebView originWhitelist={["*"]} source={{ html: htmlContent }} />
    </View>
  );
};

export default MapView;
