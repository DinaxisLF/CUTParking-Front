import { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomButton from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReservationsService } from "@/lib/apiService";
import { Car } from "@/types/car";
import { CarService } from "@/lib/apiService";
import DropDownPicker from "react-native-dropdown-picker"; // ← new import

type ReservationFormProps = {
  spotId: number;
  onCancel: () => void;
  onSubmit: (reservationId: number) => void;
};

export const ReservationForm = ({
  spotId,
  onCancel,
  onSubmit,
}: ReservationFormProps) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [loadingCars, setLoadingCars] = useState(true);

  // Dropdown Picker state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]); // for DropDownPicker

  useEffect(() => {
    const fetchUserCars = async () => {
      try {
        const userCars = await CarService.getUserCars();
        setCars(userCars);
        const dropdownItems = userCars.map((car: Car) => ({
          label: `${car.model} (${car.carPlates})`,
          value: car.id,
        }));
        setItems(dropdownItems);

        if (userCars.length > 0) {
          setSelectedCarId(userCars[0].id);
        }

        if (userCars.length === 0) {
          Alert.alert("Debes registrar un auto antes de poder reservar");
        }
      } catch (error) {
        console.error("Error fetching user cars:", error);
        Alert.alert("Error", "No se pudieron cargar los vehículos");
      } finally {
        setLoadingCars(false);
      }
    };

    fetchUserCars();
  }, []);

  const handleSubmit = async () => {
    if (startDate >= endDate) {
      Alert.alert("Error", "La hora de fin debe ser posterior a la de inicio");
      return;
    }

    if (!selectedCarId) {
      Alert.alert("Error", "Por favor selecciona un vehículo");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User not found");

      const response = await ReservationsService.CreateReservation({
        userId: parseInt(userId),
        spotId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        userCarId: selectedCarId,
      });

      if (response && response.reservationId) {
        onSubmit(response.reservationId);
      } else {
        throw new Error("Invalid reservation response");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo completar la reserva");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartDateConfirm = (date: Date) => {
    const now = new Date();
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (date.getTime() < now.getTime()) {
      Alert.alert(
        "Hora inválida",
        "La hora seleccionada no puede ser anterior a la hora actual."
      );
      setStartPickerVisible(false); // Close the picker if the time is invalid
      return; // Prevent further execution
    }

    if (!isSameDay) {
      Alert.alert("Fecha inválida", "Solo puedes reservar para hoy.");
      return setStartPickerVisible(false);
    }

    const hours = date.getHours();

    if (hours < 7 || hours > 20) {
      Alert.alert(
        "Hora inválida",
        "Solo puedes reservar entre 7:00am y 8:00pm."
      );
      return setStartPickerVisible(false);
    }

    setStartDate(date);
    setStartPickerVisible(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    const now = new Date();
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (date.getTime() < now.getTime()) {
      Alert.alert(
        "Hora inválida",
        "La hora seleccionada no puede ser anterior a la hora actual."
      );
      setEndPickerVisible(false); // Close the picker if the time is invalid
      return; // Prevent further execution
    }

    if (!isSameDay) {
      Alert.alert("Fecha inválida", "Solo puedes reservar para hoy.");
      return setEndPickerVisible(false);
    }

    const hours = date.getHours();

    if (hours < 7 || hours > 20) {
      Alert.alert(
        "Hora inválida",
        "Solo puedes reservar entre 7:00am y 8:00pm."
      );

      if (date.getTime() <= startDate.getTime()) {
        Alert.alert(
          "Hora de fin inválida",
          "La hora de fin debe ser posterior a la hora de inicio."
        );
        setEndPickerVisible(false); // Close the picker if the end time is invalid
        return;
      }

      return setEndPickerVisible(false);
    }

    setEndDate(date);
    setEndPickerVisible(false);
  };

  return (
    <View className="p-5 bg-white rounded-lg shadow-md w-full">
      <Text className="text-xl font-rubik-bold mb-4">Reservar Espacio</Text>

      {/* Car Selection */}
      <Text className="text-m font-rubik-medium mb-2">Vehículo</Text>
      {loadingCars ? (
        <Text>Cargando vehículos...</Text>
      ) : cars.length === 0 ? (
        <Text className="text-red-500">
          No tienes vehículos registrados. Por favor agrega uno primero.
        </Text>
      ) : (
        <DropDownPicker
          open={open}
          value={selectedCarId}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedCarId}
          setItems={setItems}
          placeholder="Selecciona un vehículo"
          style={{
            borderColor: "#ccc",
            marginBottom: open ? 150 : 20,
          }}
          dropDownContainerStyle={{
            borderColor: "#ccc",
          }}
        />
      )}

      <Text className="text-m font-rubik-medium mb-2">Hora de inicio</Text>
      <CustomButton
        text={startDate.toLocaleString()}
        variant="secondary"
        onPress={() => setStartPickerVisible(true)}
      />

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="datetime"
        date={startDate}
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartPickerVisible(false)}
      />

      <Text className="text-m font-rubik-medium mb-2 mt-4">Hora de fin</Text>
      <CustomButton
        text={endDate.toLocaleString()}
        variant="secondary"
        onPress={() => setEndPickerVisible(true)}
      />

      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="datetime"
        minimumDate={startDate}
        date={endDate}
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndPickerVisible(false)}
      />

      <View className="flex-row justify-end space-x-3 mt-6">
        <CustomButton text="Cancelar" variant="secondary" onPress={onCancel} />
        <CustomButton
          text={isSubmitting ? "Reservando..." : "Confirmar"}
          onPress={handleSubmit}
          disabled={isSubmitting || cars.length === 0}
        />
      </View>
    </View>
  );
};
