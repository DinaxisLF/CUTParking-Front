import CustomButton from "@/components/Button";
import { Card } from "@/components/Card";
import TopBar from "@/components/TopBar";
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";

const Car: React.FC = () => {
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar></TopBar>

      <FlatList
        data={[1, 2, 3, 4]}
        renderItem={({ item }) => <Card></Card>}
        contentContainerClassName="pb-32 px-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="flex-row justify-between px-5 py-10">
            <Text className="text-xl font-rubik-medium text-black-300">
              Automóviles
            </Text>
            <CustomButton />
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Car;
