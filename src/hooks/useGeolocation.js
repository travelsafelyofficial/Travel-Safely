import { useState, useEffect } from 'react';

export const useGeolocation = (enableTracking = true) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        if (!enableTracking) return;

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
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
            maximumAge: 0,
            timeout: 5000
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [enableTracking]);

    return { location, error };
};
