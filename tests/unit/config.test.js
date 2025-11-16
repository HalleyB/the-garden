// config.test.js - Tests for configuration and constants

import { CONFIG, ELEMENT_TYPES, getCurrentSeason, getTimeOfDay, getBaseSunlight } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const configTests = {
    name: 'Configuration Tests',
    tests: [
        {
            name: 'CONFIG object exists and has required properties',
            fn: () => {
                Assert.exists(CONFIG, 'CONFIG should exist');
                Assert.exists(CONFIG.GRID_SIZE, 'CONFIG.GRID_SIZE should exist');
                Assert.exists(CONFIG.TILE_SIZE, 'CONFIG.TILE_SIZE should exist');
                Assert.exists(CONFIG.SIMULATION_INTERVAL, 'CONFIG.SIMULATION_INTERVAL should exist');
            }
        },
        {
            name: 'ELEMENT_TYPES contains all required element types',
            fn: () => {
                Assert.exists(ELEMENT_TYPES.OAK_TREE, 'OAK_TREE should exist');
                Assert.exists(ELEMENT_TYPES.WILDFLOWER, 'WILDFLOWER should exist');
                Assert.exists(ELEMENT_TYPES.GRASS_PATCH, 'GRASS_PATCH should exist');
                Assert.exists(ELEMENT_TYPES.RAIN_CLOUD, 'RAIN_CLOUD should exist');
                Assert.exists(ELEMENT_TYPES.SUNBEAM, 'SUNBEAM should exist');
                Assert.exists(ELEMENT_TYPES.COMPOST_PILE, 'COMPOST_PILE should exist');
                Assert.exists(ELEMENT_TYPES.BOULDER, 'BOULDER should exist');
            }
        },
        {
            name: 'Element types have correct categories',
            fn: () => {
                Assert.equals(ELEMENT_TYPES.OAK_TREE.category, 'plant', 'Oak tree should be a plant');
                Assert.equals(ELEMENT_TYPES.WILDFLOWER.category, 'plant', 'Wildflower should be a plant');
                Assert.equals(ELEMENT_TYPES.RAIN_CLOUD.category, 'environmental', 'Rain cloud should be environmental');
                Assert.equals(ELEMENT_TYPES.BOULDER.category, 'environmental', 'Boulder should be environmental');
            }
        },
        {
            name: 'getCurrentSeason returns valid season',
            fn: () => {
                const season = getCurrentSeason();
                Assert.exists(season, 'Season should exist');
                Assert.exists(season.name, 'Season should have a name');
                Assert.exists(season.growthModifier, 'Season should have growth modifier');
            }
        },
        {
            name: 'getTimeOfDay returns day or night',
            fn: () => {
                const timeOfDay = getTimeOfDay();
                Assert.isTrue(timeOfDay === 'day' || timeOfDay === 'night', 'Time of day should be day or night');
            }
        },
        {
            name: 'getBaseSunlight returns valid value',
            fn: () => {
                const sunlight = getBaseSunlight();
                Assert.greaterThan(sunlight, 0, 'Base sunlight should be positive');
                Assert.lessThan(sunlight, 101, 'Base sunlight should be <= 100');
            }
        },
        {
            name: 'Tile property ranges are valid',
            fn: () => {
                Assert.equals(CONFIG.MOISTURE_MIN, 0, 'Min moisture should be 0');
                Assert.equals(CONFIG.MOISTURE_MAX, 100, 'Max moisture should be 100');
                Assert.equals(CONFIG.SUNLIGHT_MIN, 0, 'Min sunlight should be 0');
                Assert.equals(CONFIG.SUNLIGHT_MAX, 100, 'Max sunlight should be 100');
            }
        }
    ]
};
