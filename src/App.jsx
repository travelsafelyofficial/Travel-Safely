import { useState, useEffect } from 'react';
import Map from './components/Map';
import { useGeolocation } from './hooks/useGeolocation';
import { useHazardAlerts } from './hooks/useHazardAlerts';
import AdminLogin from './components/Admin/Login';
import AdminDashboard from './components/Admin/Dashboard';
import { Settings, Eye, EyeOff } from 'lucide-react';

// Mock Hazards for testing
const MOCK_HAZARDS = [
  { id: 1, name: 'Construction Zone', position: { lat: 13.7573, lng: 100.5028 } }, // Near default center
];

function App() {
  const [isTracking, setIsTracking] = useState(true);
  const { location, error } = useGeolocation(isTracking);

  // Initialize from localStorage or fallback to MOCK
  const [hazards, setHazards] = useState(() => {
    const saved = localStorage.getItem('hazard-nav-data');
    return saved ? JSON.parse(saved) : MOCK_HAZARDS;
  });

  // Save to localStorage whenever hazards change
  useEffect(() => {
    localStorage.setItem('hazard-nav-data', JSON.stringify(hazards));
  }, [hazards]);

  const [masterPasscode, setMasterPasscode] = useState(() => {
    return localStorage.getItem('hazard-nav-passcode') || '0142';
  });

  // Recovery code for resetting the master passcode
  const RECOVERY_CODE = '0135';

  useEffect(() => {
    localStorage.setItem('hazard-nav-passcode', masterPasscode);
  }, [masterPasscode]);

  const { activeAlert } = useHazardAlerts(location, hazards);
  const [destination, setDestination] = useState(null);

  const [view, setView] = useState('user'); // user, login, admin

  const handleLogin = () => setView('admin');
  const handleLogout = () => setView('user');

  const handleMapClick = (e) => {
    if (view === 'user') {
      setDestination({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const handleClearNavigation = () => setDestination(null);

  const handleAddHazard = (hazard) => {
    setHazards(prev => [...prev, hazard]);
  };

  const handleDeleteHazard = (id) => {
    setHazards(prev => prev.filter(h => h.id !== id));
  };

  if (view === 'login') {
    return (
      <AdminLogin
        onLogin={handleLogin}
        masterPasscode={masterPasscode}
        recoveryCode={RECOVERY_CODE}
        onResetPasscode={setMasterPasscode}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        hazards={hazards}
        onAddHazard={handleAddHazard}
        onDeleteHazard={handleDeleteHazard}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Error: {error}
        </div>
      )}

      {/* Hazard Alert Banner */}
      {activeAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] animate-bounce w-full max-w-sm px-4">
          <div className="bg-red-600/95 backdrop-blur-md text-white px-5 py-5 rounded-2xl shadow-2xl border-4 border-red-400 flex flex-col items-center text-center gap-2">
            <div className="bg-white p-3 rounded-full shadow-md">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xl tracking-tight leading-tight">HAZARD WARNING</h3>
              <p className="font-medium text-sm opacity-90">{activeAlert}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-[9999] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Travel Safely
        </h1>
        {location ? (
          <p className="text-sm text-gray-600 mt-1">
            GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1 animate-pulse">
            {isTracking ? "Locating..." : "Tracking Paused"}
          </p>
        )}
      </div>

      {/* Controls Container */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-3">
        {/* Tracking Toggle */}
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`p-3 rounded-full shadow-lg transition-colors text-white ${isTracking ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'
            }`}
          title={isTracking ? "Stop Tracking" : "Start Tracking"}
        >
          {isTracking ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
        </button>

        {/* Admin Button */}
        <button
          onClick={() => setView('login')}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Admin Access"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {destination && (
        <button
          onClick={handleClearNavigation}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:bg-red-700 font-black text-xl border-2 border-red-400 animate-pulse"
        >
          End Navigation
        </button>
      )}

      <Map
        userLocation={location}
        hazards={hazards}
        destination={destination}
        onMapClick={handleMapClick}
      />
    </div>
  );
}

export default App;
