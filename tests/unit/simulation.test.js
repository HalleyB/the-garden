// simulation.test.js - Tests for SimulationEngine

import { SimulationEngine } from '../../js/simulation/SimulationEngine.js';
import { Plant } from '../../js/elements/plants.js';
import { Environmental } from '../../js/elements/environmental.js';
import { ELEMENT_TYPES, CONFIG } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const simulationTests = {
    name: 'Simulation Engine Tests',
    tests: [
        {
            name: 'SimulationEngine initializes correctly',
            fn: () => {
                const engine = new SimulationEngine();

                Assert.exists(engine.grid, 'Grid should exist');
                Assert.equals(engine.cycleCount, 0, 'Cycle count should be 0');
                Assert.isFalse(engine.isRunning, 'Should not be running initially');
            }
        },
        {
            name: 'placeElement places plant successfully',
            fn: () => {
                const engine = new SimulationEngine();
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.OAK_TREE,
                    5,
                    5,
                    'test_user'
                );

                Assert.isTrue(result.success, 'Placement should succeed');
                Assert.exists(result.element, 'Element should be returned');

                const tile = engine.grid.getTile(5, 5);
                Assert.isTrue(tile.isOccupied(), 'Tile should be occupied');
                Assert.equals(tile.entity.type.id, 'OAK_TREE', 'Should place oak tree');
            }
        },
        {
            name: 'placeElement fails on occupied tile',
            fn: () => {
                const engine = new SimulationEngine();

                // Place first element
                engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 5, 5, 'user1');

                // Try to place second element
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.WILDFLOWER,
                    5,
                    5,
                    'user2'
                );

                Assert.isFalse(result.success, 'Second placement should fail');
                Assert.exists(result.error, 'Should have error message');
            }
        },
        {
            name: 'placeElement fails on invalid position',
            fn: () => {
                const engine = new SimulationEngine();
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.OAK_TREE,
                    -1,
                    -1,
                    'test_user'
                );

                Assert.isFalse(result.success, 'Placement should fail');
                Assert.exists(result.error, 'Should have error message');
            }
        },
        {
            name: 'runCycle increments cycle count',
            fn: () => {
                const engine = new SimulationEngine();
                const initialCount = engine.cycleCount;

                engine.runCycle();

                Assert.equals(engine.cycleCount, initialCount + 1, 'Cycle count should increment');
            }
        },
        {
            name: 'runCycle updates all entities',
            fn: () => {
                const engine = new SimulationEngine();

                // Place a plant
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.WILDFLOWER,
                    5,
                    5,
                    'test'
                );

                const plant = result.element;
                const initialAge = plant.age;

                engine.runCycle();

                Assert.equals(plant.age, initialAge + 1, 'Plant age should increment');
            }
        },
        {
            name: 'getStats returns correct statistics',
            fn: () => {
                const engine = new SimulationEngine();

                // Place some elements
                engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 1, 1, 'user1');
                engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 2, 2, 'user2');

                const stats = engine.getStats();

                Assert.equals(stats.totalElements, 2, 'Should have 2 total elements');
                Assert.equals(stats.livingPlants, 2, 'Should have 2 living plants');
                Assert.exists(stats.avgMoisture, 'Should have average moisture');
                Assert.exists(stats.ecosystemHealth, 'Should have ecosystem health');
            }
        },
        {
            name: 'getLeaderboard returns oldest elements',
            fn: () => {
                const engine = new SimulationEngine();

                // Place elements with different ages
                const result1 = engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 1, 1, 'user1');
                const result2 = engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 2, 2, 'user2');

                result1.element.age = 100;
                result2.element.age = 50;

                const leaderboard = engine.getLeaderboard(10);

                Assert.equals(leaderboard.length, 2, 'Should have 2 entries');
                Assert.greaterThan(leaderboard[0].age, leaderboard[1].age, 'Should be sorted by age descending');
            }
        },
        {
            name: 'getUserContributions returns user elements',
            fn: () => {
                const engine = new SimulationEngine();

                engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 1, 1, 'user1');
                engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 2, 2, 'user1');
                engine.placeElement(Plant, ELEMENT_TYPES.GRASS_PATCH, 3, 3, 'user2');

                const contributions = engine.getUserContributions('user1');

                Assert.equals(contributions.length, 2, 'User1 should have 2 contributions');
            }
        },
        {
            name: 'Simulation state saves to localStorage',
            fn: () => {
                const engine = new SimulationEngine();

                engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 5, 5, 'test');
                engine.saveState();

                const savedState = localStorage.getItem(CONFIG.STORAGE_KEYS.GRID_STATE);
                Assert.exists(savedState, 'State should be saved to localStorage');

                const state = JSON.parse(savedState);
                Assert.exists(state.grid, 'Saved state should have grid');
                Assert.exists(state.cycleCount, 'Saved state should have cycle count');
            }
        },
        {
            name: 'Simulation state loads from localStorage',
            fn: () => {
                // Save a state first
                const engine1 = new SimulationEngine();
                engine1.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 5, 5, 'test');
                engine1.cycleCount = 42;
                engine1.saveState();

                // Create new engine and load
                const engine2 = new SimulationEngine();
                const loaded = engine2.loadState();

                Assert.isTrue(loaded, 'Should successfully load state');
                Assert.equals(engine2.cycleCount, 42, 'Cycle count should be restored');

                const tile = engine2.grid.getTile(5, 5);
                Assert.isTrue(tile.isOccupied(), 'Tile should be occupied');
                Assert.equals(tile.entity.type.id, 'OAK_TREE', 'Entity should be restored');
            }
        }
    ]
};
