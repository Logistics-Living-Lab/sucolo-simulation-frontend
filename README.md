# Location Finder App Frontend

This research prototype is part of the SuCoLo project / Logistics Living Lab of Leipzig University.

This project was generated using Vue.js 3 and Vite.

## About

**Project SuCoLo** (Fostering sustainable consumer behaviour with inclusive bicycle logistics infrastructure in urban outskirts) https://sucolo.eu/ 

An intelligent web application for finding optimal locations for community facilities and services using advanced geospatial analysis and machine learning. Features interactive mapping with hexagon-based analysis, demographic data evaluation, and accessibility features.

## Development server
Install dependencies:

```bash
npm install
```

To start a local development server, run:

```bash
npm run dev
```

Once the server is running, open your browser and navigate to `http://localhost:8080/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Preview production build

To preview the production build, run:

```bash
npm run preview
```

The application will be available at `http://localhost:8080`

## Configuration

### Prerequisites
- **Node.js**: Version 18 or higher (20+ recommended)
- **Backend Service**: Backend API running on `VITE_API_URL`

### Environment Variables
Create a `.env` file in the root directory for environment-specific configurations:

```env
VITE_BACKEND_URL='VITE_API_URL'
```

## Key Technologies

- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Vite**: Fast build tool and dev server
- **Leaflet.js**: Interactive maps and geospatial visualization
- **H3.js**: Hexagon grid system for spatial analysis
- **Axios**: HTTP client for API communication

## Project Structure

```
public/config.js              # Backend connection
src/
├── layouts/                  # Application layout components
├── features/                 # Feature-based modules
│   ├── map/                  # Map functionality
│   ├── feature-selector/     # Feature selection functionality
│   ├── city-selector/        # City and resolution selection
│   └── profiles/             # Predefined user profiles
├── shared/                   # Shared components and utilities
├── assets/                   # Static assets
├── utils/                    # Utility functions
└── main.js                   # Application entry point
```


## Usage Guide

### Basic Workflow

1. **Select City**: Choose from Leipzig or Meran
2. **Set Resolution**: Choose hexagon size (City Overview, Neighborhood, or Precise Planning)
3. **Add Features**: Select and configure analysis features
4. **Adjust Weights**: Set importance levels for each feature
5. **Build Model**: Generate location scores and visualize results
6. **Analyze Results**: Explore the color-coded map for optimal locations

### Feature Types

#### Nearest Amenity
- **Purpose**: Find areas closest to specific amenities
- **Configuration**: Select amenity type, distance, and penalty
- **Use Case**: Healthcare facilities, public transport, schools, ...

#### Amenity Count
- **Purpose**: Count amenities within a specified radius
- **Configuration**: Select amenity type and distance
- **Use Case**: Business districts, entertainment areas, ...

#### Amenity Present
- **Purpose**: Check if specific amenities exist in areas
- **Configuration**: Select amenity type and distance
- **Use Case**: Essential services, accessibility features

#### District Features
- **Purpose**: Analyze demographic and socioeconomic data
- **Configuration**: Select from available district metrics
- **Use Case**: Population analysis, income distribution, ...

### Predefined User Profiles
- Profile 1, 2 and 3