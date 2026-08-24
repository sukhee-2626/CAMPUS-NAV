# Campus Navigator — Design Direction

## Three stylistic approaches

### Theme Name: Field Notes Atlas
Very Brief Intro: A tactile campus wayfinding tool that treats navigation like a beautifully annotated field guide: warm paper, ink-blue routes, and calm editorial typography. The interface should feel trustworthy, human, and made for first-time visitors.
Probability: 0.04

### Theme Name: Monsoon Signal
Very Brief Intro: A bold, high-contrast wayfinding dashboard inspired by rain-season road markers and transit signage: deep charcoal, safety orange, and crisp route geometry. The mood is energetic and operational.
Probability: 0.08

### Theme Name: Quiet Quadrangle
Very Brief Intro: A restrained academic navigation system with pale stone, garden green, and precise blue accents. The mood is calm, spacious, and institutional without feeling generic.
Probability: 0.02

## Selected approach: Field Notes Atlas

### Design Movement
Contemporary editorial cartography with cues from Swiss wayfinding, annotated field journals, and South Indian campus signage.

### Core Principles
1. Make the route legible before making the interface decorative.
2. Pair a tactile, paper-like surface with precise digital controls.
3. Use asymmetry and layered panels to give the map room to breathe.
4. Keep every interaction reversible, visible, and low-friction.

### Color Philosophy
The base is warm parchment rather than sterile white so the illustrated campus map feels like it belongs in the product. Ink blue carries route confidence and institutional trust; clay orange is reserved for the one action that changes the map, adding a pin. Garden green marks destinations and access points, while charcoal provides high-contrast reading structure.

### Layout Paradigm
A split field-notes layout: an editorial left rail for orientation, search, and saved pins; a large map field on the right with a small topographic context card. On mobile, the rail becomes a bottom sheet and the map remains the primary surface.

### Signature Elements
- A navy “route thread” line motif used for active directions and the current-location marker.
- Small uppercase coordinate labels and index chips, echoing printed campus directories.
- Soft paper grain and clipped-corner cards instead of a fully rounded app-shell aesthetic.

### Interaction Philosophy
Actions should feel like marking up a map: tap a destination to reveal its index card, select “Route” to draw the route thread, and use “Drop a pin” to switch the map into a deliberate placement mode. Search results and pins persist in local storage so a visitor can leave and return without losing their notes.

### Animation
Use short, physical transitions: panels slide 180–240ms on a strong ease-out, route line draws in under 300ms, and pin cards rise slightly from their map location. Avoid ornamental looping motion. Respect reduced-motion preferences and use opacity/transform only.

### Typography System
Use Fraunces for editorial display moments and labels that should feel human; use DM Sans for controls, metadata, and longer reading. Display headings are compact and high-contrast. UI labels are sentence case with occasional 0.12em uppercase eyebrow text.

### Brand Essence
A calm, open-source wayfinding companion for students, visitors, and campus teams who need the right building without second-guessing the route.
Personality adjectives: observant, generous, grounded.

### Brand Voice
Headlines are short and directional. CTAs sound like clear field instructions, not marketing copy. Microcopy reassures users about what will happen next.

Example lines:
- “Find the room. Follow the blue thread.”
- “Drop a pin where the campus needs a note.”

### Wordmark & Logo
A compact compass-pin mark: a blue location pin whose inner cutout forms a four-point compass star. The mark should work alone at favicon scale and sit beside the “Campus Navigator” wordmark in the header.

### Signature Brand Color
Ink Blue — #164A7B. It is strong enough to carry routes and navigation controls, but more editorial and campus-specific than a default bright map blue.

## Reference decisions

- The supplied illustrated campus map is the primary campus layer and must remain visibly recognizable.
- The supplied Google Maps route context informs the surrounding-road layer between Sri Krishna Arts and Science College and SKCET.
- The Google Maps context indicates an approximately 800 m walking route via Krishna College Rd, around 11 minutes, with a private/restricted-road caveat. The app will present this as context copy and an external Google Maps handoff rather than pretending the static campus map is GPS-accurate.
- Because this is a static frontend project, custom pins persist in browser local storage. The base campus destinations are curated from the supplied map reference.
