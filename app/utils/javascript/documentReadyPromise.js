/**
 * Document Ready in Promise Utility
 *
 * A Promise that resolves when the Ready State is Complete
 *
 * Insights by Ghostery
 */

export default function documentReadyPromise() {
  return new Promise((resolve) => { // eslint-disable-line consistent-return
    if (document.readyState === 'complete') {
      return setTimeout(resolve, 0);
    }

    document.onreadystatechange = () => { // eslint-disable-line consistent-return
      if (document.readyState === 'complete') {
        return setTimeout(resolve, 0);
      }
    };
  });
}
