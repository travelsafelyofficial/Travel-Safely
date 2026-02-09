import { useState } from 'react';
import { Lock, Unlock, RefreshCw, Check } from 'lucide-react';

const AdminLogin = ({ onLogin, masterPasscode, recoveryCode, onResetPasscode }) => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState('login'); // login, reset
    // eslint-disable-next-line no-unused-vars
    const [newPasscode, setNewPasscode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'login') {
            if (passcode === masterPasscode) {
                onLogin();
            } else if (passcode === recoveryCode) {
                setMode('reset');
                setPasscode('');
                setError('Recovery mode activated. Enter new passcode.');
            } else {
                setError('Invalid passcode');
            }
        } else if (mode === 'reset') {
            if (passcode.length === 4) {
                onResetPasscode(passcode);
                setMode('login');
                setPasscode('');
                setError('Passcode updated successfully. Please login.');
            } else {
                setError('Passcode must be 4 digits.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full ${mode === 'reset' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        {mode === 'reset' ? <RefreshCw className="w-8 h-8 text-orange-600 animate-spin-slow" /> : <Lock className="w-8 h-8 text-gray-800" />}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    {mode === 'reset' ? 'Reset Passcode' : 'Admin Access'}
                </h2>
                {mode === 'reset' && <p className="text-center text-sm text-gray-500 mb-4">Enter your new 4-digit passcode</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            maxLength={4}
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className={`w-full text-center text-3xl font-mono tracking-widest border rounded-lg p-3 focus:outline-none focus:ring-2 ${mode === 'reset' ? 'border-orange-300 focus:ring-orange-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            placeholder="••••"
                        />
                    </div>

                    {error && (
                        <p className={`text-center text-sm font-medium ${error.includes('successfully') || error.includes('activated') ? 'text-green-600' : 'text-red-500'}`}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={`w-full text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${mode === 'reset' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {mode === 'reset' ? <Check className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {mode === 'reset' ? 'Set New Passcode' : 'Enter System'}
                    </button>

                    {mode === 'reset' && (
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setPasscode(''); setError(''); }}
                            className="w-full text-gray-500 text-sm hover:underline"
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
