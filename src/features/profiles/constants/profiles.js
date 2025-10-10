export const Profiles = {
  RETIREE: {
    name: 'Profile 1',
    description: 'Retiree-friendly location',
    freeTerm: -0.5, 
    districtFeatures: [
      { name: "Average age", weight: 9 },  // Prefer areas with older population
      { name: "Households with 2 people", weight: 8 },  // Couple household
      { name: "Pensions", weight: 6 }, // Higher pension amounts
      { name: "Population density", weight: -8 },  // Lower density for outskirts
      { name: "Housing", weight: -1 }  // less amount of housholds
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
    freeTerm: -0.4, 
    districtFeatures: [
      { name: "Average age", weight: -3 },  // Prefer areas with younger population
      { name: "Households with 4 people", weight: 8 },  // Typical family size
      { name: "Employed income", weight: 7 }, //double income
      { name: "Population density", weight: -8 },  // Lower density for outskirts
      { name: "Housing", weight: -1 }  // less amount of housholds
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
      { name: "station_wheelchair", distance: 201, weight: 6 } //for strollers
    ]
  },
  STUDENT: {
    name: 'Profile 3',
    description: 'Young student friendly location',
    freeTerm: -0.1,
    districtFeatures: [
      { name: "Average age", weight: -8 },  //young people
      { name: "Households with 2 people", weight: 6 },  // Couple household
      { name: "Employed income", weight: -6 },  //lower income
      { name: "Population density", weight: -8 },  // Lower density for outskirts
      { name: "Housing", weight: -1 }  // less amount of housholds
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
  }
}; 