import { useState, useEffect, useRef } from 'react';
import { calculateDistance } from '../utils/geometry';

export const useGeolocation = (enableTracking = true) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const lastLoc = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        if (!enableTracking) return;

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            
            if (!lastLoc.current || calculateDistance(lastLoc.current, newLocation) > 5) {
                lastLoc.current = newLocation;
                setLocation(newLocation);
            }
        };

        const handleError = (error) => {
            setError(error.message);
        };

        // Initial fetch
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy: true
        });

        // Interval update (every 15 seconds) as requested
        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 5000, // Allow 5s old cache
            timeout: 15000   // Increase timeout to 15s
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [enableTracking]);

    return { location, error };
};
