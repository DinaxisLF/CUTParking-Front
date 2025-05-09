import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { ParkingSpot } from "@/types/parkingSpot";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  onPress?: () => void;
}

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  onPress: () => void;
}

interface CarProps {
  car: {
    brand: string;
    model: string;
    year: number;
    carPlates: string;
    image?: string; // Optional image URL
  };
  onPress?: () => void;
}

type ReservationProps = {
  reservation: {
    reservationId: number;
    spotId: string;
    spotSection: string;
    startTime: string;
    endTime: string;
    qrCodeUrl?: string;
    carModel: string;
    carPlates: string;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
  };
  onPress: () => void;
};

type PenaltyProps = {
  penalty: {
    penaltyId: number;
    reservationId: number;
    amount: number;
    reason: string;
    penaltyTime: string;
    status: string;
  };
  onPress: () => void;
};

export const CardButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex flex-col mt-4 items-center w-100 h-40 relative"
      onPress={onPress}
    >
      <Image
        source={images.parkingFromTop}
        className="size-36 rounded-2xl"
      ></Image>
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      ></Image>
      <View className="flex flex-col items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-16">
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          Reservar
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ReservationsButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex flex-col mt-4 items-center w-100 h-40 relative"
      onPress={onPress}
    >
      <Image
        source={images.reservation}
        className="size-40 rounded-2xl mt-1"
      ></Image>
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      ></Image>
      <View className="flex flex-col items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-16">
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          Reservaciones
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const PenaltiesButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex flex-col mt-4 items-center w-100 h-40 relative"
      onPress={onPress}
    >
      <Image
        source={images.penalty}
        className="size-32 rounded-2xl mr-10 mt-4"
      ></Image>
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      ></Image>
      <View className="flex flex-col items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-16">
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          Penalizaciones
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const CarCard: React.FC<CarProps> = ({ car, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col mt-4 items-start w-100 h-40 relative"
    >
      <Image
        source={car.image ? { uri: car.image } : images.carExample}
        className="size-full rounded-2xl"
      />
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />
      <View className="flex flex-col px-5 py-10 items-start absolute">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {car.model}
        </Text>
        <Text className="text-base font-rubik text-white">{car.carPlates}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({
  spot,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col mt-4 items-start w-40 h-40 relative"
    >
      <Image
        source={images.parkingSpotImage}
        className="size-full rounded-2xl"
      />

      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />

      <View className="flex flex-col px-5 py-4 items-start absolute bottom-0">
        <Text className="text-xl font-rubik-extrabold text-white">
          Numero <Text className="text-m">{spot.id}</Text>
        </Text>
        <Text className="text-xl font-rubik-extrabold text-white">
          Area {spot.section}
        </Text>
        <Text className="text-base font-rubik text-white">
          {spot.status === "AVAILABLE" ? "Disponible" : "Ocupado"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col mt-4 items-start w-100 h-40 relative"
    >
      <Image
        source={images.carExample}
        className="size-full rounded-2xl"
      ></Image>
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      ></Image>
      <View className="flex flex-col px-5 py-10 items-start absolute">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          Nissan Versa 2016
        </Text>
        <Text className="text-base font-rubik text-white">AJ874LO</Text>
      </View>
    </TouchableOpacity>
  );
};

export const ParkingCard = ({ reservation, onPress }: ReservationProps) => {
  const formattedDate = format(
    new Date(reservation.startTime),
    "dd MMMM yyyy",
    { locale: es }
  );
  const capitalizedDate = formattedDate.replace(/(?:^|\s)\w/g, (match) =>
    match.toUpperCase()
  );

  // Determine card style based on status
  const getCardStyle = () => {
    if (!reservation.status) return "bg-white";

    switch (reservation.status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 border-l-4 border-green-500";
      case "CANCELLED":
        return "bg-red-100 border-l-4 border-red-500";
      case "COMPLETED":
        return "bg-blue-100 border-l-4 border-blue-500";
      default:
        return "bg-white";
    }
  };

  // Determine text color based on status
  const getStatusTextStyle = () => {
    if (!reservation.status) return "text-gray-600";

    switch (reservation.status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      case "COMPLETED":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Translate status to Spanish
  const translateStatus = (status?: string) => {
    if (!status) return "";

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "Activa";
      case "CANCELLED":
        return "Cancelada";
      case "COMPLETED":
        return "Completada";
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 w-full mt-4 py-4 rounded-lg shadow-lg shadow-black-100/70 ${getCardStyle()}`}
    >
      {reservation.qrCodeUrl && (
        <Image
          source={images.reservation}
          className="w-full h-40 rounded-lg"
          resizeMode="contain"
        />
      )}

      <View className="flex flex-col mt-2 px-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-bold text-black-300">
            Fecha: {capitalizedDate}
          </Text>
          {reservation.status && (
            <Text className={`text-xs font-rubik-bold ${getStatusTextStyle()}`}>
              {translateStatus(reservation.status)}
            </Text>
          )}
        </View>

        <Text className="text-xs font-rubik text-black-200">
          {reservation.carModel}
        </Text>
        <Text className="text-xs font-rubik text-black-200">
          {reservation.carPlates}
        </Text>
      </View>

      <View className="flex flex-row items-center justify-between mt-2 px-5">
        <Text className="text-base font-rubik-bold text-primary-300">
          {reservation.spotSection}
          {reservation.spotId}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const PenaltyCard = ({ penalty, onPress }: PenaltyProps) => {
  // Status handling
  const getCardStyle = () => {
    switch (penalty.status.toUpperCase()) {
      case "PAID":
        return "bg-green-100 border-l-4 border-green-500";
      case "PENDING":
        return "bg-orange-100 border-l-4 border-orange-500";
      default:
        return "bg-white";
    }
  };

  const getStatusTextStyle = () => {
    switch (penalty.status.toUpperCase()) {
      case "PAID":
        return "text-green-600";
      case "PENDING":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "Pagado";
      case "PENDING":
        return "Pendiente";
      default:
        return status;
    }
  };

  const reasonTranslations: Record<string, string> = {
    LATE_ARRIVAL: "Llegada tardía",
    CANCELLED: "Reservación cancelada",
    NO_SHOW: "No presentado",
    OVERSTAY: "Exceso de tiempo",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 w-full mt-4 py-4 rounded-lg shadow-lg shadow-black-100/70 ${getCardStyle()}`}
    >
      <Image
        source={images.penalty}
        className="w-full h-40 rounded-lg"
        resizeMode="contain"
      />

      <View className="flex flex-col mt-2 px-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-rubik-bold text-black-300">
            Motivo: {reasonTranslations[penalty.reason] || penalty.reason}
          </Text>
          {penalty.status && (
            <Text className={`text-xs font-rubik-bold ${getStatusTextStyle()}`}>
              {translateStatus(penalty.status)}
            </Text>
          )}
        </View>

        <View className="flex-row justify-between mt-1">
          <Text className="text-xs font-rubik text-black-200">
            Reservación: #{penalty.reservationId}
          </Text>
          <Text className="text-xs font-rubik text-black-200">
            ID: {penalty.penaltyId}
          </Text>
        </View>
      </View>

      <View className="flex flex-row items-center justify-between mt-2 px-5">
        <Text className="text-base font-rubik-bold text-primary-300">
          ${penalty.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
