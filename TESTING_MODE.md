# Testing Mode Guide 🧪

Testing Mode is a powerful development tool that allows you to manipulate time and bypass restrictions in The Garden. This makes it easy to test the ecosystem without waiting hours or days.

## Activating Testing Mode

There are two ways to activate Testing Mode:

1. **Keyboard Shortcut**: Press `Ctrl + T` (Windows/Linux) or `Cmd + T` (Mac)
2. **Click the Button**: Click the 🧪 button in the top-right header

When active, you'll see:
- An orange panel sliding in from the left
- A pulsing "🧪 TESTING MODE ACTIVE" indicator in the top-right

## Features

### Simulation Controls

Run simulation cycles manually without waiting:

- **Run 1 Cycle**: Execute a single 5-minute cycle instantly
- **Run 10 Cycles**: Fast-forward ~50 minutes
- **Run 100 Cycles**: Fast-forward ~8 hours
- **Run 1 Day**: Execute 288 cycles (full 24-hour day)

**Keyboard Shortcut**: Press `Space` to run 1 cycle

### Time Speed Controls

Adjust how fast the simulation runs in real-time:

- **1x (Normal)**: Cycles run every 5 minutes (default)
- **10x Speed**: Cycles run every 30 seconds
- **60x Speed**: Cycles run every 5 seconds (very fast!)
- **⏸ Pause**: Stop automatic simulation completely

### Placement Controls

Bypass the daily placement limit:

- **Reset Cooldown**: Clear the 24-hour timer so you can place elements immediately
- **Toggle Daily Limit**: Completely disable the one-element-per-day restriction

**Keyboard Shortcut**: Press `R` to reset cooldown

### Garden Controls

Quick garden management:

- **Clear All Elements**: Remove all plants and elements (keeps grid intact)
- **Full Reset**: Completely reset to a new garden (clears all data)
- **Re-seed Garden**: Add the initial starter elements again

### Statistics

Track your testing progress:

- **Cycle Count**: Total number of cycles executed
- **Simulated Days**: How many virtual days have passed
- **Current Speed**: Active time multiplier

### Quick Actions

Useful shortcuts for testing:

- **Water Entire Garden**: Set all tiles to 100% moisture
- **Sunlight Boost All**: Maximize sunlight on all tiles
- **Kill All Plants**: Test decay and death mechanics

## Common Testing Workflows

### Test Plant Growth

1. Open Testing Mode (`Ctrl/Cmd + T`)
2. Place a plant (Oak Tree or Wildflower)
3. Click "Water Entire Garden" to ensure it has moisture
4. Click "Run 1 Day" to see it grow through multiple stages
5. Repeat to see full lifecycle

### Test Ecosystem Balance

1. Seed garden with multiple plant types
2. Set speed to 10x or 60x
3. Watch how the ecosystem evolves in real-time
4. Intervene with rain clouds or sunbeams as needed

### Test Death Mechanics

1. Place several plants
2. Set speed to 10x
3. DO NOT water them
4. Watch them wilt and die from lack of moisture

### Test Grass Spreading

1. Place a few grass patches
2. Water the garden
3. Run multiple days (or use high speed)
4. Watch grass spread to adjacent tiles

### Test Seasonal Changes

1. Run 7 days to advance one season
2. Observe how growth rates change
3. Test which plants survive in Winter vs Spring

## Tips

- **Pause Before Making Changes**: Use the Pause button before manually placing elements or modifying the garden
- **Save Your Progress**: The garden state auto-saves, but you can manually trigger a save by placing an element
- **Reset If Things Break**: Use "Full Reset" if the simulation gets into a weird state
- **Watch the Console**: Check browser console (F12) for detailed logs about what's happening

## Known Limitations

- Very high speeds (60x) may cause performance issues on slower computers
- Running 100+ cycles at once may briefly freeze the UI while processing
- Placement cooldown toggle requires page refresh to fully reset

## Deactivating Testing Mode

To exit Testing Mode:

1. Click the ✕ button in the testing panel header, or
2. Press `Ctrl/Cmd + T` again

This will:
- Hide the testing panel
- Reset simulation speed to 1x (normal)
- Remove the testing mode indicator

**Note**: The testing mode toggle button (🧪) is always visible, even when testing mode is off.

## For Developers

Testing Mode is implemented in `/js/testing/TestingMode.js` and provides direct access to:

- Simulation engine cycle execution
- Grid state manipulation
- Storage override functions
- Time multiplier controls

You can access the testing mode instance via the console:
```javascript
window.theGarden.testingMode.runCycles(10);
window.theGarden.testingMode.waterAllTiles();
```

---

**Happy Testing! 🌱**
