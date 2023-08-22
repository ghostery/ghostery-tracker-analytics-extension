/**
 * Copy Text Utility
 *
 * A function that copies the argument to clipboard
 *
 * Insights by Ghostery
 */

export default function (text) {
  const dummy = document.createElement('input');
  document.body.appendChild(dummy);
  dummy.setAttribute('value', text);
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}
