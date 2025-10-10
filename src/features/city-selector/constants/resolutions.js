export const DEFAULT_RESOLUTIONS = [
  { value: 7, label: 'City Overview', description: '4.8km hexagons' },
  { value: 8, label: 'Neighborhood', description: '1.2km hexagons' },
  { value: 9, label: 'Precise Planning', description: '300m hexagons' }
];

export const DEFAULT_RESOLUTION = 9;

export const FEATURE_TYPES = {
  NEAREST: 'nearest',
  COUNT: 'count',
  PRESENT: 'present',
  DISTRICT: 'district'
};

export const DYNAMIC_FEATURE_TYPES = [
  FEATURE_TYPES.NEAREST,
  FEATURE_TYPES.COUNT,
  FEATURE_TYPES.PRESENT
]; 