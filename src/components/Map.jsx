import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getRoadRoute } from '../utils/routing';

// Fix default icon issue with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// New User Icon (Blue Dot)
const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="background-color: #4285F4; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7]
});

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            // "Unlock" audio for browsers
            if ('speechSynthesis' in window) {
                const unlocker = new SpeechSynthesisUtterance('');
                unlocker.volume = 0;
                window.speechSynthesis.speak(unlocker);
            }
            onMapClick && onMapClick({ latLng: { lat: () => e.latlng.lat, lng: () => e.latlng.lng } });
        },
    });
    return null;
};

// Component to update center when user location changes
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
};

const Map = ({ userLocation, hazards = [], destination = null, onMapClick }) => {
    const defaultCenter = [13.7563, 100.5018]; // Bangkok
    const [route, setRoute] = React.useState([]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (userLocation && destination) {
                const roadCoords = await getRoadRoute(userLocation, destination);
                if (roadCoords) {
                    setRoute(roadCoords);
                } else {
                    // Fallback to straight line if API fails
                    setRoute([[userLocation.lat, userLocation.lng], [destination.lat, destination.lng]]);
                }
            } else {
                setRoute([]);
            }
        };

        fetchRoute();
    }, [userLocation, destination]);

    return (
        <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
            zoom={15}
            style={{ width: '100%', height: '100vh' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Handle Clicks */}
            <MapEvents onMapClick={onMapClick} />

            {/* Recenter on User */}
            {userLocation && <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />}

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}

            {/* Hazards */}
            {hazards.map((hazard) => (
                <React.Fragment key={hazard.id}>
                    <Circle
                        center={[hazard.position.lat, hazard.position.lng]}
                        radius={500}
                        pathOptions={{ color: 'red', fillColor: '#FF0000', fillOpacity: 0.2 }}
                    />
                    <Marker position={[hazard.position.lat, hazard.position.lng]}>
                        <Popup>{hazard.name}</Popup>
                    </Marker>
                </React.Fragment>
            ))}

            {/* Destination & Road Route */}
            {destination && (
                <>
                    <Marker position={[destination.lat, destination.lng]} >
                        <Popup>Destination</Popup>
                    </Marker>
                    {route.length > 0 && (
                        <Polyline
                            positions={route}
                            pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8 }}
                        />
                    )}
                </>
            )}
        </MapContainer>
    );
};

export default React.memo(Map);
