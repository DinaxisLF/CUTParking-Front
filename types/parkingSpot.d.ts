export interface Location {
  latitude: number;
  longitude: number;
}

export interface ParkingSpot {
  id: number;
  location: Location;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  createdAt: string;
  section: string;
}
