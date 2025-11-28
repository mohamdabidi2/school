# Lama Dev School Management Dashboard

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connecting to the standalone backend

The frontend now communicates directly with the Express/Mongo backend. Make sure to set `NEXT_PUBLIC_BACKEND_URL` in your `.env.local` (or hosting provider) so the UI knows where to send auth and data requests:

```
NEXT_PUBLIC_BACKEND_URL=https://backend-geoxschool.onrender.com
```

When running locally you can leave the default `http://localhost:4000`. Remember to allow the frontend origin in the backend `CLIENT_ORIGIN` list so cookie-based sessions work across domains.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Lama Dev Youtube Channel](https://youtube.com/lamadev) 
- [Next.js](https://nextjs.org/learn)