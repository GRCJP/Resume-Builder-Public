# JSearch API Setup (OpenWeb Ninja)

## Overview
The application now uses **OpenWeb Ninja's JSearch API** instead of RapidAPI for job searches.

## Setup Instructions

### 1. Get Your OpenWeb Ninja API Key
1. Visit [OpenWeb Ninja](https://www.openwebninja.com/)
2. Sign up or log in to your account
3. Navigate to the JSearch API product
4. Copy your API key from the dashboard

### 2. Add API Key to Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# OpenWeb Ninja JSearch API Key
OPENWEB_JSEARCH_KEY=your_actual_api_key_here
```

**Important:** 
- Remove the old `JSEARCH_RAPIDAPI_KEY` variable if it exists
- Make sure `.env.local` is in your `.gitignore` (it should be by default)

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Integration

#### Option A: Direct API Test
Open your browser and navigate to:
```
http://localhost:3000/api/jsearch?query=cybersecurity%20remote&page=1&country=us
```

You should see a JSON response with job listings.

#### Option B: Terminal Test
```bash
curl "http://localhost:3000/api/jsearch?query=cybersecurity%20remote&page=1&country=us" | jq '.'
```

### Expected Response

Successful response will look like:
```json
{
  "data": [
    {
      "job_id": "...",
      "job_title": "Cybersecurity Engineer",
      "employer_name": "Company Name",
      "job_city": "Remote",
      "job_country": "US",
      "job_apply_link": "https://...",
      ...
    }
  ],
  "status": "OK"
}
```

### Troubleshooting

#### Error: "JSearch key missing"
- Verify `OPENWEB_JSEARCH_KEY` is set in `.env.local`
- Restart your development server after adding the key

#### Error: "JSearch API authentication failed"
- Verify your API key is correct (no extra spaces)
- Check that your OpenWeb Ninja subscription is active
- Verify you have credits/quota remaining

#### Error: "JSearch API fetch failed"
- Check your internet connection
- Verify OpenWeb Ninja's API is not experiencing downtime
- Check the console logs for more details

## API Changes Made

### What Changed:
1. **Base URL**: Changed from `jsearch.p.rapidapi.com` to `api.openwebninja.com/v1/jsearch`
2. **Authentication Header**: Changed from `X-RapidAPI-Key` to `X-API-Key`
3. **Removed**: `X-RapidAPI-Host` header (not needed for OpenWeb Ninja)
4. **Environment Variable**: Renamed from `JSEARCH_RAPIDAPI_KEY` to `OPENWEB_JSEARCH_KEY`

### What Stayed the Same:
- Response format (still returns `data` array)
- Query parameters (query, page, num_pages, country)
- Integration with the rest of the pipeline
- No changes needed to `jsearchAPI.ts` or other files

## File Changes

### Modified Files:
- `app/api/jsearch/route.ts` - Updated to use OpenWeb Ninja
- `.env.example` - Added `OPENWEB_JSEARCH_KEY`
- `JSEARCH_SETUP.md` - This documentation file

### No Changes Needed:
- `lib/jsearchAPI.ts` - Calls the API route, format unchanged
- `lib/cleanPipeline.ts` - Uses jsearchAPI.ts
- `lib/jobBoardIntegrations.ts` - Uses jsearchAPI.ts

## Testing Checklist

- [ ] Added `OPENWEB_JSEARCH_KEY` to `.env.local`
- [ ] Restarted development server
- [ ] Tested API endpoint directly: `http://localhost:3000/api/jsearch?query=test`
- [ ] Verified jobs are returned in response
- [ ] Ran "Force Rescan" in UI to test full pipeline
- [ ] Confirmed JSearch jobs appear in results

## Support

If you continue to have issues:
1. Check OpenWeb Ninja's [API documentation](https://www.openwebninja.com/docs)
2. Verify your subscription status in the OpenWeb Ninja dashboard
3. Check console logs for detailed error messages
4. Ensure you have sufficient API credits/quota
