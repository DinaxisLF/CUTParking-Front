import { useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import TopBar from "@/components/TopBar";
import { Penalty } from "@/types/penaltie";
import { useState, useEffect } from "react";
import { PenaltiesService } from "@/lib/apiService";

export default function PenaltyDetailScreen() {
  const { penaltyid } = useLocalSearchParams<{ penaltyid: string }>();
  const [penalty, setPenalty] = useState<Penalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPenaltyDetails = async () => {
      try {
        // Ensure penaltyid is converted to number safely
        const penaltyIdNumber = Number(penaltyid);
        if (isNaN(penaltyIdNumber)) {
          throw new Error("Invalid penalty ID");
        }

        const penaltyData = await PenaltiesService.getPenaltyInfo(
          penaltyIdNumber
        );
        setPenalty(penaltyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPenaltyDetails();
  }, [penaltyid]);

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

  if (!penalty) {
    return (
      <SafeAreaView className="bg-white h-full">
        <TopBar />
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-black-200 font-rubik-medium text-center">
            No se encontró la penalización
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Status translations and styling
  const statusInfo = {
    text: penalty.status === "PAID" ? "Pagada" : "Pendiente",
    color: penalty.status === "PAID" ? "text-green-500" : "text-orange-500",
    bgColor: penalty.status === "PAID" ? "bg-blue-100" : "bg-blue-100",
  };

  // Reason translations
  const reasonTranslations: Record<string, string> = {
    LATE_ARRIVAL: "Llegada tardía",
    CANCELLED: "Reservación cancelada",
    NO_SHOW: "No presentado",
    OVERSTAY: "Exceso de tiempo",
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
      <Text className="text-white font-rubik-medium">{label}:</Text>
      <Text className="text-white font-rubik-bold">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 p-5">
        {/* Main Card Container */}
        <View
          className={`bg-blue-500 rounded-xl p-6 shadow-lg ${statusInfo.bgColor}`}
        >
          {/* Header */}
          <Text className="text-2xl font-rubik-bold text-white text-center mb-6">
            Penalización
          </Text>

          {/* Penalty Image Section */}
          <View className="items-center mb-8 bg-white p-4 rounded-lg">
            <Image
              source={require("@/assets/images/PenaltyCard.png")}
              className="w-44 h-44"
              resizeMode="contain"
            />
            <Text className="text-blue-500 font-rubik-medium mt-2">
              ID: {penalty.penaltyId}
            </Text>
          </View>

          {/* Details Section */}
          <View className="bg-blue-400 rounded-lg p-5">
            <View className="space-y-3">
              <DetailRow
                label="Reservación"
                value={`#${penalty.reservationId}`}
              />
              <DetailRow
                label="Motivo"
                value={reasonTranslations[penalty.reason] || penalty.reason}
              />
              <DetailRow
                label="Fecha"
                value={new Date(penalty.penaltyTime).toLocaleString()}
              />
              <DetailRow
                label="Monto"
                value={`$${penalty.amount.toFixed(2)}`}
              />
            </View>
          </View>

          <View className="items-center mt-10  bg-white p-4 rounded-lg">
            <Text className={statusInfo.color}>{statusInfo.text}</Text>
          </View>

          <Text className="text-white font-rubik-medium text-center mt-6">
            {penalty.status === "PAID"
              ? "Esta penalización ha sido pagada"
              : "Por favor realiza el pago de esta penalización"}
          </Text>
        </View>
        {penalty?.status === "PENDING" && (
          <TouchableOpacity
            onPress={() => console.log("Paid")}
            className="bg-green-500 py-3 px-6 rounded-lg mt-6 items-center"
          >
            <Text className="text-white font-rubik-bold text-lg">Pagar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
