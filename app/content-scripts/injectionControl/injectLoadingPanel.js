import { assignStyles, createDiv, createImg } from '../shared/utils';
import sharedStyles from '../shared/sharedStyles';

const injectLoadingPanel = () => {
  /* LOADING PANEL ROOT & REMOVAL LISTENER FUNCTION */
  /* ------------------------------------------------------------------------------------- */
  const loadingPanelStyles = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    'z-index': `${sharedStyles.MAX_32BIT_INT}`,
    width: '100vw',
    height: '296px',
    'background-image': 'linear-gradient(to bottom right, rgba(0, 0, 0, .96), rgba(47, 116, 146, .96))',
    display: 'flex',
    'justify-content': 'center',
    opacity: 0,
    transition: 'opacity .4s',
  };

  const loadingPanel = createDiv(loadingPanelStyles);
  document.body.append(loadingPanel);

  const removeLoadingPanel = () => {
    loadingPanel.style.opacity = 0;
    loadingPanel.style.transition = 'opacity .3s';
    setTimeout(() => loadingPanel.remove(), 300);
  };

  const loadingPanelListener = (message) => {
    if (message.type === 'PanelStylesLoaded' || message.type === 'RemovePanel') {
      removeLoadingPanel();
      window.port.onMessage.removeListener(loadingPanelListener);
    }
  };

  window.port.onMessage.addListener(loadingPanelListener);

  const loadingPanelOverlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    'background-color': '#000',
    display: 'flex',
    opacity: 0.9,
    transition: 'opacity .4s',
  };

  const loadingPanelOverlay = createDiv(loadingPanelOverlayStyles);
  loadingPanel.append(loadingPanelOverlay);

  /* CONTENT CONTAINER, BRAND LOGO, AND CLOSE BUTTON */
  /* ------------------------------------------------------------------------------------- */
  const contentContainerStyles = {
    position: 'relative',
    width: '985px',
    height: '296px',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
  };

  const contentContainer = createDiv(contentContainerStyles);
  loadingPanel.append(contentContainer);

  const brandLogoWrapperStyles = {
    position: 'absolute',
    top: '12px',
    left: 0,
  };

  const brandLogoWrapper = document.createElement('a');
  brandLogoWrapper.href = 'https://www.ghostery.com/products/';
  brandLogoWrapper.target = '_blank';
  brandLogoWrapper.ref = 'noopener noreferrer';
  assignStyles(brandLogoWrapper, brandLogoWrapperStyles);
  contentContainer.appendChild(brandLogoWrapper);

  const brandLogoStyles = {
    width: '98px',
    height: '24px',
  };

  const brandLogo = createImg(
    brandLogoStyles,
    'dist/images/logo-icons/insights-white-text-beta.svg',
    'Insights By Ghostery Icon',
  );
  brandLogoWrapper.append(brandLogo);

  const closeButtonStyles = {
    position: 'absolute',
    top: '12px',
    right: 0,
    width: '15px',
    height: '16px',
    cursor: 'pointer',
  };

  const closeButton = createImg(
    closeButtonStyles,
    'dist/images/loading-panel/x-icon-white.svg',
    'Close Panel',
  );
  contentContainer.append(closeButton);

  closeButton.onclick = () => window.port.postMessage({ type: 'TogglePanel' });

  /* LOADING ANIMATION AND CAPTION */
  /* ------------------------------------------------------------------------------------- */
  const loadingAnimationAndTextWrapperStyles = {
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    'align-items': 'center',
  };

  const loadingAnimationAndTextWrapper = createDiv(loadingAnimationAndTextWrapperStyles);
  contentContainer.append(loadingAnimationAndTextWrapper);

  const loadingAnimationStyles = {
    position: 'relative',
    width: '110px',
    height: '110px',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
  };

  const loadingAnimation = createDiv(loadingAnimationStyles);
  loadingAnimationAndTextWrapper.append(loadingAnimation);

  const loadingCircleStyles = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '110px',
    height: '110px',
  };

  const loadingCircle = createImg(
    loadingCircleStyles,
    'dist/images/loading-panel/loading-circle.svg',
    'Loading Circle',
  );
  loadingAnimation.append(loadingCircle);

  // NOTE: the animate() method is only supported by Chrome, Firefox, and Opera
  loadingCircle.animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
    { duration: 800, iterations: Infinity },
  );

  const insightsGhostyStyles = {
    width: '47px',
    height: '51px',
  };

  const insightsGhosty = createImg(
    insightsGhostyStyles,
    'dist/images/loading-panel/insights-ghosty.svg',
    'Insights Ghosty',
  );
  loadingAnimation.append(insightsGhosty);

  const loadingTextStyles = {
    margin: '20px 0 0',
    padding: '0',
    color: 'white',
    ...sharedStyles.fontFamily,
    'font-size': '18px',
    'font-weight': 600,
    'letter-spacing': 0,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
  };

  const loadingText = createDiv(loadingTextStyles);
  const textNode = document.createTextNode('Loading Insights...');
  loadingText.append(textNode);
  loadingAnimationAndTextWrapper.append(loadingText);

  setTimeout(() => { loadingPanel.style.opacity = 1; }, 0);
};

export default injectLoadingPanel;
