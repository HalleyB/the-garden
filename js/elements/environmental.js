// environmental.js - Environmental element implementations

import { CONFIG } from '../config.js';
import { Element } from './Element.js';

export class Environmental extends Element {
    constructor(type, placedBy) {
        super(type, placedBy);
        this.hasActivated = false;
    }

    update(grid, season) {
        if (!this.isAlive || !this.tile) return;

        this.age++;

        // Permanent elements don't expire
        if (this.type.permanent) {
            return;
        }

        // Check if element has expired
        if (this.type.duration && this.age >= this.type.duration) {
            this.die();
            return;
        }

        // Apply effects
        this.applyEffects(grid);
    }

    applyEffects(grid) {
        if (!this.tile) return;

        const x = this.tile.x;
        const y = this.tile.y;
        const radius = this.type.effectRadius || 0;

        // Get affected tiles
        const affectedTiles = grid.getTilesInRadius(x, y, radius);

        // Apply different effects based on type
        if (this.type.id === 'RAIN_CLOUD') {
            this.applyRain(affectedTiles);
        } else if (this.type.id === 'SUNBEAM') {
            this.applySunlight(affectedTiles);
        }
    }

    applyRain(tiles) {
        for (const tile of tiles) {
            // Center tile gets more water
            if (tile === this.tile) {
                tile.addMoisture(this.type.moistureBoost);
            } else {
                tile.addMoisture(this.type.moistureBoost / 2);
            }
        }
    }

    applySunlight(tiles) {
        for (const tile of tiles) {
            tile.addSunlight(this.type.sunlightBoost);
        }
    }

    getIcon() {
        return this.type.icon;
    }

    getDescription() {
        if (!this.isAlive && !this.type.permanent) {
            return `${this.type.name} - Expired`;
        }

        let desc = `${this.type.name}\n`;

        if (this.type.permanent) {
            desc += `Permanent structure\n`;
        } else if (this.type.duration) {
            const cyclesLeft = this.type.duration - this.age;
            desc += `Remaining: ${cyclesLeft} cycles\n`;
        }

        desc += this.type.description;

        return desc;
    }
}
