/**
 * Common Methods
 *
 * Methods used in both /src and /apps
 *
 * Insights by Ghostery
 */

import Fuse from 'fuse.js';
import Globals from '../classes/Globals';

export function log(...args) {
  if (!Globals.LOG) { return; }

  args.unshift(`${(new Date()).toLocaleTimeString()}\t`);
  const error = /error/gi.test(args.toString());
  if (error) {
    console.error(...args); // eslint-disable-line no-console
  } else {
    console.log(...args); // eslint-disable-line no-console
  }
}

// TODO revise function description
// Determines the fuzzy search match value between
// a query string and a set of pattern strings
// params:
//  query: (required) string
//  patterns: (required) object array
//  keys: (required) string array. the key(s) in the patterns array objects to match against
//  options: (optional) object. Two options are supported:
//    isCaseSensitive: Boolean; default: false
//    threshold: Number between 0.0 and 1.0. 0.0 will include only perfect matches; 1.0 will match anything. default: 1.0
// returns: an array of { "pattern": [pattern String], "score": [Number between 0 and 1] }, sorted by score,
// and including all or a subset of the patterns depending on threshold value
export function fuzzySearch(query, patterns, keys, options = {}) {
  const fuseOptions = {
    keys,
    isCaseSensitive: options.isCaseSensitive || false,
    threshold: options.threshold || 0.2,
  };

  const isPatternsAnArray = Array.isArray(patterns);
  let patternsArray;
  if (isPatternsAnArray) {
    patternsArray = patterns;
  } else {
    patternsArray = Object.entries(patterns).map(([key, value]) => ({
      ...value,
      __fuzzySearchKey: key,
    }));
  }

  const fuse = new Fuse(patternsArray, fuseOptions);
  const fuseResults = fuse.search(query);
  const results = fuseResults.map(fuseResult => (
    fuseResult.item
  ));

  if (isPatternsAnArray) {
    return results;
  }

  const resultsObject = {};
  results.forEach((result) => {
    const key = result.__fuzzySearchKey;
    delete result.__fuzzySearchKey;
    resultsObject[key] = result;
  });
  return resultsObject;
}

// ToDo: Remove when we have another function export from this file.
export function test() {}
