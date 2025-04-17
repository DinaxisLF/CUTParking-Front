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
import { Penalty } from "@/types/penaltie";
import { PenaltiesService } from "@/lib/apiService";
import { PenaltyCard } from "@/components/Card";

type TabType = "reservations" | "penalties";

export default function ReservationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [penaltiesError, setPenaltiesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [penalties, setPenalties] = useState<Penalty[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reservationsData, penaltiesData] = await Promise.all([
          ReservationsService.getUserReservations(),
          PenaltiesService.getUserPenalties(),
        ]);
        console.log(penaltiesData);
        setReservations(reservationsData);
        setPenalties(penaltiesData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "reservations") {
        const data = await ReservationsService.getUserReservations();
        setReservations(data);
      } else {
        const data = await PenaltiesService.getUserPenalties();
        setPenalties(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRefreshing(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "reservations") {
      return (
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
                No tienes reservaciones recientes
              </Text>
            </View>
          }
        />
      );
    } else {
      return (
        <FlatList
          data={penalties}
          renderItem={({ item }) => (
            <PenaltyCard
              penalty={item}
              onPress={() => console.log("Penalty pressed", item.penaltyId)}
            />
          )}
          keyExtractor={(item) => item.penaltyId.toString()}
          contentContainerClassName="pb-32 px-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-black-200 font-rubik-medium">
                No tienes reservaciones recientes
              </Text>
            </View>
          }
        />
      );
    }
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
          {activeTab === "reservations" ? "Reservaciones" : "Penalizaciones"}
        </Text>

        {/* Tab Bar */}
        <View className="flex-row justify-center my-4">
          <TouchableOpacity
            className={`px-6 py-2 rounded-l-lg ${
              activeTab === "reservations" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("reservations")}
          >
            <Text
              className={`font-rubik-medium ${
                activeTab === "reservations" ? "text-white" : "text-gray-700"
              }`}
            >
              Reservaciones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-6 py-2 rounded-r-lg ${
              activeTab === "penalties" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("penalties")}
          >
            <Text
              className={`font-rubik-medium ${
                activeTab === "penalties" ? "text-white" : "text-gray-700"
              }`}
            >
              Penalizaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}
