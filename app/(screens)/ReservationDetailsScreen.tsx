import { View, Text, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import TopBar from "@/components/TopBar";
import { useEffect, useState } from "react";
import CustomButton from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReservationsService } from "@/lib/apiService";
import { router } from "expo-router";

export default function ReservationConfirmationScreen() {
  const [isCancelling, setIsCancelling] = useState(false);
  const {
    reservationId,
    qrCodeUrl,
    spotId,
    startTime,
    endTime,
    spotSection,
    carModel,
    carPlates,
  } = useLocalSearchParams<{
    reservationId: string;
    qrCodeUrl: string;
    spotId: string;
    startTime: string;
    endTime: string;
    spotSection: string;
    carModel: string;
    carPlates: string;
  }>();

  useEffect(() => {
    console.log("Reservation confirmation params:", {
      reservationId,
      qrCodeUrl,
      spotId,
      startTime,
      endTime,
      spotSection,
      carModel,
      carPlates,
    });
  }, []);

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
      <Text className="text-white font-rubik-medium">{label}:</Text>
      <Text className="text-white font-rubik-bold">{value}</Text>
    </View>
  );

  const handleCancelReservation = async () => {
    console.log("Button pressed - start of handleCancelReservation");
    Alert.alert("Confirmar Cancelación", "¿Deseas cancelar la reservación?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Cancelar",
        onPress: async () => {
          setIsCancelling(true);
          try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) throw new Error("User ID not found");

            const result = await ReservationsService.cancelReservation(
              parseInt(reservationId),
              parseInt(userId)
            );

            Alert.alert("Reservación Cancelada", result, [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            let errorMessage = "Error al cancelar la reservación";

            // Type checking for different error types
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            } else if (
              error &&
              typeof error === "object" &&
              "message" in error
            ) {
              errorMessage = String(error.message);
            }

            Alert.alert("Error", errorMessage);
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 p-5">
        {/* Main Card Container */}
        <View className="bg-blue-500 rounded-xl p-6 shadow-lg">
          {/* Header */}
          <Text className="text-2xl font-rubik-bold text-white text-center mb-6">
            Reserva Confirmada
          </Text>

          {/* QR Code Section */}
          <View className="items-center mb-8 bg-white p-4 rounded-lg">
            {qrCodeUrl && (
              <Image
                source={{ uri: qrCodeUrl }}
                className="w-44 h-44"
                resizeMode="contain"
              />
            )}
            <Text className="text-blue-500 font-rubik-medium mt-2">
              Código de reserva
            </Text>
          </View>

          {/* Details Section */}
          <View className="bg-blue-400 rounded-lg p-5">
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-white font-rubik-medium">Espacio</Text>
                <Text className="text-white font-rubik-bold">
                  {spotSection}
                  {spotId}
                </Text>
              </View>
              <DetailRow
                label="Inicio"
                value={new Date(startTime).toLocaleString()}
              />
              <DetailRow
                label="Fin"
                value={new Date(endTime).toLocaleString()}
              />
              <DetailRow label="Automovil" value={carModel} />
              <DetailRow label="Placas" value={carPlates} />
            </View>
          </View>

          {/* Additional Info */}
          <Text className="text-white font-rubik-medium text-center mt-6">
            Presenta este código al llegar al estacionamiento
          </Text>
        </View>
        {/* Bottom Button */}
        <View className="p-5 items-center">
          <CustomButton
            text={isCancelling ? "Cancelando..." : "Cancelar"}
            className="w-40 h-10 mt-5"
            variant="danger"
            onPress={handleCancelReservation}
            disabled={isCancelling}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
