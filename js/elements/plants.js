// plants.js - Plant element implementations

import { CONFIG } from '../config.js';
import { Element } from './Element.js';

export class Plant extends Element {
    constructor(type, placedBy) {
        super(type, placedBy);
        this.cyclesWithoutWater = 0;
        this.hasFlowered = false;
    }

    update(grid, season) {
        if (!this.isAlive || !this.tile) return;

        this.age++;

        // Check maximum age
        if (this.type.maxAge && this.age >= this.type.maxAge) {
            this.die();
            return;
        }

        // Check survival conditions
        this.checkSurvival();

        if (!this.isAlive) return;

        // Growth
        this.grow(season);

        // Consume resources
        this.consumeResources();

        // Special behaviors
        if (this.type.spreads && this.isAlive) {
            this.trySpread(grid);
        }
    }

    checkSurvival() {
        // Die if health depleted (check first before any recovery)
        if (this.health <= 0) {
            this.die();
            return;
        }

        // Check moisture
        if (this.tile.moisture < CONFIG.MIN_MOISTURE_TO_SURVIVE) {
            this.cyclesWithoutWater++;

            if (this.cyclesWithoutWater >= CONFIG.WILTING_CYCLES) {
                this.health -= 10;
            }
        } else {
            this.cyclesWithoutWater = 0;
            // Slowly recover health
            if (this.health < 100) {
                this.health = Math.min(100, this.health + 2);
            }
        }

        // Check sunlight requirements
        if (this.type.needsSunlight && this.tile.sunlight < this.type.minSunlight) {
            this.health -= 5;
        }

        // Check again after applying damage
        if (this.health <= 0) {
            this.die();
        }
    }

    grow(season) {
        if (!this.tile) return;

        // Calculate growth rate
        let growthRate = 1.0;

        // Moisture modifier
        const moistureModifier = this.tile.moisture / CONFIG.MOISTURE_MAX;
        growthRate *= moistureModifier;

        // Sunlight modifier
        if (this.type.needsSunlight) {
            const sunlightModifier = this.tile.sunlight / CONFIG.SUNLIGHT_MAX;
            growthRate *= sunlightModifier;
        }

        // Season modifier
        if (season && season.growthModifier) {
            growthRate *= season.growthModifier;
        }

        // Tile effects (compost)
        if (this.tile.effects.growthBonus) {
            growthRate *= this.tile.effects.growthBonus;
        }

        // Increase growth progress
        this.growthProgress += growthRate;

        // Check if we've reached next growth stage
        if (this.type.growthStages && this.type.growthTime) {
            const cyclesPerStage = this.type.growthTime / this.type.growthStages;
            const targetStage = Math.min(
                this.type.growthStages,
                Math.floor(this.growthProgress / cyclesPerStage)
            );

            if (targetStage > this.currentStage) {
                this.currentStage = targetStage;

                // Flowering event
                if (this.type.attractsPollinators && !this.hasFlowered) {
                    this.hasFlowered = true;
                }
            }
        }
    }

    consumeResources() {
        if (!this.tile) return;

        // Consume moisture
        this.tile.consumeMoisture(3);

        // Consume nutrients
        this.tile.consumeNutrients(2);
    }

    trySpread(grid) {
        // Grass spreading logic
        if (this.type.id !== 'GRASS_PATCH') return;
        if (this.age < CONFIG.CYCLES_PER_DAY) return; // Must be at least 1 day old
        if (Math.random() > 0.01) return; // 1% chance per cycle

        // Try to spread to adjacent tile
        const adjacentTiles = grid.getAdjacentTiles(this.tile.x, this.tile.y);
        const validTiles = adjacentTiles.filter(t =>
            !t.isOccupied() &&
            t.moisture >= CONFIG.MIN_MOISTURE_TO_SURVIVE
        );

        if (validTiles.length > 0) {
            const targetTile = validTiles[Math.floor(Math.random() * validTiles.length)];
            const newGrass = new Plant(this.type, 'spread');
            targetTile.placeEntity(newGrass);
        }
    }

    die() {
        super.die();

        // Dead plants enrich soil slightly
        if (this.tile) {
            this.tile.addNutrients(20);
        }
    }

    getIcon() {
        if (!this.isAlive) {
            return '🍂'; // Wilted
        }

        // Show different icons based on growth stage
        if (this.type.id === 'OAK_TREE') {
            if (this.currentStage === 0) return '🌱';
            if (this.currentStage === 1) return '🌳';
            return '🌳';
        }

        if (this.type.id === 'WILDFLOWER') {
            if (this.currentStage === 0) return '🌱';
            return '🌸';
        }

        if (this.type.id === 'GRASS_PATCH') {
            return '🌿';
        }

        return this.type.icon;
    }

    getColor() {
        if (!this.isAlive) {
            return CONFIG.COLORS.DEAD;
        }

        // Adjust color based on health
        const healthRatio = this.health / 100;
        if (healthRatio < 0.5) {
            return '#A1887F'; // Sickly brown
        }

        return this.type.color;
    }

    getDescription() {
        const days = this.getAgeDays();
        const stage = this.currentStage;
        const maxStage = this.type.growthStages || 1;

        if (!this.isAlive) {
            return `${this.type.name} - Dead after ${days} days`;
        }

        let desc = `${this.type.name}\n`;
        desc += `Age: ${days} days\n`;
        desc += `Health: ${Math.round(this.health)}%\n`;
        desc += `Growth: Stage ${stage}/${maxStage}\n`;

        if (this.cyclesWithoutWater > 0) {
            desc += `⚠️ Needs water!\n`;
        }

        if (this.tile) {
            desc += `Moisture: ${Math.round(this.tile.moisture)}%\n`;
            desc += `Sunlight: ${Math.round(this.tile.sunlight)}%`;
        }

        return desc;
    }
}
