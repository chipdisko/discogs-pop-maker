# Discogs Pop Maker

A Next.js application that fetches and displays information from Discogs URLs using the disconnect library.

## Features

- Parse Discogs URLs (release, master, artist, label)
- Fetch detailed information via Discogs API
- Display release information including:
  - Artist and title
  - Year, label, format
  - Genres and styles
  - Tracklist
  - Cover images
- Loading states and error handling
- Debug logging in console

## Setup

1. Clone the repository and install dependencies:
```bash
cd discogs-pop-maker
npm install
```

2. Get a Discogs API token:
   - Go to https://www.discogs.com/settings/developers
   - Generate a personal access token

3. Create a `.env.local` file in the root directory:
```env
DISCOGS_API_TOKEN=your_token_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Usage

1. Enter a Discogs URL in the input field
2. Click "Fetch" to retrieve the information
3. View the formatted release data

### Supported URL formats:
- Release: `https://www.discogs.com/release/12345`
- Master: `https://www.discogs.com/master/12345`
- Artist: `https://www.discogs.com/artist/12345`
- Label: `https://www.discogs.com/label/12345`

## Project Structure

```
discogs-pop-maker/
├── app/
│   ├── api/
│   │   └── discogs/
│   │       └── route.ts      # API endpoint for Discogs
│   ├── components/
│   │   ├── DiscogsUrlInput.tsx  # URL input component
│   │   └── ReleaseDisplay.tsx   # Display component
│   └── page.tsx              # Main page
├── lib/
│   └── discogs.ts           # URL parsing utilities
└── .env.local               # Environment variables
```

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- disconnect (Discogs API client)

## Development

The application uses console.log for debugging. Check the browser console and terminal for debug information during development.
