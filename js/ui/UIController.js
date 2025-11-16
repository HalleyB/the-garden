// UIController.js - Manages UI interactions and updates

import { ELEMENT_TYPES } from '../config.js';
import { Storage } from '../storage/Storage.js';

export class UIController {
    constructor(simulationEngine, renderer) {
        this.engine = simulationEngine;
        this.renderer = renderer;
        this.storage = new Storage();
        this.selectedElement = null;
        this.timerInterval = null;

        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
        this.startTimerUpdate();
    }

    initializeElements() {
        // Get DOM elements
        this.tutorialOverlay = document.getElementById('tutorial-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.elementSelection = document.getElementById('element-selection');
        this.placeBtn = document.getElementById('place-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.timerText = document.getElementById('timer-text');
        this.tooltip = document.getElementById('tooltip');
        this.tooltipContent = document.getElementById('tooltip-content');
        this.confirmModal = document.getElementById('confirm-modal');
        this.confirmTitle = document.getElementById('confirm-title');
        this.confirmDescription = document.getElementById('confirm-description');
        this.confirmYes = document.getElementById('confirm-yes');
        this.confirmNo = document.getElementById('confirm-no');
        this.screenshotBtn = document.getElementById('screenshot-btn');

        // Stats
        this.statTotal = document.getElementById('stat-total');
        this.statPlants = document.getElementById('stat-plants');
        this.statMoisture = document.getElementById('stat-moisture');
        this.statHealth = document.getElementById('stat-health');

        // Leaderboard and contributions
        this.leaderboard = document.getElementById('leaderboard');
        this.contributions = document.getElementById('contributions');

        // Populate element selection
        this.populateElementSelection();
    }

    setupEventListeners() {
        // Tutorial
        this.startBtn.addEventListener('click', () => {
            this.tutorialOverlay.classList.add('hidden');
        });

        // Place button
        this.placeBtn.addEventListener('click', () => {
            if (this.selectedElement && this.renderer.selectedTileX !== null) {
                this.confirmPlacement();
            }
        });

        // Renderer events
        this.renderer.onTileClick = (tile) => this.handleTileClick(tile);
        this.renderer.onTileHover = (tile) => this.handleTileHover(tile);

        // Confirmation modal
        this.confirmYes.addEventListener('click', () => this.executePlace ment());
        this.confirmNo.addEventListener('click', () => this.closeConfirmModal());

        // Screenshot
        this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());

        // Listen to simulation updates
        this.engine.addListener(() => this.updateUI());
    }

    populateElementSelection() {
        this.elementSelection.innerHTML = '';

        // Add each element type as a card
        for (const [key, elementType] of Object.entries(ELEMENT_TYPES)) {
            const card = document.createElement('div');
            card.className = 'element-card';
            card.dataset.elementId = key;

            card.innerHTML = `
                <div class="element-icon">${elementType.icon}</div>
                <div class="element-name">${elementType.name}</div>
            `;

            card.addEventListener('click', () => this.selectElement(key, card));

            this.elementSelection.appendChild(card);
        }
    }

    selectElement(elementId, cardElement) {
        // Remove previous selection
        const previousSelected = this.elementSelection.querySelector('.element-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Select new element
        cardElement.classList.add('selected');
        this.selectedElement = elementId;

        // Update button
        this.placeBtn.disabled = this.renderer.selectedTileX === null;
        this.placeBtn.textContent = `Place ${ELEMENT_TYPES[elementId].name}`;
    }

    handleTileClick(tile) {
        if (!this.selectedElement) {
            // Show tile info
            if (tile.entity) {
                this.showTooltip(tile.entity.getDescription(), true);
            }
            return;
        }

        // Check if can place
        if (!this.storage.canPlaceToday()) {
            alert('You can only place one element per day! Come back tomorrow.');
            return;
        }

        const elementType = ELEMENT_TYPES[this.selectedElement];

        // Check if tile is valid
        if (!tile.canPlace(elementType)) {
            let reason = 'Cannot place element here.';

            if (tile.isOccupied() && tile.entity.isAlive) {
                reason = 'This tile is already occupied!';
            } else if (elementType.needsSunlight && tile.sunlight < elementType.minSunlight) {
                reason = `${elementType.name} needs more sunlight! (${tile.sunlight}/${elementType.minSunlight})`;
            }

            alert(reason);
            return;
        }

        // Select tile
        this.renderer.selectTile(tile.x, tile.y);
        this.placeBtn.disabled = false;
    }

    handleTileHover(tile) {
        if (!tile) {
            this.hideTooltip();
            return;
        }

        if (tile.entity) {
            // Don't show tooltip during placement
            if (!this.selectedElement) {
                this.showTooltip(tile.entity.getDescription());
            }
        } else if (this.selectedElement) {
            const elementType = ELEMENT_TYPES[this.selectedElement];
            const canPlace = tile.canPlace(elementType);

            if (!canPlace) {
                let reason = '';
                if (elementType.needsSunlight && tile.sunlight < elementType.minSunlight) {
                    reason = `Needs more sunlight (${Math.round(tile.sunlight)}/${elementType.minSunlight})`;
                }
                this.showTooltip(reason);
            } else {
                this.hideTooltip();
            }
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(content, persistent = false) {
        this.tooltipContent.innerHTML = content.replace(/\n/g, '<br>');
        this.tooltip.classList.remove('hidden');

        if (!persistent) {
            // Position near mouse
            this.tooltip.style.left = `${this.renderer.lastMouseX + 10}px`;
            this.tooltip.style.top = `${this.renderer.lastMouseY + 10}px`;
        }
    }

    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }

    confirmPlacement() {
        const elementType = ELEMENT_TYPES[this.selectedElement];

        this.confirmTitle.textContent = `Place ${elementType.name}?`;
        this.confirmDescription.textContent = elementType.description;

        this.confirmModal.classList.remove('hidden');
    }

    executePlacement() {
        const elementType = ELEMENT_TYPES[this.selectedElement];
        const tileX = this.renderer.selectedTileX;
        const tileY = this.renderer.selectedTileY;

        // Import the appropriate class
        let ElementClass;
        if (elementType.category === 'plant') {
            import('../elements/plants.js').then(module => {
                ElementClass = module.Plant;
                this.finalizePlacement(ElementClass, elementType, tileX, tileY);
            });
        } else if (elementType.category === 'environmental') {
            import('../elements/environmental.js').then(module => {
                ElementClass = module.Environmental;
                this.finalizePlacement(ElementClass, elementType, tileX, tileY);
            });
        }
    }

    finalizePlacement(ElementClass, elementType, tileX, tileY) {
        const result = this.engine.placeElement(
            ElementClass,
            elementType,
            tileX,
            tileY,
            this.storage.userId
        );

        if (result.success) {
            // Record placement
            this.storage.recordPlacement();
            this.storage.addContribution(result.element, tileX, tileY);

            // Reset selection
            this.selectedElement = null;
            this.renderer.clearSelection();
            this.placeBtn.disabled = true;
            this.placeBtn.textContent = 'Select an element';

            // Remove selected class from cards
            const selectedCard = this.elementSelection.querySelector('.element-card.selected');
            if (selectedCard) {
                selectedCard.classList.remove('selected');
            }

            // Update UI
            this.updateUI();

            // Close modal
            this.closeConfirmModal();

            // Show success message
            alert(`${elementType.name} placed! Come back tomorrow to see how it grows.`);
        } else {
            alert(`Failed to place element: ${result.error}`);
        }
    }

    closeConfirmModal() {
        this.confirmModal.classList.add('hidden');
    }

    updateUI() {
        const stats = this.engine.getStats();

        // Update stats
        this.statTotal.textContent = stats.totalElements;
        this.statPlants.textContent = stats.livingPlants;
        this.statMoisture.textContent = `${stats.avgMoisture}%`;
        this.statHealth.textContent = `${stats.ecosystemHealth}%`;

        // Update leaderboard
        this.updateLeaderboard();

        // Update contributions
        this.updateContributions();
    }

    updateLeaderboard() {
        const leaderboard = this.engine.getLeaderboard(10);

        if (leaderboard.length === 0) {
            this.leaderboard.innerHTML = '<div class="leaderboard-empty">No elements yet!</div>';
            return;
        }

        this.leaderboard.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span>${entry.icon} ${entry.name}</span>
                <span>${entry.age} days</span>
            `;

            this.leaderboard.appendChild(item);
        });
    }

    updateContributions() {
        const contributions = this.engine.getUserContributions(this.storage.userId);

        if (contributions.length === 0) {
            this.contributions.innerHTML = '<div class="contribution-empty">Place your first element!</div>';
            return;
        }

        this.contributions.innerHTML = '';

        contributions.forEach(contrib => {
            const item = document.createElement('div');
            item.className = `contribution-item ${contrib.isAlive ? 'alive' : 'dead'}`;

            const status = contrib.isAlive ? `${contrib.health}% health` : 'Dead';

            item.innerHTML = `
                <span>${contrib.icon} ${contrib.name}</span>
                <span>${contrib.age} days</span>
                <span>${status}</span>
            `;

            this.contributions.appendChild(item);
        });
    }

    startTimerUpdate() {
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        if (!this.storage.canPlaceToday()) {
            const timeRemaining = this.storage.getTimeUntilNextPlacement();
            const formatted = this.storage.formatTimeRemaining(timeRemaining);

            this.timerText.textContent = `Next placement in: ${formatted}`;
            this.timerDisplay.classList.add('cooldown');
        } else {
            this.timerText.textContent = 'Place your element!';
            this.timerDisplay.classList.remove('cooldown');
        }
    }

    takeScreenshot() {
        // Create a temporary canvas with the main canvas content
        const canvas = this.renderer.canvas;
        const dataURL = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        link.download = `the-garden-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }
}
