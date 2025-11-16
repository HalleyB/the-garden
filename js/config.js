// Configuration Constants for The Garden

export const CONFIG = {
    // Grid Configuration
    GRID_SIZE: 50, // Start with 50x50 for MVP
    TILE_SIZE: 32, // pixels per tile when at 1.0 zoom

    // Simulation Configuration
    SIMULATION_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
    CYCLES_PER_DAY: 288, // 24 hours / 5 minutes

    // Tile Property Ranges
    MOISTURE_MIN: 0,
    MOISTURE_MAX: 100,
    SUNLIGHT_MIN: 0,
    SUNLIGHT_MAX: 100,
    NUTRIENTS_MIN: 0,
    NUTRIENTS_MAX: 100,

    // Initial Tile Values
    INITIAL_MOISTURE: 30,
    INITIAL_SUNLIGHT: 70,
    INITIAL_NUTRIENTS: 50,

    // Survival Thresholds
    MIN_MOISTURE_TO_SURVIVE: 20,
    STARVATION_CYCLES: 12,
    WILTING_CYCLES: 3,

    // Seasons Configuration (weekly rotation)
    SEASON_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    SEASONS: {
        SPRING: {
            name: 'Spring',
            growthModifier: 1.5,
            moistureRetention: 1.0,
            color: '#7CB342'
        },
        SUMMER: {
            name: 'Summer',
            growthModifier: 1.0,
            moistureRetention: 0.8,
            color: '#FFA726'
        },
        AUTUMN: {
            name: 'Autumn',
            growthModifier: 0.7,
            moistureRetention: 1.0,
            decayModifier: 1.3,
            color: '#FF7043'
        },
        WINTER: {
            name: 'Winter',
            growthModifier: 0.3,
            moistureRetention: 1.2,
            color: '#90CAF9'
        }
    },

    // Placement Restrictions
    PLACEMENT_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

    // Rendering Configuration
    MIN_ZOOM: 0.25,
    MAX_ZOOM: 2.0,
    ZOOM_SPEED: 0.1,

    // Colors
    COLORS: {
        SOIL: '#8B7355',
        GRASS: '#7CB342',
        WATER: '#42A5F5',
        SKY_DAY: '#E3F2FD',
        SKY_NIGHT: '#1A237E',
        TREE: '#558B2F',
        FLOWER_PINK: '#EC407A',
        FLOWER_ORANGE: '#FFA726',
        FLOWER_PURPLE: '#AB47BC',
        DEAD: '#795548'
    },

    // Animation Configuration
    ANIMATION_DURATION: 2000, // milliseconds for growth transitions

    // Storage Keys
    STORAGE_KEYS: {
        GRID_STATE: 'garden_grid_state',
        USER_CONTRIBUTIONS: 'garden_user_contributions',
        LAST_PLACEMENT: 'garden_last_placement',
        SIMULATION_LAST_RUN: 'garden_simulation_last_run',
        START_TIME: 'garden_start_time'
    }
};

// Element Type Definitions
export const ELEMENT_TYPES = {
    // Plants
    OAK_TREE: {
        id: 'OAK_TREE',
        name: 'Oak Tree',
        icon: '🌳',
        category: 'plant',
        description: 'Slow growth (7 days to mature), lives 60+ days, provides shade, attracts birds',
        growthTime: 7 * CONFIG.CYCLES_PER_DAY, // 7 days in cycles
        maxAge: 60 * CONFIG.CYCLES_PER_DAY,
        needsSunlight: true,
        minSunlight: 50,
        providesShade: true,
        shadeRadius: 2,
        growthStages: 3,
        color: '#558B2F'
    },

    WILDFLOWER: {
        id: 'WILDFLOWER',
        name: 'Wildflower',
        icon: '🌸',
        category: 'plant',
        description: 'Fast bloom (2 days), lives 10-15 days, requires sunlight, attracts pollinators',
        growthTime: 2 * CONFIG.CYCLES_PER_DAY,
        maxAge: 15 * CONFIG.CYCLES_PER_DAY,
        needsSunlight: true,
        minSunlight: 60,
        attractsPollinators: true,
        growthStages: 2,
        color: '#EC407A'
    },

    GRASS_PATCH: {
        id: 'GRASS_PATCH',
        name: 'Grass Patch',
        icon: '🌿',
        category: 'plant',
        description: 'Spreads to adjacent tiles (1 per day), lives indefinitely with water',
        growthTime: 1 * CONFIG.CYCLES_PER_DAY,
        maxAge: Infinity,
        needsSunlight: true,
        minSunlight: 40,
        spreads: true,
        spreadRate: 1, // tiles per day
        growthStages: 1,
        color: '#7CB342'
    },

    // Environmental Elements
    RAIN_CLOUD: {
        id: 'RAIN_CLOUD',
        name: 'Rain Cloud',
        icon: '🌧️',
        category: 'environmental',
        description: 'Waters 3x3 tile area, lasts 1 cycle, critical for survival',
        duration: 1, // cycles
        effectRadius: 1, // creates 3x3 area
        moistureBoost: 80,
        color: '#42A5F5'
    },

    SUNBEAM: {
        id: 'SUNBEAM',
        name: 'Sunbeam',
        icon: '☀️',
        category: 'environmental',
        description: 'Boosts growth in 2x2 area for 2 cycles, needed for flowers',
        duration: 2,
        effectRadius: 1,
        sunlightBoost: 90,
        color: '#FDD835'
    },

    COMPOST_PILE: {
        id: 'COMPOST_PILE',
        name: 'Compost',
        icon: '🍂',
        category: 'environmental',
        description: 'Enriches soil in 2x2 area permanently (+50% growth speed)',
        permanent: true,
        effectRadius: 1,
        nutrientBoost: 50,
        growthBoost: 1.5,
        color: '#795548'
    },

    BOULDER: {
        id: 'BOULDER',
        name: 'Boulder',
        icon: '🪨',
        category: 'environmental',
        description: 'Permanent decoration, creates shade, blocks spread',
        permanent: true,
        providesShade: true,
        shadeRadius: 1,
        blocksPlacement: true,
        color: '#78909C'
    }
};

// Get current season based on start time
export function getCurrentSeason() {
    const startTime = localStorage.getItem(CONFIG.STORAGE_KEYS.START_TIME);
    if (!startTime) return CONFIG.SEASONS.SPRING;

    const elapsed = Date.now() - parseInt(startTime);
    const weeksPassed = Math.floor(elapsed / CONFIG.SEASON_DURATION);
    const seasonIndex = weeksPassed % 4;

    const seasons = [
        CONFIG.SEASONS.SPRING,
        CONFIG.SEASONS.SUMMER,
        CONFIG.SEASONS.AUTUMN,
        CONFIG.SEASONS.WINTER
    ];

    return seasons[seasonIndex];
}

// Get time of day (for day/night cycle)
export function getTimeOfDay() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 20) {
        return 'day';
    } else {
        return 'night';
    }
}

// Calculate sunlight based on time of day
export function getBaseSunlight() {
    const timeOfDay = getTimeOfDay();
    return timeOfDay === 'day' ? CONFIG.SUNLIGHT_MAX : CONFIG.SUNLIGHT_MAX * 0.3;
}
