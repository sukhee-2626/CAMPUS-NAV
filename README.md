# Campus Navigator

Campus Navigator is an open-source field-survey map for **Sri Krishna Arts and Science College**. It combines an illustrated campus overview with a road-context map so campus teams can record exact locations while walking the site.

## What it includes

The app provides a full campus overview, searchable destinations, manual campus pins, browser GPS detection, a current-location crosshair, and a road survey mode. In road survey mode, select **Pin road point**, click the exact location on the live map or the supplied full-campus reference surface, choose a label such as A Block, B Block, C Block, D Block, E Block, F Block, H Block, J Block, N Block, Management Block, Parking, or Canteen, add details, and save the coordinates.

Field-recorded points are stored in the database for the signed-in user. The app uses the browser Geolocation API and does not require a paid GPS SDK. Google Maps is used for road context when the provider is available; the reference-map fallback remains usable when map tiles are unavailable in a preview environment.

## Local development

```bash
pnpm install
pnpm dev
```

Run the quality checks with:

```bash
pnpm run check
pnpm run test
pnpm run build
```

## Database setup

This is a React, Vite, Express, tRPC, Drizzle, and MySQL/TiDB application. Set `DATABASE_URL` and the built-in authentication environment variables through the project environment manager. Apply the Drizzle schema using the managed migration workflow. The recorded location table is `recorded_campus_points` and stores the label, latitude, longitude, accuracy when available, notes, owner, and creation time.

## Field-survey workflow

Open the app on a phone, sign in, switch to **Road context**, and choose **Pin road point** or **Survey map**. Walk to the location, use **Mark here** for device GPS or click the exact location on the map, review the coordinate details, select the campus label, add a note such as the entrance or floor, and choose **Save exact point**. Saved records appear in the personal points list with a **Verified survey** badge.

## Codespaces and GitHub

The repository can be opened in GitHub Codespaces after the project is pushed to GitHub. In a Codespace, run `pnpm install` and `pnpm dev`; configure the database and authentication secrets using the Codespaces secret manager or the project environment manager. Do not commit `.env` files, API keys, OAuth secrets, or database credentials.

## License

This project is prepared for open-source collaboration. Add the repository’s preferred license before public redistribution.
