import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { CardButton } from "@/components/Card";
import TopBar from "@/components/TopBar";

const explore = () => {
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar></TopBar>
      <View className="flex-1 flex-col justify-start px-5 py-10">
        <Text className="text-xl font-rubik-medium text-black-300">
          Reservar un espacio
        </Text>
        <CardButton></CardButton>
      </View>
    </SafeAreaView>
  );
};

export default explore;
