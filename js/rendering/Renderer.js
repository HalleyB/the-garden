// Renderer.js - Canvas rendering system

import { CONFIG } from '../config.js';

export class Renderer {
    constructor(canvas, minimapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');

        // Camera properties
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1.0;

        // Interaction state
        this.isDragging = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragThreshold = 5; // pixels - must move this far to be considered a drag

        // Hover state
        this.hoveredTile = null;

        // Selection state
        this.selectedTileX = null;
        this.selectedTileY = null;

        // Grid reference
        this.grid = null;

        // Initialize canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Setup input handlers
        this.setupInputHandlers();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Center camera on grid
        if (this.grid) {
            this.centerCamera();
        }
    }

    centerCamera() {
        if (!this.grid) return;

        const gridPixelSize = this.grid.size * CONFIG.TILE_SIZE * this.zoom;
        this.cameraX = (this.canvas.width - gridPixelSize) / 2;
        this.cameraY = (this.canvas.height - gridPixelSize) / 2;
    }

    setGrid(grid) {
        this.grid = grid;
        this.centerCamera();
    }

    // Main render function
    render() {
        if (!this.grid) return;

        // Clear canvas
        this.ctx.fillStyle = '#E3F2FD';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Apply camera transform
        this.ctx.translate(this.cameraX, this.cameraY);
        this.ctx.scale(this.zoom, this.zoom);

        // Render grid
        this.renderGrid();

        // Render entities
        this.renderEntities();

        // Render hover highlight
        if (this.hoveredTile) {
            this.renderTileHighlight(this.hoveredTile.x, this.hoveredTile.y, 'rgba(255, 255, 255, 0.3)');
        }

        // Render selection
        if (this.selectedTileX !== null && this.selectedTileY !== null) {
            this.renderTileHighlight(this.selectedTileX, this.selectedTileY, 'rgba(76, 175, 80, 0.5)');
        }

        // Restore context
        this.ctx.restore();

        // Render minimap
        this.renderMinimap();
    }

    renderGrid() {
        const tileSize = CONFIG.TILE_SIZE;

        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const tile = this.grid.tiles[y][x];

                // Tile background
                this.ctx.fillStyle = tile.getColor();
                this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                // Grid lines
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

                // Show moisture level as subtle overlay
                if (tile.moisture < 30) {
                    this.ctx.fillStyle = 'rgba(255, 193, 7, 0.2)';
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }

    renderEntities() {
        const tileSize = CONFIG.TILE_SIZE;

        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const tile = this.grid.tiles[y][x];

                if (tile.entity) {
                    const entity = tile.entity;

                    // Draw entity icon
                    const icon = entity.getIcon();
                    const fontSize = tileSize * 0.8;

                    this.ctx.font = `${fontSize}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';

                    const centerX = x * tileSize + tileSize / 2;
                    const centerY = y * tileSize + tileSize / 2;

                    // Add shadow for living entities
                    if (entity.isAlive) {
                        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                        this.ctx.shadowBlur = 4;
                        this.ctx.shadowOffsetX = 2;
                        this.ctx.shadowOffsetY = 2;
                    }

                    // Apply opacity for dead entities
                    if (!entity.isAlive) {
                        this.ctx.globalAlpha = 0.5;
                    }

                    this.ctx.fillText(icon, centerX, centerY);

                    // Reset shadow and alpha
                    this.ctx.shadowColor = 'transparent';
                    this.ctx.shadowBlur = 0;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    this.ctx.globalAlpha = 1;

                    // Show health bar for plants
                    if (entity.type.category === 'plant' && entity.isAlive && entity.health < 100) {
                        this.renderHealthBar(x, y, entity.health);
                    }
                }
            }
        }
    }

    renderHealthBar(tileX, tileY, health) {
        const tileSize = CONFIG.TILE_SIZE;
        const barWidth = tileSize * 0.8;
        const barHeight = 3;
        const x = tileX * tileSize + (tileSize - barWidth) / 2;
        const y = tileY * tileSize + tileSize - 6;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthWidth = (health / 100) * barWidth;
        const healthColor = health > 50 ? '#4CAF50' : health > 25 ? '#FFA726' : '#E74C3C';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(x, y, healthWidth, barHeight);
    }

    renderTileHighlight(tileX, tileY, color) {
        const tileSize = CONFIG.TILE_SIZE;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    }

    renderMinimap() {
        if (!this.grid) return;

        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;

        // Clear
        ctx.fillStyle = '#E3F2FD';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate tile size for minimap
        const tileSize = Math.min(canvas.width, canvas.height) / this.grid.size;

        // Render simplified grid
        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const tile = this.grid.tiles[y][x];

                if (tile.entity && tile.entity.isAlive) {
                    ctx.fillStyle = tile.entity.getColor();
                    ctx.fillRect(x * tileSize, y * tileSize, Math.max(1, tileSize), Math.max(1, tileSize));
                } else {
                    // Show moisture
                    const moistureRatio = tile.moisture / 100;
                    const green = Math.floor(100 + moistureRatio * 100);
                    ctx.fillStyle = `rgb(200, ${green}, 150)`;
                    ctx.fillRect(x * tileSize, y * tileSize, Math.max(1, tileSize), Math.max(1, tileSize));
                }
            }
        }

        // Show viewport rectangle
        const viewportWidth = (this.canvas.width / this.zoom / CONFIG.TILE_SIZE) * tileSize;
        const viewportHeight = (this.canvas.height / this.zoom / CONFIG.TILE_SIZE) * tileSize;
        const viewportX = (-this.cameraX / this.zoom / CONFIG.TILE_SIZE) * tileSize;
        const viewportY = (-this.cameraY / this.zoom / CONFIG.TILE_SIZE) * tileSize;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    }

    // Input handling
    setupInputHandlers() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    handleMouseDown(e) {
        // Don't set isDragging yet - wait to see if they actually drag
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        console.log('🖱️ Mouse down at:', e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        // Check if mouse button is pressed
        if (e.buttons === 1) {
            // Calculate distance from initial mouse down position
            const dx = e.clientX - this.mouseDownX;
            const dy = e.clientY - this.mouseDownY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only start dragging if moved beyond threshold
            if (distance > this.dragThreshold) {
                if (!this.isDragging) {
                    console.log('↔️ Started dragging (moved', Math.round(distance), 'pixels)');
                    this.isDragging = true;
                }
            }

            // If dragging, move camera
            if (this.isDragging) {
                const moveDx = e.clientX - this.lastMouseX;
                const moveDy = e.clientY - this.lastMouseY;

                this.cameraX += moveDx;
                this.cameraY += moveDy;

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        } else {
            // Mouse button not pressed - update hovered tile
            const tile = this.getTileAtScreenPosition(e.clientX, e.clientY);
            this.hoveredTile = tile;

            // Trigger hover event
            if (this.onTileHover && tile) {
                this.onTileHover(tile);
            }
        }
    }

    handleMouseUp(e) {
        console.log('🖱️ Mouse up - isDragging:', this.isDragging);

        if (!this.isDragging) {
            // Click event
            const tile = this.getTileAtScreenPosition(e.clientX, e.clientY);
            console.log('🎯 Tile at click position:', tile ? `(${tile.x}, ${tile.y})` : 'null');

            if (tile && this.onTileClick) {
                console.log('📞 Calling onTileClick handler');
                this.onTileClick(tile);
            } else if (!tile) {
                console.warn('⚠️ Click was outside the grid');
            } else if (!this.onTileClick) {
                console.error('❌ onTileClick handler not set!');
            }
        } else {
            console.log('↔️ Ignoring click because user was dragging');
        }

        this.isDragging = false;
    }

    handleMouseLeave() {
        this.isDragging = false;
        this.hoveredTile = null;
    }

    handleWheel(e) {
        e.preventDefault();

        const delta = -Math.sign(e.deltaY) * CONFIG.ZOOM_SPEED;
        const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, this.zoom + delta));

        // Zoom towards mouse position
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - this.cameraX) / this.zoom;
        const worldY = (mouseY - this.cameraY) / this.zoom;

        this.zoom = newZoom;

        this.cameraX = mouseX - worldX * this.zoom;
        this.cameraY = mouseY - worldY * this.zoom;
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.mouseDownX = touch.clientX;
            this.mouseDownY = touch.clientY;
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
            this.isDragging = false; // Don't assume dragging yet
        }
    }

    handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            const touch = e.touches[0];

            // Calculate distance from initial touch
            const dx = touch.clientX - this.mouseDownX;
            const dy = touch.clientY - this.mouseDownY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only start dragging if moved beyond threshold
            if (distance > this.dragThreshold) {
                this.isDragging = true;
            }

            // If dragging, move camera
            if (this.isDragging) {
                const moveDx = touch.clientX - this.lastMouseX;
                const moveDy = touch.clientY - this.lastMouseY;

                this.cameraX += moveDx;
                this.cameraY += moveDy;

                this.lastMouseX = touch.clientX;
                this.lastMouseY = touch.clientY;
            }
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length === 0) {
            // If not dragging, it's a tap/click
            if (!this.isDragging) {
                const tile = this.getTileAtScreenPosition(this.mouseDownX, this.mouseDownY);
                if (tile && this.onTileClick) {
                    this.onTileClick(tile);
                }
            }

            this.isDragging = false;
        }
    }

    // Get tile at screen position
    getTileAtScreenPosition(screenX, screenY) {
        if (!this.grid) return null;

        const rect = this.canvas.getBoundingClientRect();
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        const worldX = (canvasX - this.cameraX) / this.zoom;
        const worldY = (canvasY - this.cameraY) / this.zoom;

        const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
        const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);

        return this.grid.getTile(tileX, tileY);
    }

    // Set selected tile
    selectTile(x, y) {
        this.selectedTileX = x;
        this.selectedTileY = y;
    }

    // Clear selection
    clearSelection() {
        this.selectedTileX = null;
        this.selectedTileY = null;
    }
}
