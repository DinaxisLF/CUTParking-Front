import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "@/components/Button";
import TopBar from "@/components/TopBar";
import { CarService } from "@/lib/apiService";
import { CarCard } from "@/components/Card";
import { router } from "expo-router";

const AddCarForm = ({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  const [plates, setPlates] = useState("");
  const [model, setModel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!plates.trim() || !model.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await CarService.CreateCar({
        plates,
        model,
      });
      onSubmit();
      Alert.alert("Auto agregado");
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el automóvil");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="p-5 bg-white rounded-lg shadow-md">
      <Text className="text-xl font-rubik-bold mb-4">Agregar Automóvil</Text>

      <Text className="text-m font-rubik-medium mb-4 mt-4">Placas</Text>
      <TextInput
        className="border border-gray-300 rounded p-3 mb-4"
        placeholder="Placas (ej. ABC-1234)"
        value={plates}
        onChangeText={setPlates}
      />

      <Text className="text-m font-rubik-medium mb-4 mt-4">Modelo</Text>
      <TextInput
        className="border border-gray-300 rounded p-3 mb-6"
        placeholder="Modelo (ej. Toyota Corolla 2023)"
        value={model}
        onChangeText={setModel}
      />

      <View className="flex-row justify-end space-x-3">
        <CustomButton text="Cancelar" variant="secondary" onPress={onCancel} />
        <CustomButton
          text={isSubmitting ? "Guardando..." : "Guardar"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

const Car: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigation = useNavigation();

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await CarService.getUserCars();
      setCars(data || []);
      setError(null);
    } catch (error) {
      setError("Error al cargar automóviles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchCars);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchCars();
  }, []);

  const handleCarAdded = () => {
    setShowForm(false);
    fetchCars(); // Refrescar la lista después de agregar
  };

  const handleCardPress = async (carId: number) => {
    try {
      const data = await CarService.getCarById(carId); // Obtener datos del auto
      router.push({
        pathname: "/CarDetailsScreen",
        params: { car: JSON.stringify(data) }, // Necesario serializar el objeto
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información del automóvil.");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <TopBar />

      {showForm ? (
        <ScrollView className="p-5">
          <AddCarForm
            onCancel={() => setShowForm(false)}
            onSubmit={handleCarAdded}
          />
        </ScrollView>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
          ) : error ? (
            <Text className="text-red-500 text-center mt-10">{error}</Text>
          ) : (
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <CarCard car={item} onPress={() => handleCardPress(item.id)} />
              )}
              contentContainerClassName="pb-32 px-5"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View className="flex-row justify-between items-center px-5 py-10">
                  <Text className="text-xl font-rubik-bold text-black-300">
                    Automóviles ({cars?.length})
                  </Text>
                  <CustomButton
                    text="Agregar"
                    onPress={() => setShowForm(true)}
                    icon="plus"
                  />
                </View>
              }
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Text className="text-gray-500">
                    No tienes automóviles registrados
                  </Text>
                  <CustomButton
                    text="Agregar primer auto"
                    onPress={() => setShowForm(true)}
                    className="mt-4"
                  />
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};
export default Car;
