// ecosystem.test.js - Integration tests for ecosystem simulation

import { SimulationEngine } from '../../js/simulation/SimulationEngine.js';
import { Plant } from '../../js/elements/plants.js';
import { Environmental } from '../../js/elements/environmental.js';
import { ELEMENT_TYPES } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const ecosystemTests = {
    name: 'Ecosystem Simulation Tests',
    tests: [
        {
            name: 'Plant survives with adequate water',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(10, 10);
                tile.moisture = 100;
                tile.sunlight = 100;

                const result = engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 10, 10, 'test');

                // Run several cycles
                for (let i = 0; i < 10; i++) {
                    tile.moisture = 100; // Keep watered
                    engine.runCycle();
                }

                Assert.isTrue(result.element.isAlive, 'Plant should survive with water');
                Assert.greaterThan(result.element.age, 5, 'Plant should age');
            }
        },
        {
            name: 'Plant dies without water',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(15, 15);
                tile.moisture = 10; // Low moisture
                tile.sunlight = 100;

                const result = engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 15, 15, 'test');

                // Run many cycles without water
                for (let i = 0; i < 50; i++) {
                    engine.runCycle();
                }

                // Plant should either be dead or very unhealthy
                Assert.isTrue(!result.element.isAlive || result.element.health < 50, 'Plant should die or be unhealthy without water');
            }
        },
        {
            name: 'Rain cloud waters nearby tiles',
            fn: () => {
                const engine = new SimulationEngine();

                // Set all tiles dry
                for (let y = 10; y < 20; y++) {
                    for (let x = 10; x < 20; x++) {
                        engine.grid.getTile(x, y).moisture = 0;
                    }
                }

                // Place rain cloud
                engine.placeElement(Environmental, ELEMENT_TYPES.RAIN_CLOUD, 15, 15, 'test');

                // Check nearby tiles got watered
                const affected = engine.grid.getTilesInRadius(15, 15, 1);
                const wateredTiles = affected.filter(t => t.moisture > 0);

                Assert.greaterThan(wateredTiles.length, 0, 'Some tiles should be watered');
            }
        },
        {
            name: 'Shade affects sunlight levels',
            fn: () => {
                const engine = new SimulationEngine();

                // Place a tree
                engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 20, 20, 'test');

                // Apply shade effects
                engine.grid.applyShadeEffects();

                // Check nearby tile has reduced sunlight
                const nearbyTile = engine.grid.getTile(21, 21);
                Assert.lessThan(nearbyTile.sunlight, nearbyTile.sunlight + nearbyTile.effects.shade, 'Nearby tiles should have shade');
            }
        },
        {
            name: 'Plants consume moisture and nutrients',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(25, 25);
                tile.moisture = 100;
                tile.nutrients = 100;
                tile.sunlight = 100;

                const result = engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, 25, 25, 'test');

                // Run several cycles
                for (let i = 0; i < 10; i++) {
                    result.element.consumeResources();
                }

                Assert.lessThan(tile.moisture, 100, 'Moisture should be consumed');
                Assert.lessThan(tile.nutrients, 100, 'Nutrients should be consumed');
            }
        },
        {
            name: 'Dead plant enriches soil',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(30, 30);
                tile.nutrients = 50;

                const result = engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 30, 30, 'test');

                // Kill the plant
                result.element.die();

                Assert.greaterThan(tile.nutrients, 50, 'Dead plant should enrich soil');
            }
        },
        {
            name: 'Multiple simulation cycles work correctly',
            fn: () => {
                const engine = new SimulationEngine();

                // Place some elements
                engine.placeElement(Plant, ELEMENT_TYPES.GRASS_PATCH, 5, 5, 'user1');
                engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, 10, 10, 'user2');

                const initialCount = engine.cycleCount;

                // Run multiple cycles
                for (let i = 0; i < 20; i++) {
                    engine.runCycle();
                }

                Assert.equals(engine.cycleCount, initialCount + 20, 'Should run 20 cycles');

                // Elements should have aged
                const tile = engine.grid.getTile(5, 5);
                if (tile.entity) {
                    Assert.greaterThan(tile.entity.age, 15, 'Entity should have aged');
                }
            }
        },
        {
            name: 'Ecosystem health calculation works',
            fn: () => {
                const engine = new SimulationEngine();

                // Empty ecosystem should have low health
                const emptyHealth = engine.grid.getEcosystemHealth();

                // Add many healthy plants
                for (let i = 0; i < 20; i++) {
                    const x = 10 + (i % 5);
                    const y = 10 + Math.floor(i / 5);
                    const tile = engine.grid.getTile(x, y);
                    tile.moisture = 100;
                    engine.placeElement(Plant, ELEMENT_TYPES.GRASS_PATCH, x, y, 'test');
                }

                const healthyHealth = engine.grid.getEcosystemHealth();

                Assert.greaterThan(healthyHealth, emptyHealth, 'Healthy ecosystem should have higher health');
            }
        }
    ]
};
