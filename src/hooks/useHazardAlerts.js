import { useEffect, useState, useRef } from 'react';
import { calculateDistance } from '../utils/geometry';

export const useHazardAlerts = (userLocation, hazards) => {
    const [activeAlert, setActiveAlert] = useState(null);
    const lastAlertTime = useRef({});
    const ALERT_COOLDOWN = 15000; // 15 seconds cooldown per hazard

    useEffect(() => {
        if (!userLocation || !hazards) return;

        let closestHazard = null;
        let minDistance = Infinity;

        hazards.forEach(hazard => {
            const distance = calculateDistance(userLocation, hazard.position);

            if (distance <= 500) {
                if (distance < minDistance) {
                    minDistance = distance;
                    closestHazard = hazard;
                }

                // Check cooldown for VOICE alerts only
                const now = Date.now();
                if (!lastAlertTime.current[hazard.id] || (now - lastAlertTime.current[hazard.id] > ALERT_COOLDOWN)) {
                    speakAlert(hazard);
                    lastAlertTime.current[hazard.id] = now;
                }
            }
        });

        if (closestHazard) {
            setActiveAlert(`Warning: Approaching ${closestHazard.name} (Dist: ${minDistance.toFixed(1)}m)`);
        } else {
            setActiveAlert(null);
        }

    }, [userLocation, hazards]);

    const speakAlert = (hazard) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            // Brief delay ensures cancel finishes
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(`Warning. Approaching hazard: ${hazard.name}. Please be careful.`);
                utterance.rate = 1.0;
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            }, 50);
        }
    };

    return { activeAlert };
};
