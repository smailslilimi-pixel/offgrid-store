# OFFGRID storefront

A Next.js, React and Tailwind CSS clothing storefront with a mannequin fitting room, wishlist, cart and checkout review. Product photography and the mannequin were generated for the sample catalog.

## Run locally

1. Install Node.js 22 or 24 and npm.
2. Unzip the source and open a terminal in `offgrid`.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`. Leave `IMAGE_API_KEY` blank for transparent-layer previews.
5. Run `npm run dev`, then open [localhost:3000](http://localhost:3000).
6. Run `npm run build` and `npm start` to check the production build locally.

## Rebrand

Edit `data/store.json`. Set the brand name, accent and background colors, currency, logo path, hero headline and photo, and mannequin path. Add or remove products in the array. The array order is the default Newest order. Each product needs a unique URL-safe ID, price, category, numeric rating, slot, photo, and transparent cutout. Add `oldPrice` to identify a sale item. Put images in `public/products/` and use URLs beginning with `/products/`. Use PNG, JPEG or WebP for model references. Use a transparent PNG or WebP for cutouts.

Slots are `top`, `outer`, `bottom`, `shoes`, and `hat`. A new item replaces only its own slot. Layer previews draw the outer garment above the top. Use optional `fit` CSS values (such as `{"top":"20%","width":"30cqh","height":"31%"}`) to align a new cutout with the mannequin. AI previews are styling illustrations and do not predict size or fit.

## Enable AI outfit previews

1. Set the server-only `IMAGE_API_KEY` to an OpenAI API key with access to the Images API. Keep it outside source control.
2. Set `IMAGE_MODEL` to a compatible GPT Image model if you need to override the default.
3. Set `OUTFIT_CACHE_DIR` to a writable path. The route canonicalizes slots and hashes the source images, product metadata, prompt and model. It deduplicates concurrent requests within a running process and writes successful renders atomically. Unavailable model results fall back to layered cutouts.
4. On a public deployment, configure endpoint-specific rate limits at your reverse proxy and set provider spending limits. Requests can trigger provider charges on cache misses.

## Deploy

1. Select a host that runs a persistent Node.js process. Use one app replica with a mounted durable volume for consistent caching across restarts.
2. Upload this directory or connect its Git repository. Configure the host to install with `npm install`, build with `npm run build`, and start with `npm start`. Use the host-provided `PORT`.
3. Set the variables from `.env.example` in the hosting dashboard. Point `OUTFIT_CACHE_DIR` at the mounted volume. Serve the application over HTTPS and allow up to 120 seconds for the image endpoint.
4. Test the full workflow on desktop and mobile. Try a top, add the jacket, swap the top, remove the jacket, add the full outfit to your cart, change quantities, and review checkout. With AI enabled, repeat an outfit and confirm the cached image is used.
5. For horizontal scaling, replace the filesystem cache and process-local request deduplication with shared durable storage and a distributed claim before enabling multiple replicas.

Checkout validates contact and shipping fields for review. It does not submit orders, save personal details, or collect payments. Before accepting orders, connect a payment provider, calculate authoritative prices, tax and shipping server-side, and use verified payment webhooks to persist orders and start fulfillment.

## Source map

- `app/` — storefront entry, global styling, checkout and image API
- `components/` — catalog, fitting room and local cart/wishlist persistence
- `data/store.json` — product catalog and branding
- `public/products/` — product imagery, cutouts, mannequin and hero artwork

## GitHub Pages

Push this directory to a GitHub repository on the `main` branch. In Settings → Pages, set Source to GitHub Actions and run the deployment workflow. The Pages build uses transparent cutouts for the fitting room. Use the Node.js deployment above to enable AI rendering.
