import { createDiv, createImg, createLink } from '../shared/utils';
import sharedStyles from '../shared/sharedStyles';

const injectEndOfFreeTrialPopup = (injectionControlState) => {
  /* POPUP CONTAINER */
  const popupStyles = {
    ...sharedStyles.popup,
    width: '300px',
    height: '289px',
  };
  const popup = createDiv(popupStyles);

  // Header: Logo, X button
  const header = createDiv(sharedStyles.popupHeader);

  const headerLogoStyles = {
    ...sharedStyles.popupHeaderLogo,
    cursor: 'pointer',
  };
  const headerLogo = createImg(
    headerLogoStyles,
    'dist/images/popup/insights-logo.png',
    'Insights logo',
  );

  const headerXButton = createImg(
    sharedStyles.popupHeaderXButton,
    'dist/images/popup/x-icon-white.svg',
    'Dismiss',
  );

  header.append(headerLogo, headerXButton);
  popup.append(header);
  // end Header

  // 'Expired' icon
  const expiredIconStyles = {
    margin: '8px 0 24px',
    width: '48px',
    height: '48px',
  };
  const expiredIcon = createImg(
    expiredIconStyles,
    'dist/images/popup/expired-icon.svg',
  );

  popup.append(expiredIcon);
  // end 'Expired' icon

  // Expiration explanation
  const expirationExplanationText = 'Your Plus trial has expired.';
  const expirationExplanationStyles = {
    'padding-bottom': '23px',
    width: '227px',
    ...sharedStyles.fontFamily,
    'font-weight': '600',
    'font-size': '18px',
    'line-height': '1.5',
    'text-align': 'center',
    color: '#fff',
  };
  const expirationExplanation = createDiv(
    expirationExplanationStyles,
    expirationExplanationText,
  );

  popup.append(expirationExplanation);
  // end Expiration explanation

  // Begin Subscription button
  const beginSubscriptionButtonText = 'Donate now';
  const beginSubscriptionButtonStyles = {
    'margin-bottom': '22px',
    'background-image': 'linear-gradient(105deg, #eeeeee 2%, #fff)',
    'background-color': '#fff',
    'border-radius': '4px',
    width: '149px',
    height: '38px',
    ...sharedStyles.fontFamily,
    'font-weight': '600px',
    'font-size': '14px',
    'line-height': '38px',
    'text-align': 'center',
    color: '#2b5993',
    cursor: 'pointer',
    transition: 'background-image .2s ease, background-color .2s ease',
  };
  const beginSubscriptionButton = createDiv(
    beginSubscriptionButtonStyles,
    beginSubscriptionButtonText,
  );

  popup.append(beginSubscriptionButton);
  // end Begin Subscription button

  // Maybe Later link
  const maybeLaterLinkText = 'Maybe Later';
  const maybeLaterLinkStyles = {
    ...sharedStyles.fontFamily,
    'font-size': '14px',
    'text-decoration': 'underline',
    color: '#fff',
    cursor: 'pointer',
  };
  const maybeLaterLink = createLink(maybeLaterLinkStyles, maybeLaterLinkText);

  popup.appendChild(maybeLaterLink);
  // end Maybe Later link

  // Define event handlers
  const removePopup = () => {
    popup.remove();
    injectionControlState.popupInjected = false;
    window.port.postMessage({ type: 'MarkEndOfFreeTrialPopupAcknowledged' });
  };

  headerLogo.onclick = () => {
    removePopup();
    window.port.postMessage({ type: 'TogglePanel' });
    window.port.postMessage({ type: 'Metrics', data: { type: 'engaged' } });
  };

  headerXButton.onclick = () => removePopup();

  beginSubscriptionButton.onclick = () => {
    removePopup();
    window.port.postMessage({ type: 'BeginSubscription' });
  };

  beginSubscriptionButton.onmouseenter = (e) => {
    e.preventDefault();
    const button = e.target;
    button.style.backgroundImage = 'none';
    button.style.backgroundColor = '#c8c7c2';
  };

  beginSubscriptionButton.onmouseout = (e) => {
    e.preventDefault();
    const button = e.target;
    button.style.backgroundImage = 'linear-gradient(105deg, #eeeeee 2%, #fff)';
    button.style.backgroundColor = '#fff';
  };

  maybeLaterLink.onclick = () => removePopup();
  // End define event handlers

  injectionControlState.popupInjected = true;

  document.body.appendChild(popup);
};

export default injectEndOfFreeTrialPopup;
