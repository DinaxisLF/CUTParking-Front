import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import images from "@/constants/images";
import icons from "@/constants/icons";

interface Props {
  onPress?: () => void;
}
export const CardButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity className="flex flex-col mt-4 items-center w-100 h-40 relative">
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

export const ParkingCard = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 w-full  mt-4 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
    >
      <View className="flex flex-row items-center absolute px-2 top-5 rigth-5 bg-white/90 p-1 rounded-full z-50"></View>
      <Image
        source={images.reservation}
        className="w-full h-40 rounded-lg"
      ></Image>
      <View className="flex flex-col mt-2 px-5">
        <Text
          className="text-base font-rubik-bold text-black-300"
          numberOfLines={1}
        >
          20/03/2025
        </Text>
        <Text className="text-xs font-rubik text-black-200">
          Nissan Versa 2025
        </Text>
      </View>
      <View className="flex flex-row items-center justify-between mt-2 px-5">
        <Text className="text-base font-rubik-bold text-primary-300">A15</Text>
      </View>
    </TouchableOpacity>
  );
};
