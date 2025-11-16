// grid.test.js - Tests for Grid class

import { Grid } from '../../js/core/Grid.js';
import { Tile } from '../../js/core/Tile.js';
import { Plant } from '../../js/elements/plants.js';
import { ELEMENT_TYPES } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const gridTests = {
    name: 'Grid Tests',
    tests: [
        {
            name: 'Grid initializes with correct size',
            fn: () => {
                const grid = new Grid(10);
                Assert.equals(grid.size, 10, 'Grid size should be 10');
                Assert.equals(grid.tiles.length, 10, 'Grid should have 10 rows');
                Assert.equals(grid.tiles[0].length, 10, 'Grid should have 10 columns');
            }
        },
        {
            name: 'Grid tiles are Tile instances',
            fn: () => {
                const grid = new Grid(5);
                const tile = grid.getTile(0, 0);
                Assert.exists(tile, 'Tile should exist');
                Assert.isTrue(tile instanceof Tile, 'Should be a Tile instance');
            }
        },
        {
            name: 'getTile returns null for out of bounds',
            fn: () => {
                const grid = new Grid(5);
                Assert.isNull(grid.getTile(-1, 0), 'Should return null for negative x');
                Assert.isNull(grid.getTile(0, -1), 'Should return null for negative y');
                Assert.isNull(grid.getTile(5, 0), 'Should return null for x >= size');
                Assert.isNull(grid.getTile(0, 5), 'Should return null for y >= size');
            }
        },
        {
            name: 'getTilesInRadius returns correct tiles',
            fn: () => {
                const grid = new Grid(10);
                const tiles = grid.getTilesInRadius(5, 5, 1);

                // Should return 3x3 grid = 9 tiles
                Assert.equals(tiles.length, 9, 'Should return 9 tiles for radius 1');

                // Check center tile is included
                Assert.isTrue(tiles.some(t => t.x === 5 && t.y === 5), 'Should include center tile');
            }
        },
        {
            name: 'getAdjacentTiles returns 4 neighbors',
            fn: () => {
                const grid = new Grid(10);
                const adjacent = grid.getAdjacentTiles(5, 5);

                Assert.equals(adjacent.length, 4, 'Should return 4 adjacent tiles');

                // Check positions
                const positions = adjacent.map(t => `${t.x},${t.y}`).sort();
                const expected = ['4,5', '5,4', '5,6', '6,5'].sort();
                Assert.arrayEquals(positions, expected, 'Should return correct adjacent positions');
            }
        },
        {
            name: 'getAdjacentTiles handles edges correctly',
            fn: () => {
                const grid = new Grid(10);
                const corner = grid.getAdjacentTiles(0, 0);

                Assert.equals(corner.length, 2, 'Corner should have 2 neighbors');
            }
        },
        {
            name: 'getOccupiedTiles returns tiles with entities',
            fn: () => {
                const grid = new Grid(10);
                const tile = grid.getTile(5, 5);
                const plant = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');

                tile.placeEntity(plant);

                const occupied = grid.getOccupiedTiles();
                Assert.equals(occupied.length, 1, 'Should have 1 occupied tile');
                Assert.equals(occupied[0], tile, 'Should be the correct tile');
            }
        },
        {
            name: 'getLivingEntities returns only alive entities',
            fn: () => {
                const grid = new Grid(10);
                const tile1 = grid.getTile(1, 1);
                const tile2 = grid.getTile(2, 2);

                const plant1 = new Plant(ELEMENT_TYPES.OAK_TREE, 'test');
                const plant2 = new Plant(ELEMENT_TYPES.WILDFLOWER, 'test');

                tile1.placeEntity(plant1);
                tile2.placeEntity(plant2);

                plant2.die();

                const living = grid.getLivingEntities();
                Assert.equals(living.length, 1, 'Should have 1 living entity');
                Assert.equals(living[0], plant1, 'Should be the alive plant');
            }
        },
        {
            name: 'getAverageMoisture calculates correctly',
            fn: () => {
                const grid = new Grid(5);

                // Set all tiles to 50 moisture
                for (let y = 0; y < 5; y++) {
                    for (let x = 0; x < 5; x++) {
                        grid.getTile(x, y).moisture = 50;
                    }
                }

                const avg = grid.getAverageMoisture();
                Assert.equals(avg, 50, 'Average moisture should be 50');
            }
        },
        {
            name: 'Grid serializes and deserializes correctly',
            fn: () => {
                const grid = new Grid(5);
                grid.getTile(2, 2).moisture = 75;

                const json = grid.toJSON();
                Assert.exists(json, 'JSON should exist');
                Assert.equals(json.size, 5, 'JSON should have size');

                const restored = Grid.fromJSON(json);
                Assert.equals(restored.size, 5, 'Restored grid should have correct size');
                Assert.equals(restored.getTile(2, 2).moisture, 75, 'Moisture should be restored');
            }
        }
    ]
};
