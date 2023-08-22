/**
 * BugDb Class
 *
 * Wraps the Bugs Database File
 *
 * Insights by Ghostery
 */

import Updatable from './Updatable';
import Settings from './Settings';
import { flushChromeMemoryCache } from '../utils/utils';
import { log, fuzzySearch } from '../utils/common';

// ToDo: See if I eliminated too much.
class BugDb extends Updatable {
  processList(fromMemory, bugs, skip_cache_flush) {
    log('BugDb is processing a new list of trackers...');
    // deep cloning bugs all at once is too slow
    const { patterns } = bugs;
    const regexes = patterns.regex;
    const db = {
      apps: bugs.apps,
      bugs: bugs.bugs,
      firstPartyExceptions: bugs.firstPartyExceptions,
      patterns: {
        host: patterns.host,
        host_path: patterns.host_path,
        path: patterns.path,
        regex: {}, // regexes are initialized below
      },
      version: bugs.version,
    };
    const old_bugs = Settings.get('bugs');

    for (const id in regexes) {
      if (regexes.hasOwnProperty(id)) {
        db.patterns.regex[id] = new RegExp(regexes[id], 'i');
      }
    }

    this.db = db;

    // no need to save to storage unless what we have is newer,
    // or we never saved to storage before
    if (!old_bugs || !old_bugs.hasOwnProperty('version') || bugs.version > old_bugs.version) {
      Settings.set('bugs', bugs);
    }

    if (!skip_cache_flush) {
      flushChromeMemoryCache();
    }

    // return true for _loadList() callback
    return true;
  }

  getTrackerName(trackerId) {
    if (!trackerId) { return false; }

    const { name } = this.db.apps[trackerId];
    if (!name) { return false; }

    return name;
  }

  getTrackerCategory(trackerId) {
    if (!trackerId) { return false; }

    const { cat } = this.db.apps[trackerId];
    if (!cat) { return false; }

    return cat;
  }

  searchTrackerName(query) {
    if (query === '') {
      return [];
    }

    const bugs = Object.entries(this.db.apps).map(([key, app]) => ({
      key,
      name: app.name,
    }));

    return fuzzySearch(query, bugs, ['name'], { threshold: 0.4 });
  }
}

// return the class as a singleton
export default new BugDb('bugs');
