import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import TopBar from "@/components/TopBar";
import CustomButton from "@/components/Button";
import { CarService } from "@/lib/apiService";
import { router } from "expo-router";

const handleDelete = async (carId: number) => {
  try {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar este auto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await CarService.deleteCarById(carId);
              // Éxito - regresar a la pantalla anterior y actualizar lista
              router.replace("/car"); // O router.back() si prefieres
              Alert.alert("Éxito", "El auto ha sido eliminado correctamente");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el auto");
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error("Error in delete confirmation:", error);
  }
};

export default function CarDetailsScreen() {
  const params = useLocalSearchParams();
  const car = JSON.parse(params.car as string);

  return (
    <SafeAreaView>
      <TopBar />
      <View className="flex flex-col justify-start px-5 py-10">
        <TouchableOpacity className="flex flex-col mt-4 items-start w-100 h-40 relative">
          <Image
            source={car.image ? { uri: car.image } : images.carExample}
            className="size-full rounded-2xl"
          />
          <Image
            source={images.cardGradient}
            className="size-full rounded-2xl absolute bottom-0"
          />
        </TouchableOpacity>
      </View>
      <View className="flex flex-col px-5">
        <Text className="text-2xl font-rubik-bold text-black-300 mt-5 text-center">
          Detalles del auto
        </Text>
        <Text className="text-xl font-rubik-bold text-black-300 mt-5">
          Modelo
        </Text>
        <Text className="text-xl font-rubik-medium text-black-300">
          {car.model}
        </Text>
        <Text className="text-xl font-rubik-bold text-black-300 mt-5">
          Placas
        </Text>
        <Text className="text-xl font-rubik-medium text-black-300">
          {car.carPlates}
        </Text>
      </View>
      <View className="flex flex-col justify-between items-center px-5">
        <CustomButton
          className="w-40 h-10 mt-10"
          text="Eliminar"
          variant="danger"
          onPress={() => handleDelete(car.id)}
        />
        <CustomButton
          className="w-40 h-10 mt-5"
          text="Regresar"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
