import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import {
  CardButton,
  PenaltiesButton,
  ReservationsButton,
} from "@/components/Card";
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

const handleReservationsPress = () => {
  router.push("/UserReservationsScreen");
};

const handlePenaltiesPress = () => {
  router.push("/UserPenaltiesScreen");
};

const explore = () => {
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 flex-col justify-start px-5 py-10">
        <Text className="text-xl text-center font-rubik-bold text-black-300">
          Reservaciones
        </Text>
        <View className="flex-col justify-center mt-10">
          <CardButton
            onPress={handleParkingSpotsPress} // ✅ Forma correcta
          />

          <ReservationsButton
            onPress={handleReservationsPress} // ✅ Forma correcta
          />

          <PenaltiesButton
            onPress={handlePenaltiesPress} // ✅ Forma correcta
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default explore;
