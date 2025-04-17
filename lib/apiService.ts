// apiService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { ParkingSpot } from "@/types/parkingSpot";
import { Reservation } from "@/types/reservation";
import { Penalty } from "@/types/penaltie";

const api = axios.create({
  baseURL: "http://192.168.50.53:8080/api",
});

export const CarService = {
  getUserCars: async () => {
    try {
      // 1. Obtener token y userId (en paralelo para mejor rendimiento)
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userId"),
      ]);

      // 2. Validar credenciales
      if (!token) throw new Error("No authentication token found");
      if (!userId) throw new Error("No user ID found");

      // 3. Hacer la petición
      const response = await api.get(`/car/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Recomendado
        },
      });

      // 4. Validar respuesta
      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("User cars data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user cars:", error);
    }
  },

  CreateCar: async (carData: { plates: string; model: string }) => {
    try {
      const [jwtToken, userId] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userId"),
      ]);

      if (!jwtToken || !userId) {
        throw new Error("Authentication required");
      }

      const response = await api.post(
        "/car",
        {
          carPlates: carData.plates,
          model: carData.model,
          ownerId: parseInt(userId), // Convertir a número
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating car:", error);
      throw error;
    }
  },

  getCarById: async (carId: number) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get(`/car/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("Car detail data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching car details:", error);
      throw error;
    }
  },

  deleteCarById: async (carId: number) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await api.delete(`/car/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log("Car deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting car:", error);
      throw error;
    }
  },
};

export const ParkingSpotService = {
  getAvailableParkingSpots: async (): Promise<ParkingSpot[]> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get<ParkingSpot[]>(
        "/parking-spots/available",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<ParkingSpot> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get(`/parking-spots/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      throw error;
    }
  },
};

export const ReservationsService = {
  CreateReservation: async (reservationData: {
    userId: number;
    spotId: number;
    startTime: string;
    endTime: string;
    userCarId: number;
  }) => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");

      if (!jwtToken) {
        throw new Error("Authentication required");
      }

      const response = await api.post("/reservations/create", reservationData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  cancelReservation: async (reservationId: number, userId: number) => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");

      if (!jwtToken) {
        throw new Error("Authentication required");
      }

      const response = await api.put(
        `/reservations/cancel?reservationId=${reservationId}&userId=${userId}`,
        null, // No request body
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      throw error;
    }
  },

  getReservationDetails: async (reservationId: number) => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      if (!jwtToken) throw new Error("Authentication required");

      const response = await api.get(`/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching reservation details:", error);
      throw error;
    }
  },

  // In your apiService.ts
  getUserReservations: async (): Promise<Reservation[]> => {
    try {
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userId"),
      ]);

      if (!token) throw new Error("No authentication token found");
      if (!userId) throw new Error("No user ID found");

      const response = await api.get(`/reservations/user/${userId}/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data as Reservation[];
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      throw error;
    }
  },
};

export const PenaltiesService = {
  getUserPenalties: async (): Promise<Penalty[]> => {
    try {
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userId"),
      ]);

      if (!token) throw new Error("No authentication token found");
      if (!userId) throw new Error("No user ID found");

      const response = await api.get(`/penalties/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data as Penalty[];
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      throw error;
    }
  },
};
