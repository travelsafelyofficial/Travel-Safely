export const searchLocations = async (query) => {
    if (!query || query.length < 2) return [];

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        const data = await response.json();

        return data.map(item => ({
            id: item.place_id,
            name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
};
