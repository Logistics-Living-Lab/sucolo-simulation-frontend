export const leipzig_profiles = {
  RETIREE: {
    name: 'Profile 1',
    description: 'Retiree-friendly location',
    freeTerm: -0.9,
    districtFeatures: [
      { name: "Average age", weight: 9 },
      { name: "Households with 2 people", weight: 8 },
      { name: "Pensions", weight: 6 },
      { name: "Population density", weight: -8 },
      { name: "Housing", weight: -1 }
    ],
    nearestAmenities: [
      { name: "healthcare", distance: 201, weight: 8, penalty: 600 },
      { name: "hospital", distance: 1000, weight: 6, penalty: 400 },
      { name: "station_wheelchair", distance: 201, weight: 8, penalty: 800 },
      { name: "supermarket", distance: 400, weight: 8, penalty: 800 },
      { name: "post_office_wheelchair", distance: 400, weight: 4, penalty: 200 },
      { name: "community_centre_wheelchair", distance: 201, weight: 8, penalty: 800 },
      { name: "cafe_wheelchair", distance: 1000, weight: 5, penalty: 200 }
    ],
    countAmenities: [
      { name: "station", distance: 201, weight: 8 },
      { name: "entertainment", distance: 400, weight: 4 }
    ],
    presentAmenities: [
      { name: "healthcare_wheelchair", distance: 201, weight: 6 },
      { name: "supermarket_wheelchair", distance: 201, weight: 8 },
      { name: "community_centre", distance: 201, weight: 6 },
      { name: "restaurant_wheelchair", distance: 1200, weight: 2 }
    ]
  },
  FAMILY: {
    name: 'Profile 2',
    description: 'Young family-friendly location',
    freeTerm: -0.5,
    districtFeatures: [
      { name: "Average age", weight: -3 },
      { name: "Households with 4 people", weight: 8 },
      { name: "Employed income", weight: 7 },
      { name: "Population density", weight: -8 },
      { name: "Housing", weight: -1 }
    ],
    nearestAmenities: [
      { name: "station", distance: 400, weight: 4, penalty: 600 },
      { name: "entertainment", distance: 1200, weight: 6, penalty: 400 },
      { name: "healthcare", distance: 400, weight: 6, penalty: 400 },
      { name: "education", distance: 400, weight: 8, penalty: 600 },
      { name: "library", distance: 1000, weight: 4, penalty: 400 },
      { name: "cafe", distance: 1200, weight: 4, penalty: 200 },
      { name: "restaurant", distance: 1200, weight: 5, penalty: 0 },
      { name: "supermarket", distance: 1000, weight: 6, penalty: 200 }
    ],
    countAmenities: [
      { name: "local_business", distance: 300, weight: 4 },
      { name: "entertainment", distance: 201, weight: 8 }
    ],
    presentAmenities: [
      { name: "station_wheelchair", distance: 201, weight: 6 }
    ]
  },
  STUDENT: {
    name: 'Profile 3',
    description: 'Young student friendly location',
    freeTerm: -0.3,
    districtFeatures: [
      { name: "Average age", weight: -8 },
      { name: "Households with 2 people", weight: 6 },
      { name: "Employed income", weight: -6 },
      { name: "Population density", weight: -8 },
      { name: "Housing", weight: -1 }
    ],
    nearestAmenities: [
      { name: "station", distance: 400, weight: 8, penalty: 800 },
      { name: "education", distance: 500, weight: 7, penalty: 500 },
      { name: "supermarket", distance: 201, weight: 6, penalty: 500 }
    ],
    countAmenities: [
      { name: "local_business", distance: 300, weight: 4 },
      { name: "entertainment", distance: 201, weight: 8 }
    ],
    presentAmenities: [
      { name: "cafe", distance: 1200, weight: 2 },
      { name: "restaurant", distance: 1200, weight: 1 },
      { name: "bicycle_rental", distance: 1200, weight: 1 },
      { name: "kiosk", distance: 1200, weight: 4 }
    ]
  },
  MICRO_HUB: {
    name: 'Micro-Hub',
    description: 'Profile for micro logistics hubs',
    freeTerm: -0.4,
    districtFeatures: [
      { name: "Population density", weight: -6 },
      { name: "Employed income", weight: 3 },
      { name: "Households with 2 people", weight: 5 },
      { name: "Households with 3 people", weight: 5 }
    ],
    nearestAmenities: [
      { name: "station", distance: 300, weight: 8, penalty: 800 },
      { name: "supermarket", distance: 400, weight: 7, penalty: 600 },
      { name: "post_office_wheelchair", distance: 400, weight: 6, penalty: 500 },
      { name: "local_business", distance: 300, weight: 8 }
    ],
    presentAmenities: [
      { name: "station_wheelchair", distance: 201, weight: 6 },
      { name: "supermarket_wheelchair", distance: 201, weight: 6 }
    ]
  },
  PICKUP_STATION: {
    name: 'Pick-up Station',
    description: 'Profile for parcel pick-up stations',
    freeTerm: -0.6,
    districtFeatures: [
      { name: "Households with 3 people", weight: 6 },
      { name: "Households with 4 people", weight: 6 },
      { name: "Households with 5 or more people", weight: 6 }
    ],
    nearestAmenities: [
      { name: "supermarket", distance: 201, weight: 8, penalty: 800 },
      { name: "station", distance: 400, weight: 5, penalty: 800 },
      { name: "public_transport", distance: 201, weight: 5, penalty: 800 },
      { name: "post_office", distance: 400, weight: 4, penalty: 600 },
      { name: "local_business", distance: 201, weight: 8, penalty: 800 },
      { name: "entertainment", distance: 201, weight: 4, penalty: 800 }
    ],
    presentAmenities: [
      { name: "gas_station", distance: 300, weight: 4 },
      { name: "education", distance: 300, weight: 4 }
    ]
  },
  MOBILITY_HUB: {
    name: 'Mobility-Hub',
    description: 'Profile for multimodal mobility hubs',
    freeTerm: -0.2,
    districtFeatures: [
      { name: "Employed income", weight: 3 },
      { name: "Average age", weight: -3 }
    ],
    nearestAmenities: [
      { name: "station", distance: 300, weight: 9, penalty: 900 },
      { name: "station_wheelchair", distance: 300, weight: 8, penalty: 800 },
      { name: "bicycle_rental", distance: 500, weight: 6, penalty: 500 },
      { name: "rental_service", distance: 600, weight: 4, penalty: 400 },
      { name: "public_transport", distance: 800, weight: 3, penalty: 300 }
    ],
    countAmenities: [
      { name: "entertainment", distance: 400, weight: 4 },
      { name: "local_business", distance: 400, weight: 3 },
      { name: "station_wheelchair", distance: 201, weight: 8 },
      { name: "public_transport_wheelchair", distance: 201, weight: 8 }
    ]
  }
};