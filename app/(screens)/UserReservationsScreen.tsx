import { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { ReservationsService } from "@/lib/apiService";
import { ParkingCard } from "@/components/Card";
import TopBar from "@/components/TopBar";
import { Reservation } from "@/types/reservation";
import { router } from "expo-router";

export default function UserReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await ReservationsService.getUserReservations();
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
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
          Mis Reservaciones
        </Text>
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={reservations}
          renderItem={({ item }) => (
            <ParkingCard
              reservation={item}
              onPress={() =>
                router.push({
                  pathname: "/ReservationDetailsScreen",
                  params: {
                    reservationId: item.reservationId.toString(),
                    qrCodeUrl: item.qrCodeUrl || "",
                    spotId: item.spotId.toString(),
                    startTime: item.startTime,
                    endTime: item.endTime,
                    spotSection: item.spotSection,
                    carModel: item.carModel,
                    carPlates: item.carPlates,
                  },
                })
              }
            />
          )}
          keyExtractor={(item) => item.reservationId.toString()}
          contentContainerClassName="pb-32 px-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-black-200 font-rubik-medium">
                No tienes reservaciones
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
