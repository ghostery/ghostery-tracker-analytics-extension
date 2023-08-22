/**
 * Updatable Class
 *
 * Base class for BugDb.
 * Provides functionality to update its children classes.
 *
 * Insights by Ghostery
 */

import isFunction from 'lodash.isfunction';

import Globals from './Globals';
import Settings from './Settings';
import { getJson, fetchLocalJSONResource } from '../utils/utils';
import { log } from '../utils/common';

const { CDN_SUB_DOMAIN } = Globals;

// ToDo: Review Class more closely.
class Updatable {
  constructor(type) {
    this.type = type;
    this.db = {};
    this.just_upgraded = false;
  }

  init(just_upgraded) {
    this.just_upgraded = just_upgraded;
    return this._localFetcher()
      .then(result => this.processList(result.fromMemory, result.data, true))
      .catch((error) => {
        log('Updatable init() error', error);
      });
  }

  update(version, callback) {
    const opts = {
      remote: true,
      version,
      callback,
    };

    if (isFunction(version)) {
      opts.callback = version;
      delete opts.version;
    }

    this._loadList(opts);
  }

  _localFetcher() {
    return new Promise((resolve, reject) => {
      const memory = Settings.get(this.type);

      // nothing in storage, or it's so old it doesn't have a version
      if (!memory || !memory.hasOwnProperty('version')) {
        // return what's on disk
        log(`Fetching ${this.type} from disk...`);

        fetchLocalJSONResource(`databases/${this.type}.json`).then((data) => {
          log(`\tFetch ${this.type} from disk successful.`, data);
          resolve({
            fromMemory: false,
            data,
          });
        }).catch((error) => {
          log(`\tError fetching databases/${this.type}.json from disk.`, error);
          reject(error);
        });
      } else if (this.just_upgraded) {
        // on upgrades, see if json shipped w/ the extension is more recent
        fetchLocalJSONResource(`databases/${this.type}.json`).then((disk) => {
          if (disk.version !== memory.version) {
            log(`fetching updated${this.type} from disk`);
            resolve({
              fromMemory: false,
              data: disk,
            });
          } else {
            resolve({
              fromMemory: true,
              data: memory,
            });
          }
        }).catch((error) => {
          log(`Error fetching updated databases/${this.type}.json`, error);
          reject(error);
        });
      } else {
        // otherwise return from memory
        log(`fetching ${this.type} from memory`);
        resolve({
          fromMemory: true,
          data: memory,
        });
      }
    });
  }

  _remoteFetcher(callback) {
    log(`fetching ${this.type} from remote`);
    const UPDATE_URL = `https://${CDN_SUB_DOMAIN}.ghostery.com/update/v4/${this.type}.json`;

    getJson(UPDATE_URL).then((list) => {
      callback(true, list);
    }).catch((error) => {
      log('Updatable _remoteFetcher() error', error);
      callback(false);
    });
  }

  _loadList(options = {}) {
    log(`Updating ${this.type}. Local Version: ${this.db.version}. Server Version: ${options.version}`);

    // Check if the local version is already up to date
    if (this.db.version && options.version && (options.version === this.db.version)) {
      if (options.callback) {
        options.callback({
          success: true,
          updated: false,
        });
      }
      Settings.set(`${this.type}_last_updated`, (new Date()).getTime());

      return;
    }

    // Fetch new bugs list from remote server
    this._remoteFetcher((result, list) => {
      // if the fetch worked and we have a list returned
      if (result && list) {
        const data = this.processList(false, list);
        if (data) {
          // note: only when fetching from ghostery.com
          Settings.set(`${this.type}_last_updated`, (new Date()).getTime());
          if (options.callback) {
            options.callback({ success: true, updated: true });
          }
        } else {
          log('Updatable _loadList() error calling processList()');
          if (options.callback) {
            options.callback({ success: false, updated: false });
          }
        }
      } else if (options.callback) {
        // fetch failed
        options.callback({ success: false, updated: false });
      }
    });
  }
}

export default Updatable;
