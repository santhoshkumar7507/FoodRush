import { useState, useEffect } from 'react';

export default function useGPS() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      // Simulate Bangalore default
      setLocation({ lat: 12.9716, lng: 77.5946 });
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };

    const handleError = (error) => {
      setError(error.message);
      // Simulate default if failed
      setLocation({ lat: 12.9716, lng: 77.5946 });
    };

    const watcherId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return { location, error };
}
