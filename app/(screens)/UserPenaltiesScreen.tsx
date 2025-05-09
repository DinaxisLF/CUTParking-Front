import { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { PenaltiesService } from "@/lib/apiService";
import { PenaltyCard } from "@/components/Card";
import TopBar from "@/components/TopBar";
import { Penalty } from "@/types/penaltie";
import { router } from "expo-router";

export default function UserPenaltiesScreen() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPenalties = async () => {
    try {
      const data = await PenaltiesService.getUserPenalties();
      setPenalties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPenalties();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full">
        <TopBar />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="bg-white h-full">
        <TopBar />
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 font-rubik-medium text-center">
            Error: {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />
      <View className="flex-1 flex-col justify-start px-5 py-5">
        <Text className="text-xl font-rubik-bold text-black-300 mt-5 text-center">
          Mis Penalizaciones
        </Text>

        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={penalties}
          renderItem={({ item }) => (
            <PenaltyCard
              penalty={item}
              onPress={() =>
                router.push({
                  pathname: "/PenaltyDetailScreen",
                  params: {
                    penaltyid: item.penaltyId.toString(),
                  },
                })
              }
            />
          )}
          keyExtractor={(item) => item.penaltyId.toString()}
          contentContainerClassName="pb-32 px-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-black-200 font-rubik-medium">
                No tienes penalizaciones
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
