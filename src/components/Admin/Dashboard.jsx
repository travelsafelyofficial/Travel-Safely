import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, Trash2, MapPin, Save, X, Navigation, Search, Loader2 } from 'lucide-react';
import { searchLocations } from '../../utils/geocoding';

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

// Component to sync map size
const AutoInvalidateSize = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Component to fly to specific location
const FlyToLocation = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

// Map Event Component for Admin
const AddMarkerOnClick = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick({ latLng: { lat: () => e.latlng.lat, lng: () => e.latlng.lng } });
            }
        },
    });
    return null;
};

// User Dot Icon
const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="background-color: #4285F4; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7]
});

const AdminDashboard = ({ hazards, onAddHazard, onDeleteHazard, onLogout, currentLocation, geoError }) => {
    const [mode, setMode] = useState('view'); // view, add_manual, add_map, add_search
    const [newHazard, setNewHazard] = useState({ name: '', lat: '', lng: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
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

    const handleSetCurrentLocation = () => {
        if (currentLocation) {
            setNewHazard({
                name: '',
                lat: currentLocation.lat,
                lng: currentLocation.lng
            });
            setMode('add_manual');
        } else {
            alert(geoError || "Waiting for GPS... Please ensure location is enabled and permissions are granted.");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleSelectSearchResult = (result) => {
        setNewHazard({
            name: '',
            lat: result.lat,
            lng: result.lng
        });
        setMode('add_manual');
        setSearchQuery('');
        setSearchResults([]);
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
                                    onClick={() => {
                                        setMode('add_search');
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="w-full bg-purple-100 text-purple-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors font-medium border border-purple-200"
                                >
                                    <Search className="w-5 h-5" /> Search Location
                                </button>
                                <button
                                    onClick={handleSetCurrentLocation}
                                    className="w-full bg-orange-100 text-orange-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 transition-colors font-medium border border-orange-200"
                                >
                                    <Navigation className="w-5 h-5" /> Set at Current Location
                                </button>
                                <button
                                    onClick={() => setMode('add_manual')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5" /> Enter Coordinates
                                </button>
                            </div>
                        ) : mode === 'add_search' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">Search Location</h3>
                                    <button onClick={() => setMode('view')} className="p-1 hover:bg-gray-100 rounded-full">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="City, Street, or Place..."
                                        className="flex-1 border border-gray-300 p-2 rounded-lg"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    </button>
                                </form>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(result => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleSelectSearchResult(result)}
                                                className="w-full text-left p-3 text-sm hover:bg-gray-50 rounded-lg border border-transparent hover:border-purple-200 transition-all"
                                            >
                                                <p className="font-medium text-gray-800 line-clamp-1">{result.name}</p>
                                                <p className="text-xs text-gray-500">{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</p>
                                            </button>
                                        ))
                                    ) : (
                                        !isSearching && searchQuery && <p className="text-center text-sm text-gray-500 py-4">No results found</p>
                                    )}
                                </div>
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
                        <AutoInvalidateSize />
                        {newHazard.lat && mode === 'add_manual' && (
                            <FlyToLocation lat={parseFloat(newHazard.lat)} lng={parseFloat(newHazard.lng)} />
                        )}

                        {currentLocation && (
                            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon} zIndexOffset={1000} />
                        )}

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
