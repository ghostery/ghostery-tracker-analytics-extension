/**
 * String and Number Utilities for Readability
 *
 * Insights by Ghostery
 */

const truncateNum = num => Math.round(num * 100) / 100;

// NOTE: Content-Length header field is in bytes (ie. octets)
export const convertBytes = (bytes) => {
  if (bytes > 1000000000) { return `${truncateNum(bytes / 1000000000)} GB`; }
  if (bytes > 1000000) { return `${truncateNum(bytes / 1000000)} MB`; }
  if (bytes > 1000) { return `${truncateNum(bytes / 1000)} KB`; }
  return `${truncateNum(bytes)} B`;
};

export const convertMilliseconds = (ms) => {
  if (ms > 3600000) { return `${truncateNum(ms / 3600000)} hours`; }
  if (ms > 60000) { return `${truncateNum(ms / 60000)} min`; }
  if (ms > 1000) { return `${truncateNum(ms / 1000)} sec`; }
  return `${truncateNum(ms)} ms`;
};

export const truncateString = (str, maxLength = 30) => {
  const maxNotCountingEllipsis = maxLength - 3;
  if (maxNotCountingEllipsis <= 0) { return str.slice(0, maxLength); }
  if (str.length > maxLength) { return (`${str.slice(0, maxNotCountingEllipsis)}...`); }
  return str;
};
