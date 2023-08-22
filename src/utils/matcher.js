/**
 * Matcher
 *
 * Checks if a URL is a bug by comparing it to the BugDb
 *
 * Insights by Ghostery
 */

import BugDb from '../classes/BugDb';
import { processUrl } from './utils';

/**
 * Determine if the path part of a URL matches to the path property of a
 * node in an array of json nodes with paths.
 */
function matchesHostPath(roots, src_path) {
  let root;
  let paths;

  for (let i = 0; i < roots.length; i++) {
    root = roots[i];
    if (root.hasOwnProperty('$')) {
      paths = root.$;
      for (let j = 0; j < paths.length; j++) {
        if (src_path.startsWith(paths[j].path)) {
          return paths[j].id;
        }
      }
    }
  }

  return false;
}

/**
 * Use host and path parts of a URL to traverse database tire node looking
 * for matching parts. Reaching the leaf would yeild the bug id.
 *
 * Used for Classification 1 and 2:
 *  1. Check Host Hash
 *  2. Check Host+Path Hash
 */
function matchesHost(root, src_host, src_path) {
  const host_rev_arr = src_host.split('.').reverse();
  const nodes_with_paths = [];
  let host_part;
  let node = root;
  let bug_id = false;

  for (let i = 0; i < host_rev_arr.length; i++) {
    host_part = host_rev_arr[i];
    // if node has domain, advance and try to update bug_id
    if (node.hasOwnProperty(host_part)) {
      // advance node
      node = node[host_part];
      bug_id = (node.hasOwnProperty('$') ? node.$ : bug_id);

      // we store all traversed nodes that contained paths in case the final
      // node does not have the matching path
      if (src_path !== undefined && node.hasOwnProperty('$')) {
        nodes_with_paths.push(node);
      }

      // else return bug_id if it was found
    } else {
      // handle path
      if (src_path !== undefined) {
        return matchesHostPath(nodes_with_paths, src_path);
      }

      return bug_id;
    }
  }

  // handle path
  if (src_path !== undefined) {
    return matchesHostPath(nodes_with_paths, src_path);
  }

  return bug_id;
}


/**
 * Finds whether the URL matches a regex.
 * Can still produce false positives:
 *  (eg. regex that matches a tracker is found in the URL)
 *
 * Used for Classification 4:
 *  4. Check RegEx Patterns
 */
function matchesRegex(src) {
  const regexes = BugDb.db.patterns.regex;

  for (const bug_id in regexes) {
    if (regexes[bug_id].test(src)) {
      return +bug_id;
    }
  }

  return false;
}

/**
 * Match the path part of a URL against the path property of database patterns.
 *
 * Used for Classification 3:
 *  3. Check the Path Hash
 */
function matchesPath(src_path) {
  const paths = BugDb.db.patterns.path;

  // NOTE: we re-add the "/" in order to match patterns that include "/"
  const srcPath = `/${src_path}`;

  for (const path in paths) {
    if (srcPath.includes(path)) {
      return paths[path];
    }
  }

  return false;
}

/**
 * Function to check whether a URL is a bug.
 * Needs to be super fast.
 */
export function getTrackerId(src) {
  const { db } = BugDb;
  const processedSrc = processUrl(src.toLowerCase());
  let found = false;

  found = matchesHost(db.patterns.host_path, processedSrc.host, processedSrc.path)
    || matchesHost(db.patterns.host, processedSrc.host)
    || matchesPath(processedSrc.path)
    || matchesRegex(processedSrc.hostWithPath);

  if (!found || !db.bugs.hasOwnProperty(found)) {
    return false;
  }

  return db.bugs[found].aid;
}

// ToDo: Remove when we have another function export from this file.
export function test() {}
