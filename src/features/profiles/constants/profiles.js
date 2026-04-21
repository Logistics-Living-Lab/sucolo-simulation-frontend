import { leipzig_profiles } from './leipzig_profiles.js';
import { luetzschena_stahmeln_profiles } from './luetzschena_stahmeln_profiles.js';
import { merano_profiles } from './merano_profiles.js';

export const PROFILES_BY_CITY = {
  "Leipzig, Germany": leipzig_profiles,
  "Luetzschena-stahmeln": luetzschena_stahmeln_profiles,
  "Merano, Italy": merano_profiles
};

const DEFAULT_CITY_KEY = "Leipzig, Germany";

export function getProfilesForCity(cityKey) {
  return PROFILES_BY_CITY[cityKey] ?? PROFILES_BY_CITY[DEFAULT_CITY_KEY];
}

export const Profiles = leipzig_profiles;