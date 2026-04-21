import axios from 'axios';

export const modelApi = {
  async getMultipleFeatures(cityName, query) {
    try {
      const response = await axios.post(
        `${window.config.apiUrl}/cities/${cityName}/multiple`,
        query,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getLogisticHexagonScores(cityName, query) {
    try {
      const response = await axios.post(
        `${window.config.apiUrl}/cities/${cityName}/regression/logistic/hexagons`,
        query,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

};