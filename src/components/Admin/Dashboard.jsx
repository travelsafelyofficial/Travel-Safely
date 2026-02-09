import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, Trash2, MapPin, Save, X } from 'lucide-react';

// Shared Icon Logic (idempotent)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map Event Component for Admin
const AddMarkerOnClick = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            // Safe check
            if (onMapClick) {
                onMapClick({ latLng: { lat: () => e.latlng.lat, lng: () => e.latlng.lng } });
            }
        },
    });
    return null;
};

const AdminDashboard = ({ hazards, onAddHazard, onDeleteHazard, onLogout }) => {
    const [mode, setMode] = useState('view'); // view, add_manual, add_map
    const [newHazard, setNewHazard] = useState({ name: '', lat: '', lng: '' });
    const mapCenter = [13.7563, 100.5018];
    const [mounted, setMounted] = useState(false);

    // Debug mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMapClick = (e) => {
        if (mode === 'add_map') {
            setNewHazard(prev => ({
                ...prev,
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            }));
        }
    };

    const handleSubmit = () => {
        if (!newHazard.name || !newHazard.lat || !newHazard.lng) return;
        onAddHazard({
            id: Date.now(),
            name: newHazard.name,
            position: { lat: parseFloat(newHazard.lat), lng: parseFloat(newHazard.lng) }
        });
        setMode('view');
        setNewHazard({ name: '', lat: '', lng: '' });
    };

    if (!mounted) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="relative w-full h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Travel Safely Admin
                </h1>
                <button onClick={onLogout} className="text-sm text-gray-600 hover:text-red-600">
                    Logout
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden h-full">
                {/* Sidebar */}
                <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 h-full">
                    <div className="p-4 border-b border-gray-100">
                        {mode === 'view' ? (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setMode('add_map')}
                                    className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors font-medium"
                                >
                                    <MapPin className="w-5 h-5" /> Select on Map
                                </button>
                                <button
                                    onClick={() => setMode('add_manual')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5" /> Enter Coordinates
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">Add New Hazard</h3>
                                    <button onClick={() => setMode('view')} className="p-1 hover:bg-gray-100 rounded-full">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Hazard Name"
                                        className="w-full border border-gray-300 p-2 rounded-lg"
                                        value={newHazard.name}
                                        onChange={e => setNewHazard({ ...newHazard, name: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Lat"
                                            className="w-full border border-gray-300 p-2 rounded-lg"
                                            value={newHazard.lat}
                                            onChange={e => setNewHazard({ ...newHazard, lat: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Lng"
                                            className="w-full border border-gray-300 p-2 rounded-lg"
                                            value={newHazard.lng}
                                            onChange={e => setNewHazard({ ...newHazard, lng: e.target.value })}
                                        />
                                    </div>
                                    {mode === 'add_map' && (
                                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            Tip: Click on the map to set location
                                        </p>
                                    )}
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save Hazard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2">Active Hazards</h3>
                        {hazards.map(hazard => (
                            <div key={hazard.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center group hover:border-red-200 hover:shadow-sm transition-all">
                                <div>
                                    <p className="font-medium text-gray-800">{hazard.name}</p>
                                    <p className="text-xs text-gray-500">{hazard.position.lat.toFixed(4)}, {hazard.position.lng.toFixed(4)}</p>
                                </div>
                                <button onClick={() => onDeleteHazard(hazard.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View */}
                <div className="flex-1 bg-gray-200 h-full relative">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <AddMarkerOnClick onMapClick={handleMapClick} />

                        {hazards.map(hazard => (
                            <div key={hazard.id}>
                                <Circle
                                    center={[hazard.position.lat, hazard.position.lng]}
                                    radius={500}
                                    pathOptions={{ color: 'red', fillColor: '#FF0000', fillOpacity: 0.2 }}
                                />
                                <Marker position={[hazard.position.lat, hazard.position.lng]} icon={DefaultIcon} />
                            </div>
                        ))}

                        {/* Preview Marker */}
                        {mode === 'add_map' && newHazard.lat && (
                            <Marker
                                position={[parseFloat(newHazard.lat), parseFloat(newHazard.lng)]}
                                opacity={0.7}
                                icon={DefaultIcon}
                            />
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
