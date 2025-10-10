export const CITIES = {
  "Leipzig, Germany": {
    coords: [51.340199, 12.360103],
    zoom: 12
  },
  //"Dresden, Germany": {
   // coords: [51.050000, 13.736000],
   // zoom: 12
 // },
  "Merano, Italy": {
    coords: [46.668858, 11.159953],
    zoom: 14
  }
};

export const DEFAULT_CITY = "Leipzig, Germany";

export const getCityName = (cityString) => {
  return cityString.split(',')[0].toLowerCase();
}; 