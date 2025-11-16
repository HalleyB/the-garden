// persistence.test.js - Integration tests for state persistence

import { SimulationEngine } from '../../js/simulation/SimulationEngine.js';
import { Plant } from '../../js/elements/plants.js';
import { ELEMENT_TYPES, CONFIG } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const persistenceTests = {
    name: 'Persistence Integration Tests',
    tests: [
        {
            name: 'Save and restore garden state',
            fn: () => {
                // Clear localStorage
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                // Create engine and place elements
                const engine1 = new SimulationEngine();
                engine1.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 10, 10, 'user1');
                engine1.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 15, 15, 'user2');
                engine1.cycleCount = 25;

                // Save state
                engine1.saveState();

                // Create new engine and load
                const engine2 = new SimulationEngine();
                const loaded = engine2.loadState();

                Assert.isTrue(loaded, 'Should load state successfully');
                Assert.equals(engine2.cycleCount, 25, 'Cycle count should be restored');

                // Verify elements are restored
                const tile1 = engine2.grid.getTile(10, 10);
                const tile2 = engine2.grid.getTile(15, 15);

                Assert.isTrue(tile1.isOccupied(), 'First tile should be occupied');
                Assert.isTrue(tile2.isOccupied(), 'Second tile should be occupied');
                Assert.equals(tile1.entity.type.id, 'OAK_TREE', 'Oak tree should be restored');
                Assert.equals(tile2.entity.type.id, 'WILDFLOWER', 'Wildflower should be restored');
            }
        },
        {
            name: 'Entity properties persist correctly',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                const engine1 = new SimulationEngine();
                const result = engine1.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 20, 20, 'test_user');

                // Modify entity properties
                result.element.age = 50;
                result.element.health = 85;
                result.element.growthProgress = 200;
                result.element.currentStage = 2;

                engine1.saveState();

                // Load in new engine
                const engine2 = new SimulationEngine();
                engine2.loadState();

                const tile = engine2.grid.getTile(20, 20);
                const entity = tile.entity;

                Assert.equals(entity.age, 50, 'Age should be restored');
                Assert.equals(entity.health, 85, 'Health should be restored');
                Assert.equals(entity.growthProgress, 200, 'Growth progress should be restored');
                Assert.equals(entity.currentStage, 2, 'Growth stage should be restored');
            }
        },
        {
            name: 'Tile properties persist correctly',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                const engine1 = new SimulationEngine();
                const tile = engine1.grid.getTile(25, 25);

                tile.moisture = 75;
                tile.sunlight = 85;
                tile.nutrients = 65;

                engine1.saveState();

                const engine2 = new SimulationEngine();
                engine2.loadState();

                const restoredTile = engine2.grid.getTile(25, 25);

                Assert.equals(restoredTile.moisture, 75, 'Moisture should be restored');
                Assert.equals(restoredTile.sunlight, 85, 'Sunlight should be restored');
                Assert.equals(restoredTile.nutrients, 65, 'Nutrients should be restored');
            }
        },
        {
            name: 'Dead entities persist correctly',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                const engine1 = new SimulationEngine();
                const result = engine1.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 30, 30, 'test');

                // Kill the plant
                result.element.die();

                engine1.saveState();

                const engine2 = new SimulationEngine();
                engine2.loadState();

                const tile = engine2.grid.getTile(30, 30);

                Assert.isTrue(tile.isOccupied(), 'Tile should have entity');
                Assert.isFalse(tile.entity.isAlive, 'Entity should be dead');
            }
        },
        {
            name: 'Multiple entities persist correctly',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                const engine1 = new SimulationEngine();

                // Place multiple elements
                for (let i = 0; i < 10; i++) {
                    engine1.placeElement(Plant, ELEMENT_TYPES.GRASS_PATCH, i, i, `user_${i}`);
                }

                engine1.saveState();

                const engine2 = new SimulationEngine();
                engine2.loadState();

                const livingCount = engine2.grid.getLivingEntities().length;
                Assert.equals(livingCount, 10, 'All 10 entities should be restored');
            }
        },
        {
            name: 'Entity-tile links are restored',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GRID_STATE);

                const engine1 = new SimulationEngine();
                engine1.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 35, 35, 'test');

                engine1.saveState();

                const engine2 = new SimulationEngine();
                engine2.loadState();

                const tile = engine2.grid.getTile(35, 35);
                const entity = tile.entity;

                // Verify bidirectional link
                Assert.equals(entity.tile, tile, 'Entity should link to tile');
                Assert.equals(tile.entity, entity, 'Tile should link to entity');
            }
        }
    ]
};
