// element.test.js - Tests for Element classes

import { Plant } from '../../js/elements/plants.js';
import { Environmental } from '../../js/elements/environmental.js';
import { ELEMENT_TYPES, CONFIG } from '../../js/config.js';
import { Tile } from '../../js/core/Tile.js';
import { Grid } from '../../js/core/Grid.js';
import { Assert } from '../test-suite.js';

export const elementTests = {
    name: 'Element Tests',
    tests: [
        {
            name: 'Plant initializes with correct properties',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test_user');

                Assert.equals(plant.type, ELEMENT_TYPES.OAK_TREE, 'Type should be OAK_TREE');
                Assert.equals(plant.placedBy, 'test_user', 'PlacedBy should be test_user');
                Assert.isTrue(plant.isAlive, 'Plant should be alive initially');
                Assert.equals(plant.health, 100, 'Health should be 100');
                Assert.equals(plant.age, 0, 'Age should be 0');
            }
        },
        {
            name: 'Plant generates unique ID',
            fn: () => {
                const plant1 = new Plant(ELEMENT_TYPES.OAK_TREE, 'user1');
                const plant2 = new Plant(ELEMENT_TYPES.OAK_TREE, 'user2');

                Assert.exists(plant1.id, 'Plant1 should have an ID');
                Assert.exists(plant2.id, 'Plant2 should have an ID');
                Assert.notEquals(plant1.id, plant2.id, 'IDs should be unique');
            }
        },
        {
            name: 'Plant dies when health reaches 0',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.WILDFLOWER, 'test');
                const tile = new Tile(0, 0);
                tile.placeEntity(plant);

                plant.health = 0;
                plant.checkSurvival();

                Assert.isFalse(plant.isAlive, 'Plant should be dead');
            }
        },
        {
            name: 'Plant dies from lack of water',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                const tile = new Tile(0, 0);
                tile.moisture = 10; // Below minimum
                tile.placeEntity(plant);

                // Simulate wilting cycles
                for (let i = 0; i < CONFIG.WILTING_CYCLES + 5; i++) {
                    plant.checkSurvival();
                }

                Assert.lessThan(plant.health, 100, 'Health should decrease without water');
            }
        },
        {
            name: 'Plant recovers health when conditions improve',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                const tile = new Tile(0, 0);
                tile.moisture = 50;
                tile.sunlight = 70;
                tile.placeEntity(plant);

                plant.health = 80;
                plant.checkSurvival();

                Assert.greaterThan(plant.health, 80, 'Health should recover');
            }
        },
        {
            name: 'Plant grows with sufficient resources',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.WILDFLOWER, 'test');
                const tile = new Tile(0, 0);
                tile.moisture = 70;
                tile.sunlight = 90;
                tile.nutrients = 60;
                tile.placeEntity(plant);

                const initialGrowth = plant.growthProgress;
                plant.grow({ growthModifier: 1.0 });

                Assert.greaterThan(plant.growthProgress, initialGrowth, 'Growth should increase');
            }
        },
        {
            name: 'Plant advances growth stages',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.WILDFLOWER, 'test');
                const tile = new Tile(0, 0);
                tile.moisture = 100;
                tile.sunlight = 100;
                tile.nutrients = 100;
                tile.placeEntity(plant);

                // Simulate many growth cycles
                for (let i = 0; i < 300; i++) {
                    plant.grow({ growthModifier: 1.5 });
                }

                Assert.greaterThan(plant.currentStage, 0, 'Should advance to later growth stages');
            }
        },
        {
            name: 'Plant consumes resources',
            fn: () => {
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                const tile = new Tile(0, 0);
                tile.moisture = 100;
                tile.nutrients = 100;
                tile.placeEntity(plant);

                plant.consumeResources();

                Assert.lessThan(tile.moisture, 100, 'Moisture should be consumed');
                Assert.lessThan(tile.nutrients, 100, 'Nutrients should be consumed');
            }
        },
        {
            name: 'Grass spreads to adjacent tiles',
            fn: () => {
                const grid = new Grid(10);
                const grass = new Plant(ELEMENT_TYPES.GRASS_PATCH, 'test');
                const tile = grid.getTile(5, 5);
                tile.moisture = 100;
                tile.placeEntity(grass);

                // Make adjacent tiles wet
                const adjacent = grid.getAdjacentTiles(5, 5);
                adjacent.forEach(t => t.moisture = 100);

                grass.age = CONFIG.CYCLES_PER_DAY + 1; // Old enough to spread

                // Try spreading many times (it's random)
                let spread = false;
                for (let i = 0; i < 1000 && !spread; i++) {
                    grass.trySpread(grid);
                    spread = grid.getOccupiedTiles().length > 1;
                }

                Assert.isTrue(spread, 'Grass should eventually spread');
            }
        },
        {
            name: 'Environmental element applies rain effect',
            fn: () => {
                const grid = new Grid(10);
                const rain = new Environmental(ELEMENT_TYPES.RAIN_CLOUD, 'test');
                const tile = grid.getTile(5, 5);
                tile.moisture = 0;
                tile.placeEntity(rain);

                rain.applyEffects(grid);

                Assert.greaterThan(tile.moisture, 0, 'Rain should add moisture');
            }
        },
        {
            name: 'Environmental element expires after duration',
            fn: () => {
                const grid = new Grid(10);
                const rain = new Environmental(ELEMENT_TYPES.RAIN_CLOUD, 'test');
                const tile = grid.getTile(5, 5);
                tile.placeEntity(rain);

                rain.age = ELEMENT_TYPES.RAIN_CLOUD.duration + 1;
                rain.update(grid, null);

                Assert.isFalse(rain.isAlive, 'Rain should expire after duration');
            }
        },
        {
            name: 'Permanent environmental elements do not expire',
            fn: () => {
                const grid = new Grid(10);
                const boulder = new Environmental(ELEMENT_TYPES.BOULDER, 'test');
                const tile = grid.getTile(5, 5);
                tile.placeEntity(boulder);

                boulder.age = 1000;
                boulder.update(grid, null);

                Assert.isTrue(boulder.isAlive, 'Boulder should not expire');
            }
        }
    ]
};
