import * as Location from "expo-location";
import { useEffect, useState } from "react";

const userLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (newLocation) => setLocation(newLocation)
      );

      return () => subscription.remove();
    })();
  }, []);

  return location;
};

export default userLocation;
