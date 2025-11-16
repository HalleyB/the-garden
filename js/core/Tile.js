// Tile.js - Represents a single tile in the grid

import { CONFIG } from '../config.js';

export class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tile properties
        this.moisture = CONFIG.INITIAL_MOISTURE;
        this.sunlight = CONFIG.INITIAL_SUNLIGHT;
        this.nutrients = CONFIG.INITIAL_NUTRIENTS;
        this.temperature = 20; // degrees celsius

        // Entity on this tile (plant, animal, environmental element)
        this.entity = null;

        // Effects from nearby elements
        this.effects = {
            shade: 0,
            nutrientBonus: 0,
            growthBonus: 1.0
        };
    }

    // Place an entity on this tile
    placeEntity(entity) {
        if (this.entity) {
            return false; // Tile occupied
        }
        this.entity = entity;
        entity.tile = this;
        return true;
    }

    // Remove entity from this tile
    removeEntity() {
        if (this.entity) {
            this.entity.tile = null;
            this.entity = null;
        }
    }

    // Check if tile is occupied
    isOccupied() {
        return this.entity !== null;
    }

    // Check if placement is valid for a given element type
    canPlace(elementType) {
        // Can't place if occupied (unless replacing dead)
        if (this.entity && this.entity.isAlive) {
            return false;
        }

        // Check sunlight requirements
        if (elementType.needsSunlight && this.sunlight < elementType.minSunlight) {
            return false;
        }

        // Mushrooms need shade (future implementation)
        // if (elementType.needsShade && this.sunlight > elementType.maxSunlight) {
        //     return false;
        // }

        return true;
    }

    // Update tile properties for this cycle
    updateCycle() {
        // Moisture evaporation
        this.moisture = Math.max(0, this.moisture - 5);

        // Sunlight resets to base level each cycle
        // (will be modified by day/night and shade)

        // Nutrients slowly regenerate
        if (this.nutrients < CONFIG.NUTRIENTS_MAX) {
            this.nutrients = Math.min(CONFIG.NUTRIENTS_MAX, this.nutrients + 1);
        }

        // Clamp values
        this.moisture = Math.max(CONFIG.MOISTURE_MIN, Math.min(CONFIG.MOISTURE_MAX, this.moisture));
        this.sunlight = Math.max(CONFIG.SUNLIGHT_MIN, Math.min(CONFIG.SUNLIGHT_MAX, this.sunlight));
        this.nutrients = Math.max(CONFIG.NUTRIENTS_MIN, Math.min(CONFIG.NUTRIENTS_MAX, this.nutrients));
    }

    // Apply moisture (from rain)
    addMoisture(amount) {
        this.moisture = Math.min(CONFIG.MOISTURE_MAX, this.moisture + amount);
    }

    // Apply sunlight boost
    addSunlight(amount) {
        this.sunlight = Math.min(CONFIG.SUNLIGHT_MAX, this.sunlight + amount);
    }

    // Apply nutrient boost
    addNutrients(amount) {
        this.nutrients = Math.min(CONFIG.NUTRIENTS_MAX, this.nutrients + amount);
    }

    // Reduce moisture (consumed by plants)
    consumeMoisture(amount) {
        this.moisture = Math.max(0, this.moisture - amount);
    }

    // Reduce nutrients (consumed by plants)
    consumeNutrients(amount) {
        this.nutrients = Math.max(0, this.nutrients - amount);
    }

    // Apply shade effect
    applyShade(amount) {
        this.sunlight = Math.max(0, this.sunlight - amount);
    }

    // Serialize tile to JSON
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            moisture: this.moisture,
            sunlight: this.sunlight,
            nutrients: this.nutrients,
            temperature: this.temperature,
            entity: this.entity ? this.entity.toJSON() : null
        };
    }

    // Deserialize tile from JSON
    static fromJSON(data) {
        const tile = new Tile(data.x, data.y);
        tile.moisture = data.moisture;
        tile.sunlight = data.sunlight;
        tile.nutrients = data.nutrients;
        tile.temperature = data.temperature;
        return tile;
    }

    // Get tile color for rendering (based on moisture and vegetation)
    getColor() {
        if (this.entity && this.entity.isAlive) {
            return this.entity.getColor();
        }

        // Base soil color, tinted by moisture
        const moistureRatio = this.moisture / CONFIG.MOISTURE_MAX;

        if (moistureRatio > 0.7) {
            return CONFIG.COLORS.WATER; // Very wet
        } else if (moistureRatio > 0.4) {
            return CONFIG.COLORS.GRASS; // Moist, grassy
        } else if (moistureRatio > 0.2) {
            return CONFIG.COLORS.SOIL; // Dry soil
        } else {
            return '#D7CCC8'; // Very dry, sandy
        }
    }
}
