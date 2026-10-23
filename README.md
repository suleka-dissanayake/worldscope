# WorldScope – Global Country Intelligence Dashboard

A responsive multi-page React app to explore countries, view development
indicators, compare countries and save personal preferences.

## Setup

```bash
npm install
npm run dev      # open the URL shown in the terminal (usually http://localhost:5173)
npm run build    # production build
```

## APIs used

| API | Used for | Link |
| --- | --- | --- |
| World Bank API v2 – country list | Names, codes, regions, capitals, income level | https://api.worldbank.org/v2/country?format=json |
| World Bank API v2 – `SP.POP.TOTL` | Population of every country | https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json |
| World Bank API v2 – `AG.LND.TOTL.K2` | Land area (km²) | https://api.worldbank.org/v2/ |
| World Bank API v2 – `NY.GDP.MKTP.CD`, `NY.GDP.PCAP.CD`, `SP.DYN.LE00.IN`, `IT.NET.USER.ZS` | GDP, GDP per capita, life expectancy, internet use | https://api.worldbank.org/v2/ |
| flagcdn.com | Flag images (built from the 2-letter country code) | https://flagcdn.com |
| REST Countries (optional) | Languages, currencies and borders only. If it is down, the app shows "Unavailable" | https://restcountries.com |

The World Bank group rows (World, Euro area, etc.) are removed so only real countries appear.

## Features

- **Dashboard** – country count, world population, regions, most populated country
- **Explore** – search, region filter, sorting (name/population/area), grid/list view, loading/error/empty states
- **Country details** (`/country/LKA`) – flag, facts, World Bank indicators with years, links to neighbours
- **Compare** – 2–4 countries, table with highest/lowest marks, 3 bar charts, missing data shown as "Unavailable"
- **Settings** – controlled form, validation, saved in localStorage, confirmed reset; preferences applied on Dashboard and Explore
- **404 page**, light/dark theme, responsive navigation, labelled form controls

## Project structure

```
src/
  components/   Navbar, Loader, ErrorMessage, StatCard, CountryCard, BarChart
  pages/        Dashboard, Explore, CountryDetails, Compare, Settings, NotFound
  services/     countryApi.js, worldBankApi.js, format.js
  App.jsx       routes + shared state (countries, settings, theme)
  main.jsx      entry point with BrowserRouter
```

## Key decisions (for the demo)

- The country list (3 World Bank requests joined together) is fetched once in `App` and passed to pages as props.
- `useEffect` cleanup with an `ignore` flag prevents stale API results when the user changes routes quickly.
- Missing World Bank values are `null` and shown as "Unavailable", never `0`.
- Charts are built with plain CSS so no extra library is needed.

## AI-use declaration

Parts of this project were generated with the help of an AI assistant (Claude).
I reviewed the code, tested it, and can explain how each part works.
