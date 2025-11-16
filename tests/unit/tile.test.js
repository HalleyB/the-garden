// tile.test.js - Tests for Tile class

import { Tile } from '../../js/core/Tile.js';
import { Plant } from '../../js/elements/plants.js';
import { Environmental } from '../../js/elements/environmental.js';
import { CONFIG, ELEMENT_TYPES } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const tileTests = {
    name: 'Tile Tests',
    tests: [
        {
            name: 'Tile initializes with correct properties',
            fn: () => {
                const tile = new Tile(5, 10);
                Assert.equals(tile.x, 5, 'X coordinate should be 5');
                Assert.equals(tile.y, 10, 'Y coordinate should be 10');
                Assert.equals(tile.moisture, CONFIG.INITIAL_MOISTURE, 'Should have initial moisture');
                Assert.equals(tile.sunlight, CONFIG.INITIAL_SUNLIGHT, 'Should have initial sunlight');
                Assert.equals(tile.nutrients, CONFIG.INITIAL_NUTRIENTS, 'Should have initial nutrients');
                Assert.isNull(tile.entity, 'Entity should be null initially');
            }
        },
        {
            name: 'placeEntity places and links entity correctly',
            fn: () => {
                const tile = new Tile(0, 0);
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');

                const result = tile.placeEntity(plant);

                Assert.isTrue(result, 'placeEntity should return true');
                Assert.equals(tile.entity, plant, 'Entity should be placed on tile');
                Assert.equals(plant.tile, tile, 'Plant should link back to tile');
            }
        },
        {
            name: 'placeEntity fails if tile is occupied',
            fn: () => {
                const tile = new Tile(0, 0);
                const plant1 = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                const plant2 = new Plant(ELEMENT_TYPES.WILDFLOWER, 'test');

                tile.placeEntity(plant1);
                const result = tile.placeEntity(plant2);

                Assert.isFalse(result, 'Should not place second entity');
                Assert.equals(tile.entity, plant1, 'Original entity should remain');
            }
        },
        {
            name: 'removeEntity clears entity and link',
            fn: () => {
                const tile = new Tile(0, 0);
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');

                tile.placeEntity(plant);
                tile.removeEntity();

                Assert.isNull(tile.entity, 'Entity should be null');
                Assert.isNull(plant.tile, 'Plant tile reference should be null');
            }
        },
        {
            name: 'isOccupied returns correct value',
            fn: () => {
                const tile = new Tile(0, 0);
                Assert.isFalse(tile.isOccupied(), 'Should not be occupied initially');

                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                tile.placeEntity(plant);

                Assert.isTrue(tile.isOccupied(), 'Should be occupied after placing entity');
            }
        },
        {
            name: 'canPlace checks sunlight requirements',
            fn: () => {
                const tile = new Tile(0, 0);
                tile.sunlight = 30;

                // Wildflower needs 60+ sunlight
                Assert.isFalse(tile.canPlace(ELEMENT_TYPES.WILDFLOWER), 'Should not place wildflower with low sunlight');

                tile.sunlight = 70;
                Assert.isTrue(tile.canPlace(ELEMENT_TYPES.WILDFLOWER), 'Should place wildflower with sufficient sunlight');
            }
        },
        {
            name: 'canPlace prevents placing on occupied tiles',
            fn: () => {
                const tile = new Tile(0, 0);
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                tile.placeEntity(plant);

                Assert.isFalse(tile.canPlace(ELEMENT_TYPES.WILDFLOWER), 'Should not place on occupied tile');
            }
        },
        {
            name: 'addMoisture increases moisture within limits',
            fn: () => {
                const tile = new Tile(0, 0);
                tile.moisture = 50;

                tile.addMoisture(30);
                Assert.equals(tile.moisture, 80, 'Moisture should increase to 80');

                tile.addMoisture(50);
                Assert.equals(tile.moisture, 100, 'Moisture should cap at 100');
            }
        },
        {
            name: 'consumeMoisture decreases moisture within limits',
            fn: () => {
                const tile = new Tile(0, 0);
                tile.moisture = 50;

                tile.consumeMoisture(20);
                Assert.equals(tile.moisture, 30, 'Moisture should decrease to 30');

                tile.consumeMoisture(50);
                Assert.equals(tile.moisture, 0, 'Moisture should floor at 0');
            }
        },
        {
            name: 'Tile serializes to JSON correctly',
            fn: () => {
                const tile = new Tile(5, 7);
                tile.moisture = 60;
                tile.sunlight = 80;

                const json = tile.toJSON();

                Assert.equals(json.x, 5, 'JSON should have x coordinate');
                Assert.equals(json.y, 7, 'JSON should have y coordinate');
                Assert.equals(json.moisture, 60, 'JSON should have moisture');
                Assert.equals(json.sunlight, 80, 'JSON should have sunlight');
            }
        },
        {
            name: 'Tile deserializes from JSON correctly',
            fn: () => {
                const data = {
                    x: 3,
                    y: 4,
                    moisture: 70,
                    sunlight: 90,
                    nutrients: 60,
                    temperature: 25,
                    entity: null
                };

                const tile = Tile.fromJSON(data);

                Assert.equals(tile.x, 3, 'X should be restored');
                Assert.equals(tile.y, 4, 'Y should be restored');
                Assert.equals(tile.moisture, 70, 'Moisture should be restored');
                Assert.equals(tile.sunlight, 90, 'Sunlight should be restored');
            }
        },
        {
            name: 'Tile deserializes with entity correctly',
            fn: () => {
                const data = {
                    x: 2,
                    y: 3,
                    moisture: 50,
                    sunlight: 70,
                    nutrients: 50,
                    temperature: 20,
                    entity: {
                        typeId: 'OAK_TREE',
                        id: 'test_123',
                        placedBy: 'test_user',
                        placedAt: Date.now(),
                        age: 10,
                        isAlive: true,
                        health: 95,
                        growthProgress: 5,
                        currentStage: 1
                    }
                };

                const tile = Tile.fromJSON(data);

                Assert.exists(tile.entity, 'Entity should be restored');
                Assert.equals(tile.entity.type.id, 'OAK_TREE', 'Entity type should be OAK_TREE');
                Assert.equals(tile.entity.age, 10, 'Entity age should be restored');
                Assert.equals(tile.entity.health, 95, 'Entity health should be restored');
                Assert.equals(tile.entity.tile, tile, 'Entity should link back to tile');
            }
        }
    ]
};
