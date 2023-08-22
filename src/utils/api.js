/**
 * User Account API
 *
 * This file is taken from the Account-Web project with minimal changes.
 * This file will change in sync with the source project, leave unchaged if possible.
 *
 * Insights by Ghostery
 */

import 'whatwg-fetch';

import Globals from '../classes/Globals';

const {
  GHOSTERY_DOMAIN,
  AUTH_SERVER,
  ACCOUNT_SERVER,
  ACCOUNT_SERVER_VERSION,
} = Globals;

const Config = {
  domain: `${GHOSTERY_DOMAIN}.com`,
  auth_server: {
    host: AUTH_SERVER,
  },
  account_server: {
    host: ACCOUNT_SERVER,
  },
};

const { domain } = Config;
// TODO make this not global vars
let isRefreshing = false;
const tokenRefreshedEventType = 'tokenRefreshed';

const _getJSONAPIErrorsObject = e => ([{ title: 'Something went wrong.', detail: e.toString() }]);

export const _refreshToken = function () { // eslint-disable-line func-names
  if (isRefreshing) {
    let bindedResolve;
    const _processRefreshTokenEvent = (resolve, e) => {
      window.removeEventListener(tokenRefreshedEventType, bindedResolve, false);
      resolve(e.detail);
    };
    return new Promise((resolve) => {
      bindedResolve = _processRefreshTokenEvent.bind(null, resolve);
      window.addEventListener(tokenRefreshedEventType, bindedResolve, false);
    });
  }

  isRefreshing = true;
  return fetch(`${Config.auth_server.host}/api/v2/refresh_token`, { // eslint-disable-line no-undef
    method: 'POST',
    credentials: 'include',
  });
};

const _getCookie = details => (
  new Promise((resolve, reject) => {
    chrome.cookies.get(details, (cookie) => {
      if (cookie) {
        return resolve(cookie);
      }
      return reject({ // eslint-disable-line prefer-promise-reject-errors
        errors: [
          { code: '10021' },
        ],
      });
    });
  })
);

const _sendReq = (method, path, body) => (
  _getCookie({
    url: `https://${domain}`,
    name: 'csrf_token',
  }).then(cookie => (
    fetch(`${Config.account_server.host}${path}`, { // eslint-disable-line no-undef
      method,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body)),
        'X-CSRF-Token': cookie.value,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })
  ))
);

const _processResponse = res => (
  new Promise((resolve, reject) => {
    const { status } = res;
    if (status === 204) {
      resolve();
      return;
    }
    if (!res.headers.get('Content-Type').includes('json')) {
      resolve(res);
      return;
    }
    res.json().then((data) => {
      if (status >= 400) {
        reject(data);
      } else {
        resolve(data);
      }
    });
  })
);

const _sendAuthenticatedRequest = (method, path, body) => (
  new Promise((resolve, reject) => {
    _sendReq(method, path, body)
      .then(_processResponse)
      .then((data) => {
        resolve(data);
      })
      .catch((data) => {
        if (!data || !data.errors) {
          reject((data && data.errors) || _getJSONAPIErrorsObject(data));
          return;
        }
        let shouldRefresh = false;
        data.errors.forEach((e) => {
          if (e.code === '10021' || e.code === '10022') { // token is expired or missing
            shouldRefresh = true;
          }
        });
        if (shouldRefresh) {
          _refreshToken()
            .then((res) => {
              isRefreshing = false;
              window.dispatchEvent(new CustomEvent(tokenRefreshedEventType, {
                detail: res,
              }));
              const { status } = res;
              if (status >= 400) {
                res.json().then((data2) => {
                  reject(data2.errors);
                }).catch((err) => {
                  reject(_getJSONAPIErrorsObject(err));
                });
                return;
              }
              _sendReq(method, path, body)
                .then(_processResponse)
                .then((data3) => {
                  resolve(data3);
                })
                .catch((err) => {
                  reject(_getJSONAPIErrorsObject(err));
                });
            });
        } else {
          reject(data.errors || _getJSONAPIErrorsObject(data));
        }
      });
  })
);

export const get = function (type, id = '', include = '') { // eslint-disable-line func-names
  // if (!id) { return Promise.reject(new Error('id is missing')); }
  return _sendAuthenticatedRequest('GET', `/api/${ACCOUNT_SERVER_VERSION}/${type}${id ? `/${id}` : ''}${include ? `?include=${include}` : ''}`);
};

export const save = function (type, data) { // eslint-disable-line func-names
  return _sendAuthenticatedRequest('POST', `/api/${ACCOUNT_SERVER_VERSION}/${type}`, { data });
};

export const update = function (type, id, data) { // eslint-disable-line func-names
  // TODO check for data.id and fail
  return _sendAuthenticatedRequest('PATCH', `/api/${ACCOUNT_SERVER_VERSION}/${type}/${id}`, { data });
};

export const remove = function (type, id) { // eslint-disable-line func-names
  return _sendAuthenticatedRequest('DELETE', `/api/${ACCOUNT_SERVER_VERSION}/${type}/${id}`);
};
