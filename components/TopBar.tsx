import { View, Text, Image } from "react-native";
import React from "react";
import images from "@/constants/images";
import icons from "@/constants/icons";

const TopBar = () => {
  return (
    <View className="px-5">
      <View className="flex flex-row items-center justify-between mt-5">
        <View className="flex flex-row items-center">
          <Image source={images.avatar} className="size-12 rounded-full" />
          <View className="flex flex-col items-start ml-2 justify-center">
            <Text className="text-xs font-rubik text-black-100">
              Bienvenido
            </Text>
            <Text className="text-base font-rubik-medium text-black-300">
              Cesar
            </Text>
          </View>
        </View>
        <Image source={icons.bell} className="size-6" />
      </View>
    </View>
  );
};

export default TopBar;
