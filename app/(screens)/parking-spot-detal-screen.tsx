import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { ParkingSpotService, ReservationsService } from "@/lib/apiService";
import { ParkingSpot } from "@/types/parkingSpot";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "@/components/MapWebView";
import TopBar from "@/components/TopBar";
import CustomButton from "@/components/Button";
import { router } from "expo-router";
import React from "react";

const parkingspotdetailscreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const data = await ParkingSpotService.getById(Number(id));
        setSpot(data);
      } catch (error) {
        console.error("Error fetching spot:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSpot();
  }, [id]);

  if (loading) return <ActivityIndicator className="mt-20" size="large" />;
  if (!spot) return <Text>Error al cargar el espacio</Text>;

  const handleReservationSuccess = async (reservationId: number) => {
    try {
      setShowReservationForm(false);
      // Fetch the full reservation details including QR code
      const reservationDetails =
        await ReservationsService.getReservationDetails(reservationId);

      router.replace({
        pathname: "/ReservationDetailsScreen",
        params: {
          reservationId: reservationDetails.reservationId.toString(),
          qrCodeUrl: reservationDetails.qrCodeUrl,
          spotId: reservationDetails.spotId.toString(),
          startTime: reservationDetails.startTime,
          endTime: reservationDetails.endTime,
          carModel: reservationDetails.carModel,
          carPlates: reservationDetails.carPlates,
        },
      });
    } catch (error) {
      console.error("Failed to complete reservation:", error);
      Alert.alert("Error", "No se pudo completar la reserva");
      setShowReservationForm(true);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <Text className="text-xl font-rubik-bold text-black-300 mt-5 text-center">
        Ubicación
      </Text>
      {spot.location && spot.location.latitude && spot.location.longitude && (
        <View className="h-[300px]">
          <MapView
            latitude={spot.location.latitude}
            longitude={spot.location.longitude}
          />
        </View>
      )}

      <View className="flex flex-col px-12">
        <Text className="text-xl font-rubik-bold text-black-300 mt-5">ID</Text>
        <Text className="text-xl font-rubik-medium text-black-300">
          {spot.id}
        </Text>
        <Text className="text-xl font-rubik-bold text-black-300 mt-5">
          Área
        </Text>
        <Text className="text-xl font-rubik-medium text-black-300">
          {spot.section}
        </Text>
      </View>
      <View className="flex flex-col justify-between items-center mt-5 px-5">
        <CustomButton
          className="w-40 h-10"
          text="Reservar"
          onPress={() => setShowReservationForm(true)}
        />
      </View>
    </SafeAreaView>
  );
};

export default parkingspotdetailscreen;
