export const CITIES = {
  "Leipzig, Germany": {
    coords: [51.340199, 12.360103],
    zoom: 12
  },
    "Luetzschena-stahmeln": {
    coords: [51.38092179236875, 12.291584502351071],
    zoom: 15
  },
  "Merano, Italy": {
    coords: [46.668858, 11.159953],
    zoom: 15
  }
};

export const DEFAULT_CITY = "Leipzig, Germany";

export const getCityName = (cityString) => {
  return cityString.split(',')[0].toLowerCase();
};

export const CITY_DISPLAY_NAMES = {
  "Leipzig, Germany": "Leipzig, Germany",
  "Luetzschena-stahmeln": "Lützschena-Stahmeln, Leipzig",
  "Merano, Italy": "Merano, Italy"
};

export const getCityDisplayName = (cityKey) => {
  return CITY_DISPLAY_NAMES[cityKey] || cityKey;
};

export const CITY_FLAGS = {
  'Leipzig, Germany': '🇩🇪',
  'Luetzschena-stahmeln': '🇩🇪',
  'Merano, Italy': '🇮🇹'
};

export const getCityFlag = (cityKey) => {
  return CITY_FLAGS[cityKey] ?? '';
}; 