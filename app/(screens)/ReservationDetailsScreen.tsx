import { View, Text, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import TopBar from "@/components/TopBar";
import { useEffect, useState, useRef } from "react";
import CustomButton from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReservationsService } from "@/lib/apiService";
import { router } from "expo-router";

type ReservationStatus = "ACTIVE" | "CANCELLED" | "COMPLETE";

export default function ReservationConfirmationScreen() {
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [reservationStatus, setReservationStatus] =
    useState<ReservationStatus>("ACTIVE");
  const [showCancelButton, setShowCancelButton] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Parse the dates
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        const reservation = await ReservationsService.getReservationDetails(
          parseInt(reservationId)
        );
        setReservationStatus(reservation.status);

        // Calculate time left for penalty-free cancellation (5 minutes from creation)
        const createdAtDate = new Date(reservation.createdAt);
        const cancellationDeadline = new Date(
          createdAtDate.getTime() + 5 * 60000
        );
        const currentDate = new Date();
        const timeLeftMs =
          cancellationDeadline.getTime() - currentDate.getTime();

        if (reservation.status === "ACTIVE") {
          setTimeLeft(Math.max(0, Math.floor(timeLeftMs / 1000)));
          setShowCancelButton(true);
          startTimer();
        } else {
          setShowCancelButton(false);
        }
      } catch (error) {
        console.error("Error fetching reservation details:", error);
      }
    };

    fetchReservationDetails();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [reservationId]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
      <Text className="text-white font-rubik-medium">{label}:</Text>
      <Text className="text-white font-rubik-bold">{value}</Text>
    </View>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCancelReservation = async () => {
    Alert.alert(
      "Confirmar Cancelación",
      timeLeft > 0
        ? "¿Deseas cancelar la reservación sin penalización?"
        : "Cancelar ahora resultará en una penalización. ¿Deseas continuar?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí, Cancelar",
          onPress: async () => {
            setIsCancelling(true);
            try {
              const userId = await AsyncStorage.getItem("userId");
              if (!userId) throw new Error("User ID not found");

              await ReservationsService.cancelReservation(
                parseInt(reservationId),
                parseInt(userId)
              );

              // Update local state
              setReservationStatus("CANCELLED");
              setShowCancelButton(false);

              Alert.alert(
                "Reservación Cancelada",
                timeLeft > 0
                  ? "Tu reservación ha sido cancelada sin penalización"
                  : "Tu reservación ha sido cancelada con penalización",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              let errorMessage = "Error al cancelar la reservación";
              if (error instanceof Error) errorMessage = error.message;
              Alert.alert("Error", errorMessage);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusDisplay = (status: ReservationStatus) => {
    switch (status) {
      case "ACTIVE":
        return "Activa";
      case "CANCELLED":
        return "Cancelada";
      case "COMPLETE":
        return "Completada";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 p-5">
        {/* Main Card Container */}
        <View className="bg-blue-500 rounded-xl p-6 shadow-lg">
          {/* Header */}
          <Text className="text-2xl font-rubik-bold text-white text-center mb-6">
            Reserva {getStatusDisplay(reservationStatus)}
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
              <DetailRow label="Espacio" value={`${spotSection} ${spotId}`} />
              <DetailRow label="Inicio" value={startDate.toLocaleString()} />
              <DetailRow label="Fin" value={endDate.toLocaleString()} />
              <DetailRow label="Automóvil" value={carModel} />
              <DetailRow label="Placas" value={carPlates} />

              {/* Timer Section */}
              {reservationStatus === "ACTIVE" && (
                <>
                  <View className="mt-4 pt-4 border-t border-blue-300">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white font-rubik-medium">
                        Cancelación sin penalización:
                      </Text>
                      <View className="bg-blue-500 px-3 py-1 rounded-full">
                        <Text className="text-white font-rubik-bold">
                          {formatTime(timeLeft)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-white font-rubik-regular text-sm mt-2">
                      {timeLeft > 0
                        ? "Puedes cancelar sin penalización antes de que el tiempo termine"
                        : "El tiempo para cancelar sin penalización ha expirado"}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <Text className="text-white font-rubik-medium text-center mt-6">
            {reservationStatus === "ACTIVE"
              ? "Presenta este código al llegar al estacionamiento"
              : "Esta reservación ya no está activa"}
          </Text>
        </View>

        {/* Cancel Button - Only show for active reservations */}
        {reservationStatus === "ACTIVE" && (
          <View className="p-5 items-center">
            <CustomButton
              text={isCancelling ? "Cancelando..." : "Cancelar Reservación"}
              variant={timeLeft > 0 ? "primary" : "danger"}
              className="w-50 h-10"
              onPress={handleCancelReservation}
              disabled={isCancelling}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
