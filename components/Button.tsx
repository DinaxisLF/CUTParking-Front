import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const CustomButton = () => {
  return (
    <TouchableOpacity>
      <View className="flex flex-row items-center bg-primary-100/90 px-4 py-2 relative rounded-full">
        <Text className="text-xs font-rubik-extrabold text-white ml-1">
          Agregar
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
