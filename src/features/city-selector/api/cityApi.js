import axios from 'axios';
//handles all city-specific data retrieval and geographic operations.
export const cityApi = {
  async healthCheck() {
    try {
      const response = await axios.get(`${window.config.apiUrl}/health`);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.warn("Backend server not available. Health check failed.");
        return { status: "unhealthy", error: "Network error" };
      }
      if (error.response && error.response.status === 500) {
        return { status: "unhealthy", error: "Server error" };
      }
      console.error("Error checking backend health:", error);
      return { status: "unhealthy", error: error.message };
    }
  },

  async getResolutions(cityName) {
    try {
      const response = await axios.get(`${window.config.apiUrl}/cities/${cityName}/hex_resolutions`);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.warn("Backend server not available. Hex resolutions will not be loaded.");
        return null;
      }
      console.error("Error fetching hex resolutions:", error);
      return null;
    }
  },

  async getAmenities(cityName) {
    try {
      const response = await axios.get(`${window.config.apiUrl}/cities/${cityName}/amenities`);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.warn("Backend server not available. Amenities will not be loaded.");
        return [];
      }
      console.error("Error fetching amenities:", error);
      throw error;
    }
  },

  async getHexagons(cityName, resolution = 9, features = []) {
    try {
      const response = await axios.get(`${window.config.apiUrl}/cities/${cityName}/hexagons`, {
        params: {
          resolution: resolution,
          features: features
        }
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.warn("Backend server not available. Hexagon data will not be loaded.");
        return {};
      }
      console.error("Error fetching hexagons:", error);
      throw error;
    }
  },

  async getDistrictAttributes(cityName) {
    try {
      const response = await axios.get(`${window.config.apiUrl}/cities/${cityName}/district_attributes`);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.warn("Backend server not available. District attributes will not be loaded.");
        return [];
      }
      console.error("Error fetching district attributes:", error);
      throw error;
    }
  }
}; 