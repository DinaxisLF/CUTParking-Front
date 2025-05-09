import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "@/components/Button";
import { Car } from "@/types/car";
import { Ionicons } from "@expo/vector-icons";

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reservationData: {
    startTime: Date;
    endTime: Date;
    userCarId: number;
  }) => Promise<void>;
  userCars: Car[];
  spotId: number;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userCars,
  spotId,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSubmit = async () => {
    if (!selectedCarId) {
      Alert.alert("Error", "Por favor selecciona un vehículo");
      return;
    }

    if (startDate >= endDate) {
      Alert.alert(
        "Error",
        "La hora de fin debe ser posterior a la hora de inicio"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        startTime: startDate,
        endTime: endDate,
        userCarId: selectedCarId,
      });
    } catch (error) {
      console.error("Reservation error:", error);
      Alert.alert("Error", "No se pudo completar la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Reservación</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content}>
          {/* Car Selection */}
          <Text style={styles.label}>Vehículo</Text>
          {userCars.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCarId}
                onValueChange={(itemValue) => setSelectedCarId(itemValue)}
              >
                {userCars.map((car) => (
                  <Picker.Item
                    key={car.id}
                    label={`${car.model} (${car.carPlates})`}
                    value={car.id}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.errorText}>
              No tienes vehículos registrados. Por favor agrega uno primero.
            </Text>
          )}

          {/* Start Time */}
          <Text style={styles.label}>Hora de inicio</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Text>{formatTime(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setStartDate(selectedDate);
                  // Auto-set end time to 1 hour later
                  const end = new Date(selectedDate);
                  end.setHours(end.getHours() + 1);
                  setEndDate(end);
                }
              }}
            />
          )}

          {/* End Time */}
          <Text style={styles.label}>Hora de fin</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Text>{formatTime(endDate)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="time"
              display="spinner"
              minimumDate={startDate}
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <CustomButton
              text="Cancelar"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
            />
            <CustomButton
              text={isSubmitting ? "Reservando..." : "Confirmar"}
              onPress={handleSubmit}
              disabled={isSubmitting || userCars.length === 0}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#1e293b",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ReservationModal;
