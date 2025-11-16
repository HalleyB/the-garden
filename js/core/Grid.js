// Grid.js - Manages the grid of tiles

import { CONFIG } from '../config.js';
import { Tile } from './Tile.js';

export class Grid {
    constructor(size = CONFIG.GRID_SIZE) {
        this.size = size;
        this.tiles = [];

        // Initialize grid
        for (let y = 0; y < size; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < size; x++) {
                this.tiles[y][x] = new Tile(x, y);
            }
        }
    }

    // Get tile at coordinates
    getTile(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return null;
        }
        return this.tiles[y][x];
    }

    // Get all tiles in a radius around a point
    getTilesInRadius(centerX, centerY, radius) {
        const tiles = [];

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const tile = this.getTile(centerX + dx, centerY + dy);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }

        return tiles;
    }

    // Get adjacent tiles (4-directional)
    getAdjacentTiles(x, y) {
        const adjacent = [];
        const directions = [
            [0, -1],  // North
            [1, 0],   // East
            [0, 1],   // South
            [-1, 0]   // West
        ];

        for (const [dx, dy] of directions) {
            const tile = this.getTile(x + dx, y + dy);
            if (tile) {
                adjacent.push(tile);
            }
        }

        return adjacent;
    }

    // Get all tiles with entities
    getOccupiedTiles() {
        const occupied = [];

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];
                if (tile.isOccupied()) {
                    occupied.push(tile);
                }
            }
        }

        return occupied;
    }

    // Get all living entities
    getLivingEntities() {
        const entities = [];

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];

                // Check ground entity
                if (tile.groundEntity && tile.groundEntity.isAlive) {
                    entities.push(tile.groundEntity);
                }

                // Check atmospheric entity
                if (tile.atmosphericEntity && tile.atmosphericEntity.isAlive) {
                    entities.push(tile.atmosphericEntity);
                }
            }
        }

        return entities;
    }

    // Get all dead entities
    getDeadEntities() {
        const entities = [];

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];

                // Check ground entity
                if (tile.groundEntity && !tile.groundEntity.isAlive) {
                    entities.push(tile.groundEntity);
                }

                // Check atmospheric entity
                if (tile.atmosphericEntity && !tile.atmosphericEntity.isAlive) {
                    entities.push(tile.atmosphericEntity);
                }
            }
        }

        return entities;
    }

    // Calculate average moisture across all tiles
    getAverageMoisture() {
        let total = 0;
        let count = 0;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                total += this.tiles[y][x].moisture;
                count++;
            }
        }

        return count > 0 ? Math.round(total / count) : 0;
    }

    // Calculate ecosystem health (0-100)
    getEcosystemHealth() {
        const livingEntities = this.getLivingEntities().length;
        const avgMoisture = this.getAverageMoisture();
        const totalTiles = this.size * this.size;
        const occupancyRate = livingEntities / totalTiles;

        // Health is a combination of:
        // - Living entities (40%)
        // - Average moisture (30%)
        // - Occupancy rate (30%)

        const entityScore = Math.min(100, (livingEntities / 50) * 100) * 0.4;
        const moistureScore = avgMoisture * 0.3;
        const occupancyScore = Math.min(100, occupancyRate * 1000) * 0.3;

        return Math.round(entityScore + moistureScore + occupancyScore);
    }

    // Update all tiles for one simulation cycle
    updateCycle() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.tiles[y][x].updateCycle();
            }
        }
    }

    // Apply shade effects from trees and boulders
    applyShadeEffects() {
        // First, reset all shade effects
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.tiles[y][x].effects.shade = 0;
            }
        }

        // Apply shade from entities that provide it
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];
                if (tile.entity && tile.entity.type.providesShade && tile.entity.isAlive) {
                    const radius = tile.entity.type.shadeRadius || 1;
                    const affectedTiles = this.getTilesInRadius(x, y, radius);

                    for (const affectedTile of affectedTiles) {
                        if (affectedTile !== tile) {
                            affectedTile.applyShade(30); // Reduce sunlight by 30
                            affectedTile.effects.shade = 30;
                        }
                    }
                }
            }
        }
    }

    // Apply compost effects
    applyCompostEffects() {
        // Reset growth bonuses
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.tiles[y][x].effects.growthBonus = 1.0;
                this.tiles[y][x].effects.nutrientBonus = 0;
            }
        }

        // Apply compost bonuses
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];
                if (tile.entity && tile.entity.type.id === 'COMPOST_PILE') {
                    const radius = tile.entity.type.effectRadius || 1;
                    const affectedTiles = this.getTilesInRadius(x, y, radius);

                    for (const affectedTile of affectedTiles) {
                        affectedTile.effects.growthBonus = 1.5;
                        affectedTile.effects.nutrientBonus = tile.entity.type.nutrientBoost;
                        affectedTile.addNutrients(tile.entity.type.nutrientBoost);
                    }
                }
            }
        }
    }

    // Serialize grid to JSON
    toJSON() {
        const tilesData = [];

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.tiles[y][x];
                if (tile.isOccupied() || tile.moisture !== CONFIG.INITIAL_MOISTURE) {
                    tilesData.push(tile.toJSON());
                }
            }
        }

        return {
            size: this.size,
            tiles: tilesData
        };
    }

    // Deserialize grid from JSON
    static fromJSON(data) {
        const grid = new Grid(data.size);

        if (data.tiles) {
            for (const tileData of data.tiles) {
                const tile = Tile.fromJSON(tileData);
                grid.tiles[tile.y][tile.x] = tile;
            }
        }

        return grid;
    }
}
