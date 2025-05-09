import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, ScrollView } from "react-native";
import {
  ParkingSpotService,
  ReservationsService,
  CarService,
} from "@/lib/apiService";
import { ParkingSpot } from "@/types/parkingSpot";
import { Car } from "@/types/car";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "@/components/MapWebView";
import TopBar from "@/components/TopBar";
import CustomButton from "@/components/Button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReservationModal from "@/components/ReservationModal";

export default function ParkingSpotDetailScreen() {
  // Make sure to use 'export default'
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
      <Text className="text-white font-rubik-medium">{label}:</Text>
      <Text className="text-white font-rubik-bold">{value}</Text>
    </View>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spotData, carsData] = await Promise.all([
          ParkingSpotService.getById(Number(id)),
          CarService.getUserCars(),
        ]);
        setSpot(spotData);
        setUserCars(carsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const canMakeReservation = () => {
    return spot?.status === "AVAILABLE";
  };

  const handleReservationSubmit = async (reservationData: {
    startTime: Date;
    endTime: Date;
    userCarId: number;
  }) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await ReservationsService.CreateReservation({
        userId: Number(userId),
        spotId: Number(id),
        startTime: reservationData.startTime.toISOString(),
        endTime: reservationData.endTime.toISOString(),
        userCarId: reservationData.userCarId,
      });

      handleReservationSuccess(response.reservationId);
    } catch (error) {
      console.error("Reservation error:", error);
      throw error;
    }
  };

  const handleReservationSuccess = async (reservationId: number) => {
    try {
      setShowReservationForm(false);
      const reservationDetails =
        await ReservationsService.getReservationDetails(reservationId);

      router.replace({
        pathname: "/ReservationDetailsScreen",
        params: {
          reservationId: reservationDetails.reservationId.toString(),
          qrCodeUrl: reservationDetails.qrCodeUrl,
          spotId: reservationDetails.spotId.toString(),
          spotSection: reservationDetails.spotSection.toString(),
          startTime: reservationDetails.startTime,
          endTime: reservationDetails.endTime,
          carModel: reservationDetails.carModel,
          carPlates: reservationDetails.carPlates,
        },
      });
    } catch (error) {
      console.error("Failed to complete reservation:", error);
      Alert.alert("Error", "No se pudo completar la reserva");
    }
  };

  if (loading) return <ActivityIndicator className="mt-20" size="large" />;
  if (!spot) return <Text>Error al cargar el espacio</Text>;

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 p-5">
        <View className="bg-blue-500 rounded-xl p-6 shadow-lg">
          <Text className="text-2xl font-rubik-bold text-white text-center mb-6">
            Detalles
          </Text>
          <View className="items-center mb-8 bg-white p-4 rounded-lg">
            {spot.location &&
              spot.location.latitude &&
              spot.location.longitude && (
                <View className="h-[300px]">
                  <MapView
                    latitude={spot.location.latitude}
                    longitude={spot.location.longitude}
                    status={spot.status} // Pass the status here
                  />
                </View>
              )}
            <Text className="text-blue-500 font-rubik-medium mt-2">
              Ubicación
            </Text>
          </View>
          <View className="bg-blue-400 rounded-lg p-5">
            <View className="space-y-3">
              <DetailRow label="Sección" value={`${spot.section}`} />
              <DetailRow label="Número" value={`${spot.id}`} />
              {/* Add status display */}
              <DetailRow
                label="Estado"
                value={`${
                  spot.status === "AVAILABLE"
                    ? "Disponible"
                    : spot.status === "RESERVED"
                    ? "Reservado"
                    : "Ocupado"
                }`}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Only show reservation button if spot is available */}
      {canMakeReservation() && (
        <View className="flex flex-col justify-between items-center mt-5 px-5 mb-10">
          <CustomButton
            className="w-40 h-10"
            text="Reservar"
            onPress={() => setShowReservationForm(true)}
          />
        </View>
      )}

      {/* Show message if spot is not available */}
      {!canMakeReservation() && (
        <View className="flex flex-col justify-between items-center mt-5 px-5 mb-10">
          <Text className="text-gray-500 font-rubik-medium text-center">
            {spot.status === "RESERVED"
              ? "Este espacio está actualmente reservado"
              : "Este espacio está actualmente ocupado"}
          </Text>
        </View>
      )}

      <ReservationModal
        visible={showReservationForm}
        onClose={() => setShowReservationForm(false)}
        onSubmit={handleReservationSubmit}
        userCars={userCars}
        spotId={Number(id)}
      />
    </SafeAreaView>
  );
}
