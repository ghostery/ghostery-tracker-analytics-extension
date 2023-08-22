### INSIGHTS BY GHOSTERY 0.7.4 (May 13, 2021)

+ Moving subscription gating to Ghostery Plus (#252)
+ Adds support for Firefox / Ghostery Dawn (#255)
+ Fixing old lint errors and unit tests (#254)

### INSIGHTS BY GHOSTERY 0.7.3 (September 1, 2020)

+ Fixes broken product images in Chrome store listing (#245)

### INSIGHTS BY GHOSTERY 0.7.2 (August 26, 2020)

+ Address all known security vulnerabilities in dependencies. No vulnerabilities now reported by `yarn audit`
+ Add filtering, sorting, and fuzzy search controls to the Tracker List view
+ Add Page Not Scanned notification
+ Add Main Objective overlay and associated telemetry
+ Clean up Settings Panel for a more intuitive user experience
+ Update copy and legal links
+ Move Info Center product tour from the onboarding flow to the settings menu to avoid user confusion
+ Update info center product tour browser bar icon copy
+ Fix page event line length bug in the Tracker List
+ Fix Alert and Lock icon sizing

### INSIGHTS BY GHOSTERY 0.7.1 (April 15, 2020)

+ Restore metrics pings for installs and active users
+ Fix minor UI bugs

### INSIGHTS BY GHOSTERY 0.7.0 (March 18, 2020)

+ Add Tracker Parentage data visualization
+ Show refresh prompt for unscanned pages on install
+ Remove unnecessary permissions from manifest
+ Hide Blue Bar by default

### INSIGHTS BY GHOSTERY 0.6.7 (February 25, 2020)

+ Fix issues with Email Verification gating
+ Display license attributions more clearly
+ Implement clearer onboarding notifications
+ Add notification outside of panel when free trial ends
+ Remove email opt-in during account creation
+ Revamp and improve anonymized metrics

### INSIGHTS BY GHOSTERY 0.6.6 (October 3, 2019)

+ Scrape UTM parameters on install
+ Prevent duplicate metric pings
+ Fix page load time discrepancies and panel styling

### INSIGHTS BY GHOSTERY 0.6.5 (September 11, 2019)

+ Add in-app Sign In and Create Account features
+ Restrict access to Insights when users have not verified their email
+ Start free trials for users who are signed in with a verified email
+ Add detailed overlays when access to Insights is denied to the user
+ Add a loading modal that displays while the Insights panel is being injected
+ Export web page tracker data in a CSV file, in addition to previous format

### INSIGHTS BY GHOSTERY 0.6.4 (JUNE 4, 2019)

+ Shorten the description

### INSIGHTS BY GHOSTERY 0.6.3 (MAY 31, 2019)

+ Update the extension name, short name and description

### INSIGHTS BY GHOSTERY 0.6.2 (MAY 28, 2019)

+ Update the Key used by Chrome for signing builds

### INSIGHTS BY GHOSTERY 0.6.1 (MAY 22, 2019)

+ Update Submit A Bug to be an email address instead of a link to ZenDesk.

### INSIGHTS BY GHOSTERY 0.6.0 (MAY 21, 2019)

+ Add Accounts and lock features when not an Insights Subscriber.
+ Add an Info Center with a Product Tour and a Glossary.
+ Add Settings menu with BlueBar Position and Toast Alerts.
+ Optimize graph for categories that make up less than 5% of total page size.
+ Combine Page Event lines in Logarithmic mode that occur before first tracker.
+ Add toggle-panel and open-app buttons to Blue Bar.
+ Show all trackers in WhoTracksMe list.
+ Add tooltips for WhoTracksMe buttons.
+ UI Improvements for scroll bars.
+ Add Metrics.

### INSIGHTS BY GHOSTERY 0.5.2 (APRIL 11, 2019)

+ Add Page Events in the Timeline.
+ Add sort buttons to Who Tracks Me data.
+ Add Tooltips throughout application.
+ Implement Logarithmic Scale in the Timeline.
+ Add the Blue Bar on websites.
+ Live/Freeze is now synced across views.
+ Add persistent settings.
+ Graphs are expandable.
+ Add settings panel.
+ Parent tab closed messaging in App.
+ Export Page Data to JSON.
+ Favorite Trackers with persistent setting and search.
+ Code cleanup.

### INSIGHTS BY GHOSTERY 0.5.1 (APRIL 11, 2019)

+ Version 0.5.1 was had a bug where clicking the scatterplot
  Wouldn't scroll correctly to the tracker in the list.
+ Version number was skipped.

### INSIGHTS BY GHOSTERY 0.5.0 (MARCH 12, 2019)

+ Panel content-script and Insights App tab with live updating:
+ Tracker List and Tracker Timeline (Insights App only),
+ Tracker Distribution scatterplot,
+ Page Latency and Total Page Size graphs.
+ Live/Freeze modes with toggle.
+ Performance Timing with updating Browser Action text.
+ Who Tracks Me data.
+ Placeholder for Tracker Orbit.
