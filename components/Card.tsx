import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { ParkingSpot } from "@/types/parkingSpot";
import { format } from "date-fns";
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
    carModel: String;
    carPlates: String;
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
        className="size-full rounded-2xl"
      ></Image>
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      ></Image>
      <View className="flex flex-col items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-20">
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          Reservar
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

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 w-full mt-4 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70"
    >
      {reservation.qrCodeUrl && (
        <Image
          source={images.reservation}
          className="w-full h-40 rounded-lg"
          resizeMode="contain"
        />
      )}

      <View className="flex flex-col mt-2 px-5">
        <Text className="text-base font-rubik-bold text-black-300">
          Fecha: {capitalizedDate}
        </Text>

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
