# UI Beautification Prompt for AgentOps Replay

## Your Task
You are a senior UI/UX designer tasked with creating a beautiful, modern, and professional interface for AgentOps Replay - a universal logging and audit system for AI agents. The current UI is functional but basic. Transform it into a polished, production-ready interface that would impress both technical users and business executives.

## Product Context
AgentOps Replay is the "black box recorder" for AI agents. It logs every action an AI takes, enables replay of sessions, and validates results. Think of it like DataDog or New Relic, but specifically for AI agent observability. Our demo shows financial analysis, but the system works for ANY AI workflow.

**Important Demo Constraints:**
- This is a single-user demo instance (no authentication needed)
- Upload functionality should work live in the demo
- Data is stored temporarily in filesystem (no database)
- Sessions persist only during the demo session
- Focus on showing the core value quickly

## Current UI Structure (Needs Beautification)

### 1. Landing Page (`/`)
- Currently: Auto-redirects to `/sessions`
- **Needed**: Professional landing with:
  - Hero section with tagline: "Universal AI Agent Observability"
  - Live demo button
  - Feature grid (Logging, Replay, Validation, Compliance)
  - Quick start CTA

### 2. Sessions Dashboard (`/sessions`)
- Currently: Basic list of session cards
- **Needed**: Executive dashboard with:
  - Stats header (Total Sessions, Success Rate, Avg Duration, Compliance Score)
  - Search/filter bar
  - Session cards with better visual hierarchy
  - Status indicators with colors (green=success, yellow=validation failed, red=error)
  - Quick actions (View, Replay, Export)

### 3. Session Detail View (`/sessions/[id]`)
- Currently: Split view with timeline and inspector
- **Needed**: Professional analysis interface with:
  - Breadcrumb navigation
  - Session metadata header with key metrics
  - Interactive timeline with visual flow
  - Event cards with clear icons and status
  - Code-style inspector with syntax highlighting
  - Floating action bar (Replay, Export, Share)

## New Features to Add (After Improvements)

### 4. CSV Upload Modal (New)
**Design Requirements:**
- Drag-and-drop zone with dashed border
- File preview table showing first 5 rows
- Validation indicators (file size, format, columns)
- "Analyze" button with loading state
- Sample file selector dropdown

### 5. Company Selector (New)
**Design Requirements:**
- Searchable dropdown with company logos
- Pre-loaded options: Tesla, Microsoft, Apple, Amazon, Meta
- Shows ticker symbol and last analysis date
- "Upload Custom" option

### 6. Comparison View (New)
**Design Requirements:**
- Side-by-side session comparison
- Synchronized scrolling
- Difference highlighting (yellow for discrepancies)
- Metrics comparison table
- Export comparison report button

### 7. Compliance Dashboard (New)
**Design Requirements:**
- Compliance score gauge (0-100%)
- Checklist of compliance criteria
- Audit trail timeline
- Export for regulatory filing button
- Historical compliance trends chart

## Design System Requirements

### Colors
```css
/* Primary Palette */
--primary-blue: #2563EB    /* Main CTAs, links */
--primary-green: #10B981   /* Success states */
--primary-yellow: #F59E0B  /* Warnings, validation failures */
--primary-red: #EF4444     /* Errors */
--primary-purple: #8B5CF6  /* AI/Agent indicators */

/* Neutral Palette */
--gray-50: #F9FAFB         /* Backgrounds */
--gray-100: #F3F4F6        /* Cards */
--gray-200: #E5E7EB        /* Borders */
--gray-500: #6B7280        /* Secondary text */
--gray-900: #111827        /* Primary text */
```

### Typography
- **Headings**: Inter or SF Pro Display
- **Body**: Inter or SF Pro Text
- **Code**: JetBrains Mono or SF Mono

### Components Style Guide

#### Cards
- White background with subtle shadow
- 8px border radius
- Hover: slight elevation increase
- Active: subtle border highlight

#### Buttons
- Primary: Blue with white text
- Secondary: White with gray border
- Danger: Red for destructive actions
- All buttons: 6px border radius, subtle shadow

#### Status Badges
- Pill-shaped with icon
- Color-coded backgrounds
- Small but readable text

#### Timeline Events
- Connected by subtle line
- Icons for each event type:
  - 🚀 Start
  - 📄 Parse
  - 🤖 LLM Call
  - ✓ Validation
  - 📊 Output
  - ❌ Error

### Animations
- Subtle fade-ins for page loads
- Smooth transitions for state changes
- Loading skeletons for data fetching
- Progress bars for long operations
- Pulse animation for replay in progress

## Special UI Requirements

### 1. **Demo Mode Banner**
When in demo mode, show a subtle banner:
"🎯 Demo Mode - Using sample data. Upload your own CSV to analyze real data."

### 2. **Validation Failure Highlight**
When validation fails (which is good - it catches errors):
- Don't make it look like an error
- Use yellow/amber to indicate "attention needed"
- Include tooltip: "Validation caught a discrepancy - this is the system working correctly!"

### 3. **Replay Animation**
During replay:
- Show progress bar at top
- Highlight currently replaying event
- Subtle pulse on timeline
- "Live" indicator badge

### 4. **Compliance Score Display**
- Circular progress indicator
- Green (90-100%), Yellow (70-89%), Red (<70%)
- Breakdown on hover showing individual criteria

## Mobile Responsiveness
- Dashboard cards stack vertically on mobile
- Timeline becomes vertical scroll
- Inspector appears as modal/drawer
- Maintain all functionality on tablets

## Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactions
- Screen reader friendly labels
- High contrast mode support
- Focus indicators on all interactive elements

## Performance Considerations
- Virtual scrolling for long event lists
- Lazy load session details
- Optimistic UI updates
- Code splitting for routes

## Inspiration References
- **DataDog**: Clean data visualization and monitoring
- **Vercel Dashboard**: Modern, minimal aesthetic
- **Linear**: Excellent keyboard navigation and speed
- **Stripe Dashboard**: Professional financial interface
- **Retool**: Good handling of complex data tables

## Key User Flows to Optimize

### Flow 1: First-Time User
1. Lands on homepage → Sees clear value prop
2. Clicks "Try Demo" → Runs sample analysis
3. Views session timeline → Understands logging
4. Clicks replay → Sees deterministic replay
5. Prompted to upload own data

### Flow 2: Returning Analyst
1. Dashboard → Quick stats overview
2. Search for specific session
3. Compare two sessions
4. Export audit report
5. Share with compliance team

### Flow 3: Compliance Officer
1. Compliance dashboard → Overall health
2. Filter by date range
3. View detailed audit trail
4. Export for regulatory filing
5. Schedule automated reports

## Deliverables Expected

1. **Updated CSS/Tailwind classes** for all existing components
2. **New component designs** for upload, comparison, compliance features
3. **Consistent design system** applied throughout
4. **Loading and error states** for all operations
5. **Responsive layouts** for mobile/tablet
6. **Animation specifications** for interactions
7. **Icon set** for event types and actions

## Success Criteria
The UI should:
- Look professional enough for enterprise customers
- Be intuitive for non-technical users
- Maintain clarity when displaying complex data
- Feel fast and responsive
- Build trust through polish and attention to detail

## Technical Constraints
- Next.js 14 App Router
- Tailwind CSS for styling
- TypeScript for type safety
- No additional UI libraries unless absolutely necessary
- Must maintain existing functionality

## Final Note
Remember: This is infrastructure for AI observability. The UI should convey trust, precision, and professional-grade tooling. Think "enterprise SaaS" not "hackathon project." The judges should immediately see this as a production-ready product that companies would pay for.