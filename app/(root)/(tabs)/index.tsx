import { useState, useEffect, useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { ReservationsService, PenaltiesService } from "@/lib/apiService";
import { ParkingCard } from "@/components/Card";
import TopBar from "@/components/TopBar";
import { ActiveReservation, Reservation } from "@/types/reservation";
import { Penalty } from "@/types/penaltie";
import { router } from "expo-router";
import { PenaltyCard } from "@/components/Card";

type TabType = "reservations" | "penalties";

export default function ReservationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("reservations");
  const [activeReservation, setActiveReservation] =
    useState<ActiveReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [penaltiesError, setPenaltiesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [startTimeRemaining, setStartTimeRemaining] = useState<string>("");
  const [endTimeRemaining, setEndTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activeReservationData, penaltiesData] = await Promise.all([
          ReservationsService.getActiveReservation().catch(() => null),
          PenaltiesService.getUserPenalties(),
        ]);

        setActiveReservation(activeReservationData);
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

  // Timer effect
  useEffect(() => {
    if (!activeReservation) return;

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(activeReservation.startTime);
      const endTime = new Date(activeReservation.endTime);

      // Calculate time until start
      const startDiffMs = startTime.getTime() - now.getTime();
      if (startDiffMs <= 0) {
        setStartTimeRemaining("La reservación ha comenzado");

        // Calculate time until end
        const endDiffMs = endTime.getTime() - now.getTime();
        if (endDiffMs <= 0) {
          setEndTimeRemaining("La reservación ha finalizado");
        } else {
          const endDiffHours = Math.floor(endDiffMs / (1000 * 60 * 60));
          const endDiffMinutes = Math.floor(
            (endDiffMs % (1000 * 60 * 60)) / (1000 * 60)
          );
          const endDiffSeconds = Math.floor((endDiffMs % (1000 * 60)) / 1000);

          setEndTimeRemaining(
            `Tiempo restante: ${endDiffHours}h ${endDiffMinutes}m ${endDiffSeconds}s`
          );
        }
      } else {
        const startDiffHours = Math.floor(startDiffMs / (1000 * 60 * 60));
        const startDiffMinutes = Math.floor(
          (startDiffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const startDiffSeconds = Math.floor((startDiffMs % (1000 * 60)) / 1000);

        setStartTimeRemaining(
          `Comienza en: ${startDiffHours}h ${startDiffMinutes}m ${startDiffSeconds}s`
        );
        setEndTimeRemaining("");
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "reservations") {
        const data = await ReservationsService.getActiveReservation().catch(
          () => null
        );
        setActiveReservation(data);
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

  const mapActiveReservation = (
    reservation: ActiveReservation
  ): Reservation => {
    return {
      reservationId: reservation.reservation_id,
      qrCodeUrl: reservation.qrCodeUrl,
      spotId: reservation.spot.id.toString(),
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      spotSection: reservation.spot.section,
      carModel: reservation.userCar.model,
      carPlates: reservation.userCar.carPlates,
      status: reservation.status,
    };
  };

  const renderTabContent = () => {
    if (activeTab === "reservations") {
      if (activeReservation) {
        const mappedReservation = mapActiveReservation(activeReservation);
        return (
          <View className="flex-1">
            {/* Timer Display */}
            <View className="bg-blue-100 p-4 mx-2 rounded-lg mb-4">
              <Text className="text-blue-800 font-rubik-bold text-center">
                {startTimeRemaining}
              </Text>
              {endTimeRemaining ? (
                <>
                  <Text className="text-blue-800 font-rubik-bold text-center mt-2">
                    {endTimeRemaining}
                  </Text>
                  <Text className="text-blue-600 font-rubik-medium text-center text-xs mt-1">
                    Hora de finalización:{" "}
                    {new Date(activeReservation.endTime).toLocaleTimeString()}
                  </Text>
                </>
              ) : null}
              <Text className="text-blue-600 font-rubik-medium text-center text-xs mt-1">
                Hora de inicio:{" "}
                {new Date(activeReservation.startTime).toLocaleTimeString()}
              </Text>
            </View>

            {/* Parking Card */}
            <FlatList
              refreshing={refreshing}
              onRefresh={onRefresh}
              data={[mappedReservation]}
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
            />
          </View>
        );
      } else {
        return (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-black-200 font-rubik-medium">
              No tienes reservaciones activas
            </Text>
          </View>
        );
      }
    } else {
      return (
        <FlatList
          data={penalties}
          renderItem={({ item }) => (
            <PenaltyCard
              penalty={item}
              onPress={() =>
                router.push({
                  pathname: "/PenaltyDetailScreen",
                  params: {
                    penaltyid: item.penaltyId.toString(),
                  },
                })
              }
            />
          )}
          keyExtractor={(item) => item.penaltyId.toString()}
          contentContainerClassName="pb-32 px-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-black-200 font-rubik-medium">
                No tienes penalizaciones recientes
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
          {activeTab === "reservations"
            ? "Reservación Activa"
            : "Penalizaciones"}
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
              Reservación
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
