/*!
 * Performance Timing
 *
 * Sends the Tab's Performance Timing in a message
 *
 * Documentation:
 *   https://developer.mozilla.org/en-US/docs/Web/API/Performance/timing
 *
 * Insights by Ghostery
 * https://www.ghostery.com/insights/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 * See https://www.ghostery.com/eula for license agreement.
 */

const UNTIL_DOCUMENT_READY_INTERVAL = 500;
let sentLast = false;

function sendTimingPerformance() {
  const { timing } = performance;

  if (document.readyState === 'complete' && !sentLast) {
    clearInterval(interval); // eslint-disable-line no-use-before-define
    sentLast = true;
    setTimeout(sendTimingPerformance, 500);
  }

  chrome.runtime.sendMessage({
    type: 'timingPerformance',
    timing: timing.toJSON(),
  });
}

// Send data every UNTIL_DOCUMENT_READY_INTERVAL ms until document readyState is complete.
const interval = setInterval(sendTimingPerformance, UNTIL_DOCUMENT_READY_INTERVAL);

// Send data as soon as the JavaScript loads.
sendTimingPerformance();
