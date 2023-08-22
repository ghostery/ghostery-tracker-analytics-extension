/**
 * Download Functions
 *
 * Functions for parsing data to prepare it for download
 * Functions downloading files to the user's local machine
 *
 * Insights by Ghostery
 */

import cloneDeep from 'lodash.clonedeep';
import stringify from 'csv-stringify';

import categoryMapping from './stringMaps';

import pullDataWithTimestamp from './timestampDataParse';
import { convertBytes, convertMilliseconds } from './convert';

export const parseAllDataForDownload = (passedSettings, webPageData) => {
  const { bugs, ...immutableSettings } = passedSettings;
  const settings = cloneDeep(immutableSettings);
  settings.bugsDbVersion = bugs.version;

  const { timestampsParsedUrl } = webPageData;
  const { host } = pullDataWithTimestamp(timestampsParsedUrl);

  return ({ data: { settings, webPageData }, parentTabHostName: host });
};

export const downloadFilesWithTimestamp = (data, parentTabHostName) => {
  // Create readable timestamp
  const dateObject = new Date();
  const dateStr = dateObject.toDateString().slice(4);
  const hours = dateObject.getHours();
  const min = dateObject.getMinutes();
  const sec = dateObject.getSeconds();
  const muricaHours = (function muricafy() {
    if (hours === 0 || hours === 12) { return 12; }
    return hours > 11 ? hours - 12 : hours;
  }());
  const amOrPm = hours > 11 ? 'PM' : 'AM';
  const addPadding = timeUnits => `${timeUnits < 10 ? 0 : ''}${timeUnits}`;
  const timeStr = `${addPadding(muricaHours)}.${addPadding(min)}.${addPadding(sec)} ${amOrPm}`;

  // Export JSON file of all page data and settings information
  const jsonString = JSON.stringify(data, null, 2);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);

  chrome.downloads.download({
    url: jsonUrl,
    filename: `raw data and settings_${parentTabHostName}_${dateStr}_${timeStr}.json`,
  });

  // Export CSV file of all page tracker data
  const { requestsByTracker } = data.webPageData;
  const trackerList = [];

  if (Object.keys(requestsByTracker).length) {
    Object.keys(requestsByTracker).forEach((trackerId) => {
      const tracker = requestsByTracker[trackerId];
      trackerList.push({
        Name: tracker.name,
        Category: categoryMapping[tracker.category],
        Requests: tracker.count.toString(),
        Size: convertBytes(tracker.size),
        Latency: convertMilliseconds(tracker.latency),
        'Favorite (Y/N)': data.settings.starredTrackerIds[trackerId] ? 'Y' : 'N',
      });
    });
  } else {
    trackerList.push({ Name: 'No trackers found' });
  }

  const downloadCsv = (csvString) => {
    const csvContent = `data:text/csv;charset=utf-8,${csvString}`;
    const csvUrl = encodeURI(csvContent);

    chrome.downloads.download({
      url: csvUrl,
      filename: `tracker list_${parentTabHostName}_${dateStr}_${timeStr}.csv`,
    });
  };

  stringify(
    trackerList,
    {
      header: true,
      columns: ['Name', 'Category', 'Requests', 'Size', 'Latency', 'Favorite (Y/N)'],
    },
    (err, output) => downloadCsv(output),
  );
};
