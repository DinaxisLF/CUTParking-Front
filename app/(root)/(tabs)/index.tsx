import SignIn from "@/app/sign-in";
import { Link } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "react-native-splash-screen";
import { FlatList, Image, SafeAreaView, Text, View } from "react-native";
import images from "@/constants/images";
import icons from "@/constants/icons";
import MapView from "@/components/MapWebView";
import { Card, CardButton, ParkingCard } from "@/components/Card";
import TopBar from "@/components/TopBar";
export default function Index() {
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar></TopBar>
      <View className="flex-1 flex-col justify-start px-5 py-10">
        <Text className="text-xl font-rubik-medium text-black-300 mt-5 text-center">
          Reservaciones Recientes
        </Text>
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={({ item }) => <ParkingCard></ParkingCard>}
          contentContainerClassName="pb-32 px-5"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text className="text-xl font-rubik-medium text-black-300 mt-5 text-center" />
          }
        />
      </View>
    </SafeAreaView>
  );
}
