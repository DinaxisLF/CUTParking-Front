import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { router } from "expo-router";
import { ParkingSpotCard } from "@/components/Card";
import { ParkingSpotService } from "@/lib/apiService";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "@/components/TopBar";
import { ParkingSpot } from "@/types/parkingSpot";

export default function ParkingSpotsScreen() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ParkingSpotService.getAvailableParkingSpots();
        setSpots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;
  if (error) return <Text className="text-red-500 p-5">Error: {error}</Text>;

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 px-5 py-4">
        <Text className="text-xl font-rubik-bold text-black-300 mb-4">
          Espacios Disponibles
        </Text>

        <FlatList
          data={spots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ParkingSpotCard
              spot={item}
              onPress={() =>
                router.replace({
                  pathname: "/parking-spot-detal-screen",
                  params: { id: item.id.toString() },
                })
              }
            />
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={
            <View className="items-center flex-col justify-center py-10">
              <Text className="text-gray-500 text-lg">
                No hay espacios disponibles
              </Text>
            </View>
          }
          contentContainerStyle={spots.length === 0 ? { flex: 1 } : undefined}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
