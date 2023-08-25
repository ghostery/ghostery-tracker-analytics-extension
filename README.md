# Ghostery Tracker Analytics

## Disclaimer
:warning: **Tracker Analytics is no longer in development or maintenance.** :warning:

The source code is open source under the [MPLv2 License](https://github.com/ghostery/ghostery-tracker-analytics-extension/blob/main/LICENSE).

## About

Get powerful, real-time tracker analytics. Audit trackers from one entry point to improve user experience and website performance. Ghostery Tracker Analytics is a real-time intelligence tool that provides comprehensive tracker and website analysis.

With an advanced feature dashboard, Tracker Analytics allows professionals and consumers alike to see how tracking technologies impact the performance, security, privacy, and user experience of any website.

## Goals
Tracker Analytics is designed to help teams with:
* **Campaign Management:** Validate tracking scripts, ensure pages are optimized before launching your campaign and improve ROI
* **Script and Tracker Audits:** Test, troubleshoot and optimize how tags and scripts are implemented on a website
* **Forensic Tracker Analysis:** Gather intelligence and analytics about the tags and trackers on your website or others
* **Improved User Experience:** Identify privacy risks that may impact user security, page performance and violate compliance law

## Features
Our advanced feature set includes:
1) **Tracker Request List:** lists all trackers and scripts that are operating on a page, showing which tags are firing correctly and which are not - as well as revealing uninvited third-party trackers that may be slowing down a website. “Favorite” a tracker to display it at the top of your list whenever it appears on a page.
2) **Tracker Timeline:** visualizes tracker ping behavior in real-time as a page loads, providing insight into what negatively impacts page performance, why, and when. Compare against various page load events for specific insights, and toggle between logarithmic or linear displays.
3) **Tracker Distribution Graph:** evaluates and displays trackers by size and latency, a "snapshot" of trends that allows you to identify outliers at a glance.

It also includes:

4) **Page Latency & Size Graphs:** breaks down page elements to show what portion of a website’s overall size can be attributed to trackers in addition to other structural elements.
5) **Global Trends Tab:** displays global privacy statistics for trackers & sites from our web-profiling database, allowing for qualitative cross comparison of domains. Data includes prevalence of the tracker across the web, what kind of tracking it does, and what types of websites it is found on.
6) **Live/Freeze Mode:** allows you to “freeze” multiple dashboards at any point to capture and compare snapshots of tracker activity between pages.  
7) **Export Data:** captures the raw data from the Tracker Analytics dashboard and exports in `.json` format.

## Installation

#### Install Prerequisites
 - **https://github.com/creationix/nvm#installation**
 - **https://yarnpkg.com/en/docs/install**

#### Install local npm packages
```sh
$ nvm use
$ yarn install --frozen-lockfile
```

## Building
```sh
$ nvm use
$ yarn build
```
