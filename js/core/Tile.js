// Tile.js - Represents a single tile in the grid

import { CONFIG, ELEMENT_TYPES } from '../config.js';
import { Plant } from '../elements/plants.js';
import { Environmental } from '../elements/environmental.js';

export class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Tile properties
        this.moisture = CONFIG.INITIAL_MOISTURE;
        this.sunlight = CONFIG.INITIAL_SUNLIGHT;
        this.nutrients = CONFIG.INITIAL_NUTRIENTS;
        this.temperature = 20; // degrees celsius

        // Dual-layer entity system
        // Ground layer: plants, boulders, compost
        this.groundEntity = null;
        // Atmospheric layer: rain clouds, sunbeams
        this.atmosphericEntity = null;

        // Backward compatibility
        this.entity = null; // Will be deprecated

        // Effects from nearby elements
        this.effects = {
            shade: 0,
            nutrientBonus: 0,
            growthBonus: 1.0
        };
    }

    // Check if an element type is atmospheric
    isAtmosphericType(elementType) {
        return elementType.id === 'RAIN_CLOUD' || elementType.id === 'SUNBEAM';
    }

    // Place an entity on this tile
    placeEntity(entity) {
        const isAtmospheric = this.isAtmosphericType(entity.type);

        if (isAtmospheric) {
            if (this.atmosphericEntity) {
                return false; // Atmospheric layer occupied
            }
            this.atmosphericEntity = entity;
        } else {
            if (this.groundEntity) {
                return false; // Ground layer occupied
            }
            this.groundEntity = entity;
        }

        entity.tile = this;

        // Update legacy entity reference (for backward compatibility)
        this.entity = this.groundEntity || this.atmosphericEntity;

        return true;
    }

    // Remove entity from this tile
    removeEntity(entity = null) {
        if (entity) {
            // Remove specific entity
            if (this.groundEntity === entity) {
                this.groundEntity.tile = null;
                this.groundEntity = null;
            }
            if (this.atmosphericEntity === entity) {
                this.atmosphericEntity.tile = null;
                this.atmosphericEntity = null;
            }
        } else {
            // Remove all entities (legacy behavior)
            if (this.groundEntity) {
                this.groundEntity.tile = null;
                this.groundEntity = null;
            }
            if (this.atmosphericEntity) {
                this.atmosphericEntity.tile = null;
                this.atmosphericEntity = null;
            }
        }

        // Update legacy entity reference
        this.entity = this.groundEntity || this.atmosphericEntity;
    }

    // Check if tile is occupied
    isOccupied() {
        return this.groundEntity !== null;
    }

    // Check if atmospheric layer is occupied
    isAtmosphericOccupied() {
        return this.atmosphericEntity !== null;
    }

    // Get all entities on this tile
    getAllEntities() {
        const entities = [];
        if (this.groundEntity) entities.push(this.groundEntity);
        if (this.atmosphericEntity) entities.push(this.atmosphericEntity);
        return entities;
    }

    // Check if placement is valid for a given element type
    canPlace(elementType) {
        const isAtmospheric = this.isAtmosphericType(elementType);

        // Check appropriate layer
        if (isAtmospheric) {
            // Can't place if atmospheric layer occupied (unless replacing dead)
            if (this.atmosphericEntity && this.atmosphericEntity.isAlive) {
                return false;
            }
        } else {
            // Can't place if ground layer occupied (unless replacing dead)
            if (this.groundEntity && this.groundEntity.isAlive) {
                return false;
            }
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
            groundEntity: this.groundEntity ? this.groundEntity.toJSON() : null,
            atmosphericEntity: this.atmosphericEntity ? this.atmosphericEntity.toJSON() : null,
            // Legacy support
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

        // Helper function to restore entity
        const restoreEntity = (entityData) => {
            if (!entityData) return null;

            const elementType = ELEMENT_TYPES[entityData.typeId];
            if (!elementType) return null;

            let entity;

            // Create appropriate entity type
            if (elementType.category === 'plant') {
                entity = new Plant(elementType, entityData.placedBy);
            } else if (elementType.category === 'environmental') {
                entity = new Environmental(elementType, entityData.placedBy);
            }

            if (entity) {
                // Restore entity properties
                entity.id = entityData.id;
                entity.placedAt = entityData.placedAt;
                entity.age = entityData.age;
                entity.isAlive = entityData.isAlive;
                entity.health = entityData.health;
                entity.growthProgress = entityData.growthProgress || 0;
                entity.currentStage = entityData.currentStage || 0;

                // Link entity to tile
                entity.tile = tile;
            }

            return entity;
        };

        // Restore ground entity
        if (data.groundEntity) {
            tile.groundEntity = restoreEntity(data.groundEntity);
        }

        // Restore atmospheric entity
        if (data.atmosphericEntity) {
            tile.atmosphericEntity = restoreEntity(data.atmosphericEntity);
        }

        // Legacy support - restore old single entity format
        if (!tile.groundEntity && !tile.atmosphericEntity && data.entity) {
            const entity = restoreEntity(data.entity);
            if (entity) {
                const isAtmospheric = tile.isAtmosphericType(entity.type);
                if (isAtmospheric) {
                    tile.atmosphericEntity = entity;
                } else {
                    tile.groundEntity = entity;
                }
            }
        }

        // Update legacy entity reference
        tile.entity = tile.groundEntity || tile.atmosphericEntity;

        return tile;
    }

    // Get tile color for rendering (based on moisture and vegetation)
    getColor() {
        // Ground entity takes priority for background color
        if (this.groundEntity && this.groundEntity.isAlive) {
            return this.groundEntity.getColor();
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
