import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ParkingSpotCard } from "@/components/Card";
import { ParkingSpotService } from "@/lib/apiService";
import TopBar from "@/components/TopBar";
import { ParkingSpot } from "@/types/parkingSpot";
import { WebView } from "react-native-webview";

type TabType = "list" | "map";

export default function ParkingSpotsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  const [allSpots, setAllSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    setLoading(true);
    try {
      // Fetch both available spots and all spots in parallel
      const [availableData, allData] = await Promise.all([
        ParkingSpotService.getAvailableParkingSpots(),
        ParkingSpotService.getAllSpots(),
      ]);
      setAvailableSpots(availableData);
      setAllSpots(allData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [availableData, allData] = await Promise.all([
        ParkingSpotService.getAvailableParkingSpots(),
        ParkingSpotService.getAllSpots(),
      ]);
      setAvailableSpots(availableData);
      setAllSpots(allData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setRefreshing(false);
    }
  };

  const MapLegend = () => (
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "green" }]} />
        <Text style={styles.legendText}>Disponible</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "orange" }]} />
        <Text style={styles.legendText}>Reservado</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "red" }]} />
        <Text style={styles.legendText}>Ocupado</Text>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    legendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 4,
    },
    legendText: {
      fontSize: 12,
      fontFamily: "Rubik-Regular",
    },
  });

  const renderListTab = () => (
    <FlatList
      key="list-tab"
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={availableSpots}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ParkingSpotCard
          spot={item}
          onPress={() =>
            router.push({
              pathname: "/parking-spot-detal-screen",
              params: { id: item.id.toString() },
            })
          }
        />
      )}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      ListEmptyComponent={
        <View className="items-center flex-col justify-center py-10">
          <Text className="text-gray-500 text-lg">
            No hay espacios disponibles
          </Text>
        </View>
      }
      contentContainerStyle={
        availableSpots.length === 0 ? { flex: 1 } : { paddingBottom: 32 }
      }
      showsVerticalScrollIndicator={false}
    />
  );

  const renderMapTab = () => {
    if (allSpots.length === 0) {
      return (
        <View className="items-center flex-col justify-center py-10">
          <Text className="text-gray-500 text-lg">
            No hay espacios para mostrar
          </Text>
        </View>
      );
    }

    // Calculate center point of all spots
    const centerLat =
      allSpots.reduce((sum, spot) => sum + spot.location.latitude, 0) /
      allSpots.length;
    const centerLng =
      allSpots.reduce((sum, spot) => sum + spot.location.longitude, 0) /
      allSpots.length;

    const minLng = centerLng - 0.005;
    const maxLng = centerLng + 0.005;
    const minLat = centerLat - 0.005;
    const maxLat = centerLat + 0.005;

    // Generate HTML with all spots marked with different colors based on status
    const spotsMarkers = allSpots
      .map(
        (spot) => `
      new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([${
          spot.location.longitude
        }, ${spot.location.latitude}])),
        name: '${spot.section.replace(/'/g, "\\'")}',
        id: ${spot.id},
        status: '${spot.status}'
      })
    `
      )
      .join(",");

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
          // Define the allowed extent (bounding box)
          const allowedExtent = ol.proj.transformExtent(
            [${minLng}, ${minLat}, ${maxLng}, ${maxLat}],
            'EPSG:4326',
            'EPSG:3857'
          );
          
          const features = [${spotsMarkers}];
          
          const getColorByStatus = (status) => {
            switch(status) {
              case 'AVAILABLE': return 'green';
              case 'RESERVED': return 'orange';
              case 'OCCUPIED': return 'red';
              default: return 'gray';
            }
          };

          const styleFunction = function(feature) {
            const status = feature.get('status');
            const color = getColorByStatus(status);
            
            return new ol.style.Style({
              image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: color }),
                stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
              }),
            });
          };

          const vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
              features: features
            }),
            style: styleFunction
          });

          const map = new ol.Map({
            target: "map",
            layers: [
              new ol.layer.Tile({ source: new ol.source.OSM() }),
              vectorLayer
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([${centerLng}, ${centerLat}]),
              zoom: 16,
              extent: allowedExtent,
              multiWorld: false,
              constrainOnlyCenter: false
            }),
          });

          // Set zoom limits
          map.getView().setMinZoom(15);
          map.getView().setMaxZoom(18);

          // Add click interaction
          map.on('click', function(evt) {
            const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
              return feature;
            });
            
            if (feature) {
              window.ReactNativeWebView.postMessage(feature.get('id').toString());
            }
          });
        });
      </script>
    </body>
    </html>
  `;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "center", paddingTop: 8 }}>
          <MapLegend />
        </View>
        <View
          style={{ flex: 1, height: Dimensions.get("window").height - 200 }}
        >
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            javaScriptEnabled={true}
            onMessage={(event) => {
              const spotId = event.nativeEvent.data;
              router.push({
                pathname: "/parking-spot-detal-screen",
                params: { id: spotId },
              });
            }}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full">
        <TopBar />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="bg-white h-full">
        <TopBar />
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 font-rubik-medium text-center">
            Error: {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 flex-col justify-start px-5 py-5">
        <Text className="text-xl font-rubik-bold text-black-300 mt-5 text-center">
          {activeTab === "list" ? "Espacios Disponibles" : "Todos los Espacios"}
        </Text>

        <View className="flex-row justify-center my-4">
          <TouchableOpacity
            className={`px-6 py-2 rounded-l-lg ${
              activeTab === "list" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("list")}
          >
            <Text
              className={`font-rubik-medium ${
                activeTab === "list" ? "text-white" : "text-gray-700"
              }`}
            >
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-6 py-2 rounded-r-lg ${
              activeTab === "map" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("map")}
          >
            <Text
              className={`font-rubik-medium ${
                activeTab === "map" ? "text-white" : "text-gray-700"
              }`}
            >
              Mapa
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "list" ? renderListTab() : renderMapTab()}
      </View>
    </SafeAreaView>
  );
}
