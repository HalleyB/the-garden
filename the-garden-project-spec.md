# The Garden - Project Specification Document

## Executive Summary

**Project Name:** The Garden  
**Type:** Collaborative Web-Based Ecosystem Simulation  
**Target Audience:** Casual gamers, nature enthusiasts, collaborative community builders  
**Monetization:** Display advertising (Google AdSense)  
**Platform:** Web (mobile-responsive)  
**Tech Stack:** JavaScript, AWS (Lambda, DynamoDB, S3, CloudFront, API Gateway)

**Core Concept:** A persistent virtual ecosystem where each visitor contributes ONE element per day (plant, animal, environmental feature). The ecosystem evolves in real-time based on ecological rules, creating emergent gameplay, beautiful visuals, and strong daily engagement.

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Core Mechanics](#core-mechanics)
3. [Ecosystem Simulation Rules](#ecosystem-simulation-rules)
4. [User Experience & Flows](#user-experience--flows)
5. [Technical Architecture](#technical-architecture)
6. [Visual Design](#visual-design)
7. [Engagement & Retention Features](#engagement--retention-features)
8. [Monetization Strategy](#monetization-strategy)
9. [Viral Marketing Strategy](#viral-marketing-strategy)
10. [Development Roadmap](#development-roadmap)
11. [Cost Analysis](#cost-analysis)
12. [Risk Assessment](#risk-assessment)

---

## Project Vision

### What Makes This Unique

- **Daily Return Value:** Users check on their contributions and see how the ecosystem evolved overnight
- **Collaborative Competition:** Balance between helping the ecosystem thrive and creating your own legacy
- **Emergent Gameplay:** No two gardens will ever be the same; outcomes are unpredictable
- **Visual Storytelling:** Time-lapses and screenshots tell compelling stories
- **Low Barrier to Entry:** One click per day, no account required (optional for tracking)
- **Educational Subtext:** Players learn ecological concepts through gameplay

### Success Metrics

- **Daily Active Users (DAU):** Target 10k within 3 months
- **Return Rate:** 40%+ users return within 24 hours
- **Time on Site:** 3-5 minutes average per session
- **Streak Retention:** 30%+ users maintain 7+ day streaks
- **Share Rate:** 15%+ users share screenshots or time-lapses

---

## Core Mechanics

### Daily Contribution System

Each visitor can place **ONE** element per 24-hour period (tracked by IP + optional account).

#### Element Categories

**🌱 Plant Life** (Growth-based)
- **Oak Tree**: Slow growth (7 days to mature), lives 60+ days, provides shade, attracts birds
- **Wildflower**: Fast bloom (2 days), lives 10-15 days, requires sunlight, attracts pollinators
- **Grass Patch**: Spreads to adjacent tiles (1 per day), lives indefinitely with water, prevents erosion
- **Mushroom**: Appears in shade, decomposes dead matter, lives 5-7 days, spreads spores

**💧 Environmental Elements** (Support-based)
- **Rain Cloud**: Waters 3x3 tile area, lasts 1 cycle, critical for survival
- **Sunbeam**: Boosts growth in 2x2 area for 2 cycles, needed for flowers
- **Compost Pile**: Enriches soil in 2x2 area permanently (+50% growth speed)
- **Boulder**: Permanent decoration, creates shade, blocks spread

**🦋 Creatures** (Interactive)
- **Butterfly**: Pollinates flowers within 5 tiles, lives 5 days, needs flowers to survive
- **Rabbit**: Eats grass/flowers, lives 8 days, reproduces if food abundant
- **Bird**: Eats seeds, spreads them 3-8 tiles away, lives 12 days, nests in trees
- **Earthworm**: Aerates soil (+25% growth), invisible but effects shown, lives 15 days

**🔥 Chaos Elements** (Limited availability - unlocked at higher levels)
- **Wildfire Starter**: Clears 5x5 area, allows new growth, can go out of control
- **Drought Hex**: 4x4 area loses moisture for 3 days, stress test
- **Invasive Vine**: Spreads aggressively (2 tiles/day), chokes other plants

### Placement Rules

- Must place on valid tile (not occupied unless replacing dead element)
- Some elements require conditions (mushrooms need shade, flowers need light)
- Visual feedback shows valid/invalid placement zones
- Confirmation dialog with element description before placing

---

## Ecosystem Simulation Rules

### Grid System

**Initial Size:** 100x100 tile grid (expandable)  
**Tile Properties:**
- Moisture level (0-100)
- Sunlight level (0-100) - affected by time of day, tree shade
- Nutrient level (0-100) - depleted by plants, replenished by decomposition
- Temperature (affected by season)

### Simulation Cycles

**Cycle Frequency:** Every 5 minutes (288 cycles per day)

**Per-Cycle Calculations:**
1. **Moisture propagation**: Rain clouds spread water to adjacent tiles (-5 per cycle)
2. **Plant growth**: If moisture > 20 and sunlight adequate, growth increases
3. **Animal behavior**: Move toward food, reproduce if conditions met, die if starving
4. **Decay system**: Dead plants become compost, animals disappear
5. **Spread mechanics**: Grass expands, vines spread, seeds germinate

### Survival Conditions

**Plants:**
- Need moisture level > 20 to survive (else wilt in 3 cycles)
- Need appropriate sunlight (flowers need 60+, mushrooms need <40)
- Overcrowding (5+ plants in 3x3 area) causes disease (-10% health/cycle)

**Animals:**
- Need food within 5 tiles (species-specific)
- Herbivores need plants, pollinators need flowers
- Starvation death after 12 cycles without food
- Can reproduce if well-fed (20% chance per cycle if conditions optimal)

### Seasonal Effects

**Seasons change weekly:**
- **Spring** (Week 1): +50% growth rate, flowers bloom easily
- **Summer** (Week 2): -20% moisture retention, more sun
- **Autumn** (Week 3): Trees drop seeds, decay rate +30%
- **Winter** (Week 4): Growth rate -70%, only hardy plants survive

### Day/Night Cycle

**24-hour real-time cycle:**
- Day (6am-8pm): Full sunlight
- Night (8pm-6am): Reduced sunlight (nocturnal animals active, visual aesthetic change)

---

## User Experience & Flows

### First-Time Visitor Flow

1. **Landing page**: Shows live garden with gentle animations
2. **Call-to-action**: "Add Your Element" button (prominent)
3. **Tutorial overlay**: 
   - "Every person adds ONE thing per day"
   - "The garden evolves based on everyone's choices"
   - "Will your plant survive?"
4. **Element selection**: Visual menu of available elements with descriptions
5. **Placement**: Click/tap tile to place (with validation feedback)
6. **Confirmation**: "You planted an Oak Tree! Come back tomorrow to see how it grows."
7. **Encouragement**: "Create an account to track your contributions" (optional)

### Returning Visitor Flow

1. **Check status**: Highlight user's previous contributions (if tracked)
   - "Your Oak Tree grew 2 stages!"
   - "Your Butterfly died (no flowers nearby)"
2. **View changes**: Option to see time-lapse of last 24 hours
3. **Place today's element**: Repeat placement flow
4. **Explore**: Zoom, pan, click on elements for info

### Navigation Structure

**Main View:**
- Zoomable/pannable canvas showing full garden
- Minimap in corner showing your location
- "Place Element" button (disabled if already placed today)
- Timer showing "Next placement in: 4h 23m"

**Side Panel (collapsible):**
- Your Stats: Contributions, oldest living element, streak
- Leaderboards: Top contributors, longest-living elements
- Challenges: Active community goals
- Info: Selected element details

**Top Bar:**
- Time-lapse viewer
- Screenshot tool
- Settings (sound, graphics quality)
- Optional account/login

---

## Technical Architecture

### Frontend (Static Site)

**Technology:** 
- Vanilla JavaScript or React (for state management)
- HTML5 Canvas or PixiJS for rendering
- WebSocket for real-time updates
- Responsive design (mobile-first)

**Key Components:**
- **GridRenderer**: Draws tiles, entities, animations
- **InputHandler**: Click/touch detection, placement validation
- **StateManager**: Syncs with backend, manages local state
- **UIController**: Panels, overlays, notifications
- **TimelapseGenerator**: Creates animation from snapshots

**Performance Considerations:**
- Lazy load off-screen tiles
- Throttle WebSocket updates (every 10s, not every cycle)
- Optimize canvas redraws (only dirty regions)
- Use sprite sheets for entities

### Backend (AWS Serverless)

**Architecture:**

```
CloudFront (CDN)
    ↓
S3 (Static site hosting)
    ↓
API Gateway (REST API)
    ↓
Lambda Functions:
    - PlaceElement
    - GetGardenState
    - RunSimulation (EventBridge trigger)
    - GenerateTimelapse
    - GetLeaderboards
    ↓
DynamoDB Tables:
    - GardenState (grid data)
    - UserContributions
    - ElementHistory
    - Leaderboards
```

**Lambda Functions:**

1. **PlaceElement**
   - Validates user hasn't placed today (check IP/account)
   - Validates placement location and conditions
   - Writes to DynamoDB
   - Returns updated state
   - **Estimated invocations:** 10k/day = $0.20/day

2. **GetGardenState**
   - Returns current grid state (with optional filtering)
   - Caches heavily (CloudFront + DynamoDB DAX)
   - **Estimated invocations:** 100k/day = $2/day

3. **RunSimulation** (EventBridge every 5 min)
   - Core ecosystem logic
   - Reads current state
   - Applies rules (growth, decay, movement)
   - Writes new state
   - Saves snapshot every hour
   - **Invocations:** 288/day = $0.01/day (but CPU-intensive)

4. **GenerateTimelapse**
   - On-demand or scheduled
   - Stitches hourly snapshots into video/GIF
   - Stores in S3
   - **Invocations:** User-triggered, ~100/day = $2/day

5. **GetLeaderboards**
   - Queries sorted data
   - Updates every hour
   - **Invocations:** 50k/day = $1/day

**DynamoDB Schema:**

```javascript
// GardenState Table
{
  "PK": "TILE#x_y",
  "SK": "CURRENT",
  "tileX": 45,
  "tileY": 67,
  "moisture": 75,
  "sunlight": 90,
  "nutrients": 50,
  "entity": {
    "type": "OAK_TREE",
    "id": "tree_12345",
    "age": 15,
    "health": 100,
    "placedBy": "user_abc",
    "timestamp": "2025-11-15T10:30:00Z"
  }
}

// UserContributions Table
{
  "PK": "USER#ip_or_id",
  "SK": "CONTRIBUTION#timestamp",
  "elementType": "OAK_TREE",
  "location": "45,67",
  "status": "alive",
  "age": 15
}

// ElementHistory Table (for time-lapses)
{
  "PK": "SNAPSHOT#timestamp",
  "gridState": {...} // compressed JSON
}
```

**WebSocket Integration:**
- Optional: Use AWS IoT Core or API Gateway WebSocket
- Broadcast state changes to connected clients
- Throttled updates (every 10 seconds)
- Fallback to polling if WebSocket fails

### Data Management

**State Persistence:**
- Full state snapshot saved hourly to S3
- Incremental changes logged in DynamoDB
- 30-day retention for time-lapse history
- Archive older data to Glacier

**Backup Strategy:**
- Daily DynamoDB backups
- S3 versioning enabled
- Disaster recovery plan: Restore from latest snapshot

---

## Visual Design

### Art Style Options

**Recommendation: Pixel Art**
- Nostalgic, broadly appealing
- Easier to create/modify assets
- Small file sizes (performance)
- Screenshot-friendly (social media)

**Alternative: Minimalist Vector**
- Clean, modern aesthetic
- Scalable (no resolution loss)
- Slightly higher appeal to design-conscious users

### Color Palette

**Base:**
- Soil: #8B7355 (rich brown)
- Grass: #7CB342 (vibrant green)
- Water: #42A5F5 (clear blue)
- Sky: Gradient from #E3F2FD to #1E88E5

**Entities:**
- Trees: #558B2F (forest green) → #9E9D24 (autumn yellow)
- Flowers: Variety (#EC407A pink, #FFA726 orange, #AB47BC purple)
- Animals: Distinct silhouettes with subtle coloring

### Animation Guidelines

**Subtle Life:**
- Grass sways gently (CSS animation)
- Flowers bob in breeze
- Animals hop/flutter (frame animation)
- Rain droplets fall and spread
- Day/night transition (sky color gradient)

**Growth Animation:**
- Plants grow in stages (seedling → sapling → mature)
- Smooth scale transition over 2 seconds when stage changes
- Particle effect when blooming

**Death Animation:**
- Wilt (tilt, desaturate over 3 seconds)
- Decompose (fade out, become soil enrichment indicator)
- No gore or sad imagery (wholesome vibe)

### UI/UX Design Principles

- **Minimalist interface**: Garden is the focus, UI fades to background
- **Clear feedback**: Visual confirmation for all actions
- **Accessibility**: Color-blind friendly palette, screen reader support
- **Mobile-optimized**: Touch targets 44x44px minimum, swipe to pan

---

## Engagement & Retention Features

### Daily Habit Loop

**The Hook:**
1. Place element (15 seconds)
2. Check yesterday's contributions (30 seconds)
3. Explore garden changes (2-3 minutes)
4. Set reminder for tomorrow

**Psychological Triggers:**
- **Ownership**: "My tree is 47 days old"
- **Curiosity**: "What happened overnight?"
- **Progress**: Watching growth stages
- **FOMO**: "If I miss a day, I break my streak"

### Streak System

**Tracking:**
- Days contributed consecutively
- Visual indicator (flame icon, counter)
- Milestones: 7, 30, 100, 365 days

**Rewards:**
- Unlock special elements (golden flower at 30 days)
- Badge collection
- Leaderboard placement
- Priority placement (your element loads first visually)

### Leaderboards

**Categories:**
1. **Longest-Living Element**: "Sarah's Oak Tree: 143 days"
2. **Most Contributions**: "Alex: 89 plants placed"
3. **Best Caretaker**: Calculated by ecosystem health in your zone
4. **Streak Champions**: Longest current streaks
5. **Weekly MVP**: Biggest positive impact this week

**Display:**
- Top 10 shown publicly
- Your rank always visible ("You're #247")
- Refresh daily

### Challenges (Community Goals)

**Types:**

**Rescue Missions:**
- "Zone 4-B is dying! Place water elements to save it."
- Timer: 48 hours
- Reward: Special badge, featured in time-lapse

**Creation Challenges:**
- "Create a forest in the northwest corner by Sunday"
- Progress bar showing community effort
- Reward: Named on monument (permanent in-game feature)

**Balance Challenges:**
- "Maintain 70+ ecosystem health for 7 days"
- Requires coordination (not too many of any one thing)
- Reward: Unlock new element type for everyone

**Ecosystem Events:**

**Natural Events:**
- Random droughts (community must respond with rain)
- Overpopulation outbreaks (rabbits multiply too fast)
- Seed dispersal events (birds spread 100 random seeds)

### Social Features

**Shareable Content:**

1. **Screenshots:**
   - "Share Your Garden" button
   - Auto-watermark with stats ("Day 47 | 12,459 elements")
   - Direct share to Twitter, Reddit, Instagram

2. **Time-lapses:**
   - Generate 24-hour, 7-day, or 30-day time-lapse
   - High-quality video export
   - "Watch what we built together"

3. **Your Legacy:**
   - "See All My Contributions" view
   - Personal time-lapse of just your elements
   - Export personal stats card

**No Direct Communication:**
- No chat feature (avoid moderation nightmare)
- No user-to-user messaging
- Communication happens through actions in garden

---

## Monetization Strategy

### Primary: Display Advertising

**Ad Placements:**

1. **Sidebar Banner** (300x600)
   - Right side on desktop
   - Collapses on mobile
   - Always visible but non-intrusive

2. **Top Leaderboard** (728x90)
   - Above garden viewport
   - Blends with UI design

3. **Interstitial** (Full-screen)
   - After every 5 daily visits (not daily placements)
   - Skippable after 5 seconds
   - "Watch ad to generate time-lapse"

4. **Native/In-content** (Responsive)
   - In leaderboard list (every 10 entries)
   - In challenge list

**Google AdSense Strategy:**
- Auto ads enabled initially (let Google optimize)
- Manual placement once traffic data collected
- Block categories: Gambling, adult content
- Target categories: Gaming, nature, technology

**Revenue Projections:**

Assuming **$7 RPM** (mid-range) and **4 page views per session**:

| Monthly Visitors | Monthly Page Views | Est. Monthly Revenue | Annual Revenue |
|-----------------|-------------------|---------------------|----------------|
| 10,000          | 40,000            | $280                | $3,360         |
| 50,000          | 200,000           | $1,400              | $16,800        |
| 100,000         | 400,000           | $2,800              | $33,600        |
| 500,000         | 2,000,000         | $14,000             | $168,000       |

**RPM Variables:**
- Geography (US/UK/CA traffic = $10-15 RPM, global = $3-5)
- Time on site (longer = more impressions)
- Demographics (younger skews lower, 25-45 higher)
- Niche appeal (nature/gaming = mid-tier)

### Secondary: Premium Features (Future)

**Potential Premium Tier ($2.99/month):**
- Place 2 elements per day (instead of 1)
- Exclusive plant/animal types (cosmetic variants)
- Name your elements (shows on hover)
- Ad-free experience
- Private "friend gardens" (10-person collaborative gardens)
- Priority placement (loads first, slight visual glow)

**Estimated Conversion:** 2-5% of active users

At 100k MAU × 3% × $2.99 = $8,970/month additional

### Tertiary: Affiliate/Sponsorships (Future)

- Partner with nature/conservation orgs (WWF, etc.)
- Sponsored elements (e.g., "Plant a real tree" CTA)
- Eco-friendly product recommendations in sidebar
- Educational content sponsorships

---

## Viral Marketing Strategy

### Launch Strategy

**Phase 1: Soft Launch (Week 1-2)**
- Friends & family alpha test
- Iron out bugs
- Seed initial garden with balanced ecosystem
- Goal: 100 daily users

**Phase 2: Reddit Launch (Week 3)**
Target subreddits:
- r/InternetIsBeautiful (perfect fit, 17M subscribers)
- r/WebGames (5M subscribers)
- r/gaming (38M subscribers)
- r/place (nostalgia factor)
- r/casualgaming
- r/cozygames

**Post Strategy:**
- Title: "I made a collaborative garden where everyone places one plant per day"
- Include: GIF of time-lapse, link, brief description
- Timing: Tuesday-Thursday, 9-11am EST (peak engagement)
- Engage authentically in comments

**Phase 3: Social Media (Week 4+)**

**Twitter/X:**
- Daily ecosystem health report (bot)
- Highlight cool moments ("First oak tree reached 100 days!")
- Tag gaming influencers
- Use hashtags: #indiegame #webgame #collaborative

**TikTok:**
- Time-lapse videos (super satisfying)
- "POV: You check on your flower and it survived"
- Behind-the-scenes of ecosystem logic
- Duet challenges

**Instagram:**
- Beautiful screenshots
- Weekly ecosystem highlights
- "Garden of the Week" features
- Stories with polls ("What should we plant more?")

### Content Marketing

**Blog Posts / Medium:**
- "How I Built a Collaborative Ecosystem Game"
- "The Unexpected Psychology of Collective Gardening"
- "What Our Virtual Garden Taught Us About Ecology"

**YouTube:**
- Dev logs (if you're comfortable on camera)
- Monthly time-lapse compilations
- "Garden Disasters and Recoveries" highlights

### Press Outreach

**Target Publications:**
- Indie game blogs (IndieGames.com, Rock Paper Shotgun)
- Tech blogs (The Verge, Ars Technica - if viral enough)
- Design blogs (Colossal, Creative Bloq)

**Press Kit:**
- High-res screenshots
- Logo variations
- Animated GIFs
- Brief description and creator bio
- Contact info

### Organic Growth Loops

**Built-in Virality:**
1. Screenshot sharing (watermarked with URL)
2. "My tree is 50 days old!" → friends check it out
3. Reddit comments: "How is this free?"
4. TikTok audio trends using time-lapses

**User-Generated Content:**
- Encourage sharing with hashtag
- Monthly screenshot contest
- Feature best gardens on social media
- "Garden disasters" humor content

---

## Development Roadmap

### MVP (Minimum Viable Product) - 4-6 Weeks

**Goal:** Functional ecosystem with core features

**Week 1-2: Core Simulation**
- [ ] Grid system (50x50 to start)
- [ ] Tile properties (moisture, sunlight, nutrients)
- [ ] Simulation cycle logic (runs every 5 min)
- [ ] 3 plant types (tree, flower, grass)
- [ ] Basic survival rules (needs water)
- [ ] Growth stages (3 stages per plant)
- [ ] Death/decay system

**Week 3-4: Frontend**
- [ ] Canvas rendering (zoom, pan)
- [ ] Element placement UI
- [ ] Daily limit enforcement (IP-based)
- [ ] Visual feedback (valid/invalid placement)
- [ ] Basic animations (growth, death)
- [ ] Responsive design

**Week 5-6: Backend & Integration**
- [ ] AWS infrastructure setup
- [ ] Lambda functions (PlaceElement, GetState, RunSimulation)
- [ ] DynamoDB schema
- [ ] API Gateway endpoints
- [ ] WebSocket basic implementation
- [ ] CloudFront distribution

**MVP Features:**
- 3 plant types, 1 environmental element (rain cloud)
- 50x50 grid
- Daily placement limit
- Basic ecosystem rules
- Simple leaderboard (oldest plant)
- Screenshot functionality

### Version 1.1 - Post-Launch (Week 7-10)

**Add:**
- [ ] 2 more plant types
- [ ] 2 animal types (butterfly, rabbit)
- [ ] Enhanced survival rules (sunlight requirements)
- [ ] Day/night cycle (visual only)
- [ ] User accounts (optional, track contributions)
- [ ] Streak system
- [ ] Expanded leaderboards

### Version 1.5 - Growth Phase (Week 11-16)

**Add:**
- [ ] Seasons (weekly rotation)
- [ ] Community challenges
- [ ] Time-lapse generator
- [ ] Minimap
- [ ] Zone highlighting (biomes)
- [ ] More animal behaviors
- [ ] Mushrooms & decomposition
- [ ] Audio (ambient nature sounds)

### Version 2.0 - Maturity (Week 17+)

**Add:**
- [ ] Chaos elements (wildfire, drought)
- [ ] Ecosystem events
- [ ] Advanced leaderboards (caretaker rankings)
- [ ] Private friend gardens (premium)
- [ ] Mobile app (React Native wrapper)
- [ ] Expanded grid (100x100 → 200x200)
- [ ] Historical archives (past seasons)

### Ongoing Maintenance

**Weekly:**
- Monitor ecosystem health (prevent dead spirals)
- Respond to community feedback
- Balance adjustments (if one element overpowered)

**Monthly:**
- New element introduction (keeps fresh)
- Seasonal events
- Performance optimization
- Analytics review

---

## Cost Analysis

### AWS Infrastructure Costs

**Starting Out (10k visits/month, 500 DAU):**
- **CloudFront + S3**: $2-3
- **Lambda**: $5-10 (simulation is CPU-heavy)
- **DynamoDB**: $5-10 (100GB storage, low throughput)
- **API Gateway**: $3-5
- **EventBridge**: $0 (under free tier)
- **Total: $15-30/month**

**Growing (100k visits/month, 5k DAU):**
- **CloudFront + S3**: $10-15
- **Lambda**: $30-50
- **DynamoDB**: $40-60
- **API Gateway**: $20-30
- **Total: $100-155/month**

**Viral (1M visits/month, 50k DAU):**
- **CloudFront + S3**: $40-60
- **Lambda**: $150-250
- **DynamoDB**: $200-300 (high write volume)
- **API Gateway**: $100-150
- **Total: $490-760/month**

**Cost Optimization:**
- Use DynamoDB on-demand for unpredictable traffic
- Implement CloudFront caching (80%+ hit rate)
- Optimize Lambda memory allocation (test 512MB vs 1024MB)
- Use DAX for DynamoDB reads (if queries spike)
- S3 Intelligent-Tiering for snapshots

### Break-Even Analysis

**At 10k monthly visitors:**
- Revenue: ~$280/month
- Costs: ~$25/month
- **Profit: $255/month**

**At 100k monthly visitors:**
- Revenue: ~$2,800/month
- Costs: ~$130/month
- **Profit: $2,670/month** (95% margin!)

**ROI Timeline:**
- Development time: 4-6 weeks (~120 hours)
- If you value time at $50/hr: $6,000 investment
- Break-even at 100k monthly visitors: Month 3 (assuming growth)
- Strong profit at 500k+ visitors

---

## Risk Assessment

### Technical Risks

**1. Simulation Performance**
- **Risk:** 100x100 grid × 288 cycles/day = 2.8M calculations
- **Mitigation:** Optimize algorithm, only calculate active zones, use efficient data structures
- **Fallback:** Reduce cycle frequency to every 10 min

**2. Database Costs**
- **Risk:** High write volume to DynamoDB can escalate costs
- **Mitigation:** Batch writes, compress data, use DynamoDB Streams for aggregation
- **Fallback:** Consider Aurora Serverless if writes exceed budget

**3. Scalability**
- **Risk:** Viral spike crashes system
- **Mitigation:** Auto-scaling on Lambda, CloudFront caching, rate limiting
- **Fallback:** Implement queue system (SQS) for placements during spikes

### Product Risks

**1. "Death Spiral"**
- **Risk:** Entire garden dies, no recovery, users leave
- **Mitigation:** 
  - Auto-spawns if ecosystem health < 20%
  - Daily "gardener bot" places strategic elements
  - Reset seasonal zones to encourage regrowth
  - Community challenges to revive areas

**2. Griefing**
- **Risk:** Users intentionally kill ecosystem (place fires everywhere)
- **Mitigation:**
  - Limit chaos elements (unlock at high streak)
  - Rate limiting (1 per day)
  - Community voting to reverse egregious actions
  - IP ban for repeated abuse

**3. Low Retention**
- **Risk:** Users place once and never return
- **Mitigation:**
  - Email reminders (if opted in): "Your tree grew!"
  - Push notifications (PWA)
  - Make first placement "special" (guaranteed survival)
  - Implement strong onboarding

**4. Insufficient Virality**
- **Risk:** Doesn't catch on, remains niche
- **Mitigation:**
  - Shareable content built-in
  - Reddit-first strategy (proven distribution)
  - Influencer outreach
  - Iterate on feedback quickly

### Business Risks

**1. Ad Revenue Lower Than Projected**
- **Risk:** RPM is $2-3 instead of $7
- **Impact:** Need 3x traffic for same revenue
- **Mitigation:** Optimize ad placement, seek direct sponsors, introduce premium tier

**2. AdSense Rejection/Ban**
- **Risk:** Google rejects site or bans account
- **Mitigation:** Follow all policies, have backup (Media.net, Ezoic), diversify income

**3. Copycats**
- **Risk:** Idea is simple, someone clones it
- **Mitigation:** 
  - First-mover advantage (build community fast)
  - Continuous feature development
  - Strong brand identity
  - Open-source parts of it (goodwill, but keep simulation logic proprietary)

### Legal/Compliance Risks

**1. GDPR/Privacy**
- **Risk:** Storing IP addresses without consent
- **Mitigation:** 
  - Clear privacy policy
  - Cookie consent banner
  - Allow opt-out of tracking
  - Anonymize IPs after 24 hours

**2. COPPA (Children's Privacy)**
- **Risk:** Site appeals to kids under 13
- **Mitigation:** 
  - Age gate if suspected minor
  - No personal data collection
  - Parental consent mechanism
  - Consult lawyer if significant child traffic

---

## Success Stories & Inspiration

### Similar Projects That Succeeded

**r/place (Reddit):**
- 1M+ concurrent users
- Collaborative pixel canvas
- Time-limited (72 hours) created urgency
- **Lesson:** Scarcity drives engagement

**The Million Dollar Homepage:**
- Simple concept, massive viral success
- $1M revenue from pixel ads
- **Lesson:** Novelty + simplicity + shareability = viral

**Cookie Clicker:**
- Idle game with no end
- Addictive progression
- **Lesson:** Small actions + visible progress = retention

**Wikipedia:**
- Crowdsourced knowledge base
- Survived 20+ years on donations
- **Lesson:** Collaborative projects build strong communities

### What Makes The Garden Different

- **Persistent vs. Event-based:** Always evolving (not time-limited)
- **Ecological Rules:** Actions have consequences (vs. pure creativity)
- **Daily Rhythm:** Encourages habit (vs. binge sessions)
- **Wholesome Theme:** Broad appeal (nature > pixels/cookies)

---

## Next Steps

### Immediate Actions (Before Coding)

1. **Validate Interest:**
   - Create landing page with mockups
   - Post concept art on Reddit (gauge reaction)
   - Set up mailing list for launch notification

2. **Refine Scope:**
   - Confirm MVP feature list (don't overcommit)
   - Create wireframes for key screens
   - Write out ecosystem rules in detail (spreadsheet)

3. **Technical Prep:**
   - Set up AWS account and budget alerts
   - Choose frontend framework (vanilla JS or React)
   - Set up version control (GitHub private repo)

### Development Checklist

**Phase 1: Simulation Logic (2 weeks)**
- [ ] Create local Node.js simulation (no frontend yet)
- [ ] Implement grid system
- [ ] Write survival rules
- [ ] Test with scripted scenarios ("what if no one places water?")
- [ ] Ensure balance (not too easy, not impossible)

**Phase 2: Frontend (2 weeks)**
- [ ] Set up Canvas rendering
- [ ] Implement zoom/pan
- [ ] Create UI for element selection
- [ ] Add animations
- [ ] Test on mobile devices

**Phase 3: Backend Integration (2 weeks)**
- [ ] Deploy Lambda functions
- [ ] Set up DynamoDB
- [ ] Connect frontend to API
- [ ] Implement rate limiting
- [ ] Load testing

**Phase 4: Polish & Launch (1 week)**
- [ ] Add AdSense code
- [ ] Create social media assets
- [ ] Write Reddit post
- [ ] Set up analytics (Google Analytics)
- [ ] Soft launch to friends
- [ ] Public launch on Reddit

### Post-Launch Priorities

**Week 1:**
- Monitor for bugs (aggressively)
- Respond to Reddit comments
- Tweak ecosystem balance if needed
- Collect user feedback

**Week 2-4:**
- Add most-requested features
- Optimize performance based on real data
- Begin marketing on other platforms
- Analyze user behavior (where do they drop off?)

**Month 2-3:**
- Plan Version 1.1 features
- Experiment with ad placement optimization
- Build out community (Discord/subreddit?)
- Consider premium tier if traffic strong

---

## Appendix

### Ecosystem Balance Formulas

**Plant Growth Rate:**
```
growthPerCycle = baseGrowth × moistureModifier × sunlightModifier × seasonModifier

moistureModifier = (currentMoisture / 100)
sunlightModifier = (currentSunlight / 100) if needsSun, else (1 - currentSunlight / 100)
seasonModifier = 1.5 (spring), 1.0 (summer), 0.7 (autumn), 0.3 (winter)
```

**Animal Movement AI:**
```
1. Scan tiles within movement range (5 tiles)
2. Score each tile:
   - Food present: +10
   - Shelter (trees): +3
   - Crowding penalty: -2 per animal
   - Random factor: +/- 2
3. Move to highest-scoring tile
4. If no food within range for 12 cycles, die
```

**Moisture Spread:**
```
When rain cloud placed:
- Center tile: +80 moisture
- Adjacent tiles (3x3): +40 moisture
- Moisture decays at -5 per cycle (evaporation)
- Plants consume -3 moisture per growth cycle
```

### Key Metrics to Track

**User Behavior:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (engagement)
- Average session duration
- Placement completion rate (% who place after visiting)
- Return rate (within 24 hours)

**Ecosystem Health:**
- Total living elements
- Plant diversity (should be balanced)
- Animal survival rate
- Average element lifespan
- Zones with <10% coverage (dead zones)

**Revenue:**
- Page RPM
- Click-through rate (CTR)
- Fill rate (% of ad requests filled)
- Total daily revenue
- Cost per user (AWS costs / MAU)

**Growth:**
- Traffic sources (Reddit, organic, direct)
- Social shares per day
- Screenshot generation rate
- Time-lapse views
- Mailing list signups

### Resources

**Technical:**
- AWS Lambda pricing calculator: https://aws.amazon.com/lambda/pricing/
- PixiJS documentation: https://pixijs.com/
- HTML5 Canvas tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

**Design:**
- Pixel art tutorials: https://lospec.com/pixel-art-tutorials
- Color palette generator: https://coolors.co/
- Free pixel art assets: https://itch.io/game-assets/free/tag-pixel-art

**Marketing:**
- Reddit posting best practices: https://www.reddit.com/r/TheoryOfReddit/
- Google AdSense policies: https://support.google.com/adsense/

**Inspiration:**
- r/place documentation: https://www.reddit.com/r/place/
- Simulation game mechanics: https://www.gamedeveloper.com/

---

## Final Thoughts

**Why This Could Work:**

1. **Simple Core Loop:** Place one thing per day = low barrier
2. **Emotional Investment:** "My tree is 60 days old" creates attachment
3. **Collaborative Story:** Every garden tells a unique story
4. **Shareable Moments:** Time-lapses and screenshots are inherently viral
5. **Evergreen Content:** No expiration date, continues indefinitely
6. **Scalable:** Costs grow proportionally with revenue

**Critical Success Factors:**

- **Balance:** Ecosystem must be challenging but not impossible
- **Visuals:** Must be beautiful enough to screenshot and share
- **Performance:** Must load fast and run smoothly
- **Marketing:** Reddit launch is crucial for initial traction
- **Iteration:** Listen to community and adapt quickly

**The Big Question:**

Can you build something people check *every single day*? If yes, you have passive income. If no, back to the drawing board.

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Author:** Project Specification for Halley

---

## Contact & Next Steps

Ready to start building? Begin with the simulation logic. Get that working in isolation before worrying about AWS or frontend polish. 

Good luck! 🌱
