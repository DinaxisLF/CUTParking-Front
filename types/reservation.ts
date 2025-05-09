export type Reservation = {
  reservationId: number;
  spotId: string;
  spotSection: string;
  startTime: string;
  endTime: string;
  qrCodeUrl?: string;
  carModel: string;
  carPlates: string;
  status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
};

export type ActiveReservation = {
  reservation_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: string | null;
    cars: {
      id: number;
      carPlates: string;
      model: string;
    }[];
  };
  spot: {
    id: number;
    location: {
      latitude: number;
      longitude: number;
    };
    status: string;
    createdAt: string;
    section: string;
  };
  startTime: string;
  endTime: string;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  qrCodeUrl: string;
  userCar: {
    id: number;
    carPlates: string;
    model: string;
  };
};
