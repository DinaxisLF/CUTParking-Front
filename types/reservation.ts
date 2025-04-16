export type Reservation = {
  reservationId: number;
  spotId: string;
  spotSection: string;
  startTime: string;
  endTime: string;
  qrCodeUrl?: string;
  carModel: string;
  carPlates: string;
};
