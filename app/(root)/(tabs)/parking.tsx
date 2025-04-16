import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { CardButton } from "@/components/Card";
import TopBar from "@/components/TopBar";
import { router } from "expo-router";

const handleParkingSpotsPress = async () => {
  try {
    // Navegar a la pantalla de parking spots y pasar los parámetros necesarios
    router.push("/ParkingSpotsScreen");
  } catch (error) {
    console.error("Navigation error:", error);
  }
};

const explore = () => {
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 flex-col justify-start px-5 py-10">
        <Text className="text-xl font-rubik-medium text-black-300">
          Reservar un espacio
        </Text>
        <CardButton
          onPress={handleParkingSpotsPress} // ✅ Forma correcta
        />
      </View>
    </SafeAreaView>
  );
};

export default explore;
