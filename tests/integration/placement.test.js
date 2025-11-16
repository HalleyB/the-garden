// placement.test.js - Integration tests for element placement

import { SimulationEngine } from '../../js/simulation/SimulationEngine.js';
import { Plant } from '../../js/elements/plants.js';
import { Environmental } from '../../js/elements/environmental.js';
import { ELEMENT_TYPES } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const placementTests = {
    name: 'Placement Integration Tests',
    tests: [
        {
            name: 'End-to-end plant placement workflow',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(10, 10);

                // Verify tile is empty
                Assert.isFalse(tile.isOccupied(), 'Tile should be empty initially');

                // Place a plant
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.OAK_TREE,
                    10,
                    10,
                    'test_user'
                );

                // Verify placement succeeded
                Assert.isTrue(result.success, 'Placement should succeed');
                Assert.exists(result.element, 'Should return element');

                // Verify tile state
                Assert.isTrue(tile.isOccupied(), 'Tile should be occupied');
                Assert.equals(tile.entity.type.id, 'OAK_TREE', 'Should have correct element type');
                Assert.equals(tile.entity.placedBy, 'test_user', 'Should track who placed it');
                Assert.equals(tile.entity.tile, tile, 'Element should link back to tile');
            }
        },
        {
            name: 'Environmental element immediate effect application',
            fn: () => {
                const engine = new SimulationEngine();
                const centerTile = engine.grid.getTile(15, 15);
                centerTile.moisture = 0;

                // Place rain cloud
                const result = engine.placeElement(
                    Environmental,
                    ELEMENT_TYPES.RAIN_CLOUD,
                    15,
                    15,
                    'test_user'
                );

                Assert.isTrue(result.success, 'Placement should succeed');

                // Verify immediate effect
                Assert.greaterThan(centerTile.moisture, 0, 'Rain should add moisture immediately');

                // Verify adjacent tiles got water
                const adjacent = engine.grid.getTilesInRadius(15, 15, 1);
                const waterCount = adjacent.filter(t => t.moisture > 0).length;
                Assert.greaterThan(waterCount, 1, 'Adjacent tiles should get water');
            }
        },
        {
            name: 'Cannot place on occupied tile',
            fn: () => {
                const engine = new SimulationEngine();

                // Place first element
                const first = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.OAK_TREE,
                    20,
                    20,
                    'user1'
                );

                Assert.isTrue(first.success, 'First placement should succeed');

                // Try to place second element on same tile
                const second = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.WILDFLOWER,
                    20,
                    20,
                    'user2'
                );

                Assert.isFalse(second.success, 'Second placement should fail');
                Assert.exists(second.error, 'Should have error message');

                // Verify original element is still there
                const tile = engine.grid.getTile(20, 20);
                Assert.equals(tile.entity.type.id, 'OAK_TREE', 'Original element should remain');
            }
        },
        {
            name: 'Sunlight requirement validation',
            fn: () => {
                const engine = new SimulationEngine();
                const tile = engine.grid.getTile(25, 25);

                // Set low sunlight
                tile.sunlight = 30;

                // Try to place wildflower (needs 60+ sunlight)
                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.WILDFLOWER,
                    25,
                    25,
                    'test_user'
                );

                Assert.isFalse(result.success, 'Should fail with insufficient sunlight');

                // Increase sunlight
                tile.sunlight = 70;

                // Try again
                const result2 = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.WILDFLOWER,
                    25,
                    25,
                    'test_user'
                );

                Assert.isTrue(result2.success, 'Should succeed with sufficient sunlight');
            }
        },
        {
            name: 'Multiple placements in different locations',
            fn: () => {
                const engine = new SimulationEngine();

                const positions = [
                    [5, 5],
                    [10, 10],
                    [15, 15],
                    [20, 20]
                ];

                for (const [x, y] of positions) {
                    const result = engine.placeElement(
                        Plant,
                        ELEMENT_TYPES.GRASS_PATCH,
                        x,
                        y,
                        'test_user'
                    );

                    Assert.isTrue(result.success, `Placement at (${x}, ${y}) should succeed`);
                }

                const livingEntities = engine.grid.getLivingEntities();
                Assert.equals(livingEntities.length, 4, 'Should have 4 living entities');
            }
        },
        {
            name: 'Placement persists after simulation cycle',
            fn: () => {
                const engine = new SimulationEngine();

                const result = engine.placeElement(
                    Plant,
                    ELEMENT_TYPES.OAK_TREE,
                    30,
                    30,
                    'test_user'
                );

                const elementId = result.element.id;

                // Run a simulation cycle
                engine.runCycle();

                // Verify element still exists
                const tile = engine.grid.getTile(30, 30);
                Assert.isTrue(tile.isOccupied(), 'Tile should still be occupied');
                Assert.equals(tile.entity.id, elementId, 'Should be the same element');
                Assert.isTrue(tile.entity.isAlive, 'Element should still be alive');
            }
        },
        {
            name: 'Compost pile affects nearby growth',
            fn: () => {
                const engine = new SimulationEngine();

                // Place compost
                const compost = engine.placeElement(
                    Environmental,
                    ELEMENT_TYPES.COMPOST_PILE,
                    35,
                    35,
                    'test_user'
                );

                Assert.isTrue(compost.success, 'Compost placement should succeed');

                // Apply compost effects
                engine.grid.applyCompostEffects();

                // Check nearby tiles have growth bonus
                const nearbyTile = engine.grid.getTile(36, 36);
                Assert.equals(nearbyTile.effects.growthBonus, 1.5, 'Nearby tiles should have growth bonus');
            }
        }
    ]
};
