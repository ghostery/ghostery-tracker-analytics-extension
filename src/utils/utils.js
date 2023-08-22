/**
 * Utilities
 *
 * Methods and properties that are used ONLY by src modules.
 *
 * Insights by Ghostery
 */

import debounce from 'lodash.debounce';

import Url from 'url';
import { log } from './common';

export function isValidTopLevelNavigation(details) {
  const {
    url,
    tabId,
    frameId,
  } = details;

  return frameId === 0
    && tabId > 0
    && url.startsWith('http')
    && !url.startsWith('https://chrome.google.com/webstore/');
}

export function isValidUrl(url) {
  if (url.protocol.startsWith('http')
    && url.host.includes('.')
    && /[A-Za-z]/.test(url.host)
    && !url.path.includes('_/chrome/newtab')) {
    return true;
  }

  return false;
}

export function processUrl(src) {
  const {
    protocol,
    hostname,
    pathname,
    host,
    hash,
  } = src ? Url.parse(src) : {};

  return {
    protocol: protocol ? protocol.substr(0, protocol.length - 1) : '',
    host: hostname || '',
    path: pathname ? pathname.substr(1) : '',
    hostWithPath: (host || '') + (pathname || ''),
    anchor: hash ? hash.substr(1) : '',
  };
}

/**
 * Process URLs and returns the query string as an object.
 * @memberOf BackgroundUtils
 * @param  {string} src   the source url
 * @return {Object}       contains parts of parsed query as its properties
 */
export function processUrlQuery(src) {
  if (!src) {
    return {};
  }

  try {
    const res = {};
    for (const [key, value] of new URL(src).searchParams.entries()) {
      res[key] = value;
    }
    return res;
  } catch (e) {
    return {};
  }
}

export function getQueryParam(src, param) {
  const { search } = new URL(src);
  const queryParams = new URLSearchParams(search);
  return queryParams.get(param);
}

// ToDo: Review these functions more closely.
function _fetchJson(method, url, query, extraHeaders, referrer = 'no-referrer', credentials = 'omit') {
  if (typeof fetch === 'function') {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    // if (extraHeaders) {
    //   for (const [key, value] of objectEntries(extraHeaders)) {
    //     headers.append(key, value);
    //   }
    // }
    const options = {
      method,
      headers,
      body: query,
      referrerPolicy: referrer,
      credentials,
    };
    if (method === 'GET' || method === 'HEAD') {
      // Edge fails to construct Request object for GET and HEAD methods when body is present
      delete options.body;
    }

    const request = new Request(url, options);
    return fetch(request).then((response) => {
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        return Promise.reject(new Error(`Failed to fetch ${url} with status ${response.status} (${response.statusText})`));
      }
      // check for 204 status (No Content) from CMP
      if (response.status === 204) {
        return false; // send back false to signal no new campaigns
      }
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      if (contentType && contentType.includes('text/html')) {
        return response.text();
      }
      return response.text();
    }).then((data) => {
      // GET /api/Sync/ returns json with content-type:text/html. go figure.
      if (typeof data === 'string' && data.includes('{')) {
        try {
          log('_fetchJson resolved', (data) ? JSON.parse(data) : {});
          // attempt to parse the response.text as json
          return (data) ? JSON.parse(data) : {};
        } catch (err) {
          log('_fetchJson error', err);
          return Promise.reject(new Error(err));
        }
      } else {
        // data is either false or actual application/json
        return data;
      }
    }).catch((err) => {
      log(`_fetchJson Error: ${err}`);
      return Promise.reject(new Error(err));
    });
  }
  return new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      // This is called even on 404 etc, so check the status.
      if (xhr.status >= 200 && xhr.status < 400) {
        // check for 204 status (No Content) from CMP
        if (xhr.status === 204) {
          resolve(false); // send back false to signal no new campaigns
        } else if (xhr.responseText.includes('{')) {
          // For saveUserSettings we only get back a string that cannot be parsed
          try {
            log('_fetchJson resolved', (xhr.responseText) ? JSON.parse(xhr.responseText) : {});
            // Resolve the promise with the response text
            resolve((xhr.responseText) ? JSON.parse(xhr.responseText) : {});
          } catch (err) {
            log('_fetchJson error', err);
            reject(new Error(err));
          }
        } else {
          resolve(xhr.responseText);
        }
      } else {
        // Otherwise reject with the status text
        log('_fetchJson error', xhr.statusText);
        reject(new Error(xhr.statusText));
      }
    };

    // Handle network errors
    xhr.onerror = (error) => {
      log('_fetchJson network error', error);
      reject(new Error(error));
    };

    // Make the request
    log('_fetchJson request', method, url, query, extraHeaders);
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    // if (extraHeaders) {
    //   for (const [key, value] of objectEntries(extraHeaders)) {
    //     xhr.setRequestHeader(key, value);
    //   }
    // }
    xhr.overrideMimeType('application/json');
    xhr.send(query);
  }));
}

export function getJson(url, extraHeaders) {
  return _fetchJson('GET', url, null, extraHeaders).catch((error) => {
    log('getJson error', error);
    return Promise.reject(error);
  });
}

export function fetchLocalJSONResource(url) {
  if (typeof fetch === 'function') {
    return fetch(url).then((response) => {
      if (!response.ok) {
        return Promise.reject(new Error(`Failed to fetchLocalJSONResource ${url} with status ${response.status} (${response.statusText})`));
      }
      return response.json();
    }).catch((err) => {
      log(`fetchLocalJSONResource error: ${err}`);
      return Promise.reject(new Error(err));
    });
  }
  return new Promise(((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      // This is called even on 404 etc, so check the status.
      if (xhr.status >= 200 && xhr.status < 400) {
        try {
          resolve((xhr.responseText) ? JSON.parse(xhr.responseText) : {});
        } catch (err) {
          log('fetchLocalJSONResource error', err);
          reject(new Error(err));
        }
      } else {
        // Otherwise reject with the status text
        log('fetchLocalJSONResource error', xhr.statusText);
        reject(new Error(xhr.statusText));
      }
    };

    // Handle network errors
    xhr.onerror = (error) => {
      log('fetchLocalJSONResource network error', error);
      reject(new Error(error));
    };

    // Make the request
    log('fetchLocalJSONResource request', url);
    xhr.open('GET', url, true);
    xhr.overrideMimeType('image/png');
    xhr.send();
  }));
}

export function defineLazyProperty(obj, prop, callback) {
  let value;
  let isSet = false;

  Object.defineProperty(obj, prop, {
    get() {
      if (!isSet) {
        value = callback();
        isSet = true;
      }
      return value;
    },
    set(val) {
      value = val;
      isSet = true;
    },
  });
}

export const flushChromeMemoryCache = debounce(() => {
  chrome.webRequest.handlerBehaviorChanged();
}, 1000 * 35, true);
