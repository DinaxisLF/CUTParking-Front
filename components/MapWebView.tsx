// components/MapView.tsx
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

type MapViewProps = {
  latitude: number;
  longitude: number;
  status?: "AVAILABLE" | "RESERVED" | "OCCUPIED"; // Add status prop
};

const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  status = "AVAILABLE",
}) => {
  // Determine marker color based on status
  const getMarkerColor = () => {
    switch (status) {
      case "AVAILABLE":
        return "green";
      case "RESERVED":
        return "orange";
      case "OCCUPIED":
        return "red";
      default:
        return "red";
    }
  };

  const markerColor = getMarkerColor();

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
                radius: 5,
                fill: new ol.style.Fill({ color: '${markerColor}' }),
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
              extent: allowedExtent,
              multiWorld: false,
              constrainOnlyCenter: false
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
        alignSelf: "center",
        height: 300,
        width: 300,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
      }}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
      />
    </View>
  );
};

export default MapView;
