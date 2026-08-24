# Revision checklist

- [x] Replace all incorrect Krishna Adithya branding with Sri Krishna Arts and Science College.
- [x] Add browser Geolocation API support without requiring a paid map API key.
- [x] Add a “Use my GPS” action that identifies the nearest curated block or campus landmark.
- [x] Add a database-backed “Mark here & save” action for the current GPS location.
- [x] Show GPS permission/loading/error states clearly and accessibly.
- [x] Re-run TypeScript/build checks and capture a responsive QA screenshot.
- [x] Review public sources; treat block markers as approximate campus points unless Google publishes exact block listings.
- [x] Add labeled Google Maps points for A, B, C, D, E, F, H, J, and N Blocks, Management Block, Parking, and Canteen, with approximate labeling where needed.
- [x] Verify the requested marker labels and point legend in the road-layer view; save a new checkpoint.
- [x] Upgrade the static app to full-stack database and user support.
- [x] Add a live GPS recording mode with permission, accuracy, and error states.
- [x] Add “Mark here” and “Save to database” controls for walking-based field recording.
- [x] Add database-backed loading and deletion for recorded campus points.
- [x] Verify the mobile recording controls and database/auth flow in code and tests; save a new checkpoint.

- [x] Remove guessed fixed road-layer block markers.
- [x] Add full-map click-to-drop survey mode with exact clicked latitude/longitude.
- [x] Add label selection/input for A, B, C, D, E, F, H, J, N, Management Block, Parking, and Canteen.
- [x] Save clicked survey points to the authenticated database and list them as verified points.
- [x] Test the survey map and save a new checkpoint.

- [x] Match the reference map with a visible current-location crosshair control.
- [x] Allow precise live-map click placement with a visible selected-pin marker.
- [x] Keep route context visible while surveying and preserve exact database save behavior.
- [x] Re-run checks and save a new checkpoint for the reference-style map revision.

- [x] Add a dedicated Pin in road context action.
- [x] Show detailed selected road-pin coordinates before database save.
- [x] Preserve the campus survey mode and verify the road pin flow.

- [x] Clarify that the yellow illustrated area is the full campus overview.
- [x] Label road context as the high-definition live survey map for exact user pins.
- [x] Update survey copy and controls to distinguish overview mode from road pin mode.

- [x] Provide a usable fallback click surface and automated coverage for road pin placement when the live map provider is unavailable in preview.

- [x] Use the supplied full-campus map context as the survey overview.
- [x] Include Sri Krishna Hall, residence area, Administrative Block/SKCET, institute buildings, playgrounds, and SIDCO–Sugunapuram Road in the visible context copy.
- [x] Verify full-campus presentation and save a new checkpoint.

- [x] Animate current-location crosshair and selected survey pin.
- [x] Add restrained route-thread and survey-panel transitions.
- [x] Respect reduced-motion preferences and verify the animated map build.

- [x] Add/update the repository README with setup, GPS, database, and map-survey instructions.
- [x] Remove unwanted “Made with” wording from the app footer and repository copy.
- [x] Verify GitHub authentication and target repository; direct push returned a GitHub 403 permission error.
- [x] Provide the complete source as a clean ZIP for manual upload because direct GitHub push was blocked by credential permissions.

- [x] Create a clean source ZIP excluding dependencies, build output, logs, and secrets.
- [x] Verify the ZIP contains the README and complete project source.

- [ ] Include the supplied campus map and supporting visual assets in a new GitHub-ready ZIP.
- [ ] Verify the image-inclusive ZIP contains the source README and image files without secrets or dependencies.
