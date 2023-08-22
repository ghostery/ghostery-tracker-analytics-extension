import { createDiv, createImg, createSpan } from './shared/utils';
import sharedStyles from './shared/sharedStyles';

const injectReloadPopup = () => {
  /* POPUP CONTAINER */
  const reloadPopupStyles = {
    ...sharedStyles.popup,
    width: '600px',
    height: '150px',
  };
  const reloadPopup = createDiv(reloadPopupStyles);

  // Header: Logo, X button
  const header = createDiv(sharedStyles.popupHeader);

  const headerLogo = createImg(
    sharedStyles.popupHeaderLogo,
    'dist/images/popup/insights-logo.png',
    'Insights logo',
  );

  const headerXButton = createImg(
    sharedStyles.popupHeaderXButton,
    'dist/images/popup/x-icon-white.svg',
    'Dismiss',
  );

  header.append(headerLogo, headerXButton);
  reloadPopup.append(header);
  // end Header

  // Main area
  const mainSectionStyles = {
    'padding-top': '25px',
    display: 'flex',
    'align-items': 'center',
  };
  const mainSection = createDiv(mainSectionStyles);

  // Reload icon
  const reloadIconStyles = {
    'box-sizing': 'content-box',
    'padding-right': '30px',
    width: '41px',
    height: '41px',
  };
  const reloadIcon = createImg(
    reloadIconStyles,
    'dist/images/popup/reload-icon.svg',
  );
  // End reload icon

  // Reload instructions
  const reloadInstructionsLinkText = 'Reload the page';
  const reloadInstructionsRemainingText = ' to see Ghostery Insights at work!';
  const reloadInstructionsStyles = {
    ...sharedStyles.fontFamily,
    'font-size': '18px',
    'line-height': '1.5',
    'text-align': 'center',
    color: '#fff',
  };
  const reloadInstructionsLinkStyles = {
    ...reloadInstructionsStyles,
    'text-decoration': 'underline',
    cursor: 'pointer',
  };

  const reloadInstructionsLink = createSpan(
    reloadInstructionsLinkStyles,
    reloadInstructionsLinkText,
  );

  const reloadInstructionsRemainder = createSpan(
    reloadInstructionsStyles,
    reloadInstructionsRemainingText,
  );

  const reloadInstructions = createDiv();
  reloadInstructions.append(
    reloadInstructionsLink,
    reloadInstructionsRemainder,
  );
  // end Reload instructions

  mainSection.append(reloadIcon, reloadInstructions);
  reloadPopup.append(mainSection);
  // end Main section

  // Add event and message handlers
  const removeReloadPopup = () => reloadPopup.remove();

  const insertReloadPopup = () => {
    removeReloadPopup();
    document.body.append(reloadPopup);
  };

  headerXButton.onclick = () => removeReloadPopup();

  reloadInstructionsLink.onclick = () => {
    removeReloadPopup();
    chrome.runtime.sendMessage({ type: 'reloadTab' });
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'RepopReloadPopup') insertReloadPopup();
  });
  // end Add event and message handlers

  insertReloadPopup();
};

if (document.fonts) {
  document.fonts.ready.then(() => injectReloadPopup());
} else {
  injectReloadPopup();
}
