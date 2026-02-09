export const getRoadRoute = async (start, end) => {
    if (!start || !end) return null;

    try {
        // OSRM Public API
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.error('OSRM Routing Error:', data.message || data.code);
            return null;
        }

        // Return the coordinates [lat, lng] for Polyline
        // OSRM returns [lng, lat], so we need to reverse them for Leaflet
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        return coordinates;
    } catch (error) {
        console.error('Failed to fetch road route:', error);
        return null;
    }
};
