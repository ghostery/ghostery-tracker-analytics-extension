/**
 * Timestamp/Data Parsing Function
 *
 * Returns the most recent URL from a parent tab
 *
 * Insights by Ghostery
 */

const pullDataWithTimestamp = (passedData) => {
  const { timestamps, data } = passedData;
  if (timestamps.length > 0) {
    return data[timestamps[timestamps.length - 1]];
  }
  return {};
};

export default pullDataWithTimestamp;
