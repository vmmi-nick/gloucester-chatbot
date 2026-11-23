# Gloucester County Constituent Chatbot

Bilingual (English/Spanish) constituent chatbot for Gloucester County, NJ,
duplicating the North Bergen and Parsippany chatbot architecture.

## Status: NOT DEPLOYED

Local build only, completed November 22, 2026. Nothing has been pushed to
GitHub or Render. Deployment is the next gate and needs Nick's separate
go-ahead, the same as Parsippany. Local test results are in TEST-RESULTS.md.

- Index-first: answers come from a verified local topic index
  (`data/index.json`, 42 topics: 36 county topics and 6 municipal route-out
  topics, 230 English phrases and 224 Spanish phrases) and a verified
  commissioner meeting schedule (`data/meetings.json`, 25 meetings in 2026,
  the exact posted dates rather than a generic pattern).
- Backup: questions the index does not cover go to the Meta Model API only
  when `MODEL_API_KEY` is set, instructed to answer only from the approved
  trusted sources (`data/trusted-sources.json`) and otherwise return the
  Gloucester County main number fallback verbatim.
- Emergencies get a 911 redirect. No personal information is collected.
- Answer style: one direct sentence first, then supporting details, then
  phone numbers / addresses / links in a Contact block at the end.
- Voice: Tap & Talk dictation (English and Spanish, live interim text,
  plain-language error feedback, works inside the Report an issue wizard)
  and Listen read-aloud on every answer and on the prepared report summary,
  with ranked modern-voice selection at rate 1.08, the same build as the
  other three bots.
- Report an issue is prepare-mode only. Gloucester County has no GovPilot.
  The wizard organizes the resident's summary, shows the correct county
  department number, and states plainly that the assistant does not send
  or save the report and that the report is only filed once the resident
  contacts the county.

## County versus municipal routing

Gloucester County has 24 municipalities. These are municipal services, and
the bot routes them out to the resident's town instead of inventing a
county answer, with no town phone numbers invented: garbage and recycling
pickup, local police non-emergency, municipal court, property tax payment,
local zoning and construction permits, and local roads and streetlights.
County answers cover county roads and bridges, parks, veterans, seniors,
health, elections, County Clerk, Surrogate, Sheriff, social services,
public works, the animal shelter and the county library system.

## Design

Gloucester County's own colors, sampled from the rendered
gloucestercountynj.gov site on November 22, 2026: navy `#00274D` / `#004382`
with green accent `#196B3A` and a dark blue footer `#002A52`. Layout mirrors
the North Bergen and Parsippany front end (slim top bar, hero, topic cards,
"Try asking" chips, sticky mobile composer, Report an issue wizard).

## Run locally

```
npm install
node server.js
# http://localhost:3000, health check at /health
```

## Deploy (Render): NOT DONE, needs Nick's go-ahead

Blueprint in `render.yaml` (one Starter web service, `gloucester-chatbot`).
Set `MODEL_API_KEY` in the Render dashboard Environment tab. Never commit it.
Deployment under Nick's accounts (GitHub `vmmi-nick`, new repo
`gloucester-chatbot`) comes only after Nick's separate word.

## Verified basics (checked 2026-11-22 on gloucestercountynj.gov)

- County Administration Building: 2 South Broad Street, PO Box 337,
  Woodbury, NJ 08096, main 856-853-3200. County seat Woodbury.
- Board of Commissioners 2026: Frank J. DiMarco, Director; Jim Jefferson,
  Deputy Director; Tom Bianco, Nicholas DeSilvio, Joann Gattinelli,
  Christopher Konawel Jr., Matt Weng.
- Row officers: County Clerk James N. Hogan 856-853-3237; Surrogate
  Giuseppe Chila 856-853-3282; Sheriff Carmel M. Morina 856-384-4600.
  Clerk of the Board Laurie J. Burns 856-853-3271.
- Commissioner meetings: Court Room 201, County Courthouse, 1 North Broad
  Street, Woodbury, 6:00 PM on the posted 2026 dates, with the November 24
  meeting at 5:00 PM and the December 29 Close Out at 12 noon.

## Trusted sources

Tier 1: gloucestercountynj.gov for county government, plus gcls.org for
the Gloucester County Library System, library only, following the same
pattern the Parsippany bot uses for its library domain. Tier 3: NJ state
(nj.gov, nj.gov/mvc, njcourts.gov). Tier 4: federal, refer out only
(usa.gov, ssa.gov, medicare.gov, va.gov, travel.state.gov). NOT approved:
Atlantic City Electric and PSE&G (utilities are not sources for this bot).

## Open items for production (not build blockers)

- Nick's go-ahead to deploy to GitHub and Render
- Nick's prototype testing
- County Clerk sign-off contact
- Site-admin embed paste on gloucestercountynj.gov
- Possible transfer to county-owned hosting / AI accounts
