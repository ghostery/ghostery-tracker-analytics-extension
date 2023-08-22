import { createDiv, createImg } from '../shared/utils';
import sharedStyles from '../shared/sharedStyles';
import { sendMetrics } from '../../store/messages/messageCreators';

const injectBlueBar = (blueBarDisplayState, injectionControlState) => {
  /* BLUE BAR CONTAINER */
  /* ------------------------------------------------------------------------------------- */
  const blueBarWidth = 450;
  const blueBarStyles = {
    position: 'fixed',
    top: blueBarDisplayState.top,
    left: blueBarDisplayState.left,
    'z-index': `${sharedStyles.MAX_32BIT_INT}`,
    width: `${blueBarWidth}px`,
    height: '24px',
    'background-image': 'linear-gradient(to right, #00aef0, #070e18)',
    border: '2px solid white',
    'border-radius': '7px',
    'box-shadow': '0 1px 5px #000000',
    'box-sizing': 'border-box',
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
    opacity: 0,
    transition: 'opacity .4s',
  };
  const blueBar = createDiv(blueBarStyles);
  document.body.append(blueBar);

  const removeBlueBar = () => {
    blueBar.style.opacity = 0;
    blueBar.style.transition = 'opacity .3s';
    setTimeout(() => blueBar.remove(), 300);
    // eslint-disable-next-line no-use-before-define
    window.port.onMessage.removeListener(blueBarDisplayListener);
    injectionControlState.blueBarInjected = false;
  };

  /* STATS */
  /* ------------------------------------------------------------------------------------- */
  const statsGroupStyles = {
    width: '315px',
    height: '20px',
    margin: '0 15px',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    cursor: 'grab',
  };
  const statsGroup = createDiv(statsGroupStyles);
  blueBar.append(statsGroup);

  const statTextStyles = {
    margin: '0 0 1px',
    color: 'white',
    ...sharedStyles.fontFamily,
    'font-size': '11px',
    'font-weight': 600,
    'letter-spacing': 0,
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
  };

  for (let i = 0; i < 3; i++) {
    const statNode = createDiv(statTextStyles);
    statsGroup.append(statNode);
  }

  const mapStateToNodes = () => {
    [].forEach.call(statsGroup.childNodes, (node, index) => {
      const statValue = blueBarDisplayState.statText[index];
      if (node.firstChild && node.firstChild.nodeValue === statValue) { return; }
      if (node.firstChild) {
        node.firstChild.nodeValue = statValue;
        return;
      }
      const statTextNode = document.createTextNode(statValue);
      node.appendChild(statTextNode);
    });
  };

  mapStateToNodes();

  /* BUTTONS */
  /* ------------------------------------------------------------------------------------- */
  const buttonGroupStyles = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-around',
    cursor: 'default',
  };
  const buttonGroup = createDiv(buttonGroupStyles);
  blueBar.append(buttonGroup);

  const buttonStyles = small => ({
    width: small ? '12px' : '14px',
    height: small ? '12px' : '14px',
    border: '1px solid transparent',
    'border-radius': '7px',
    'box-sizing': 'border-box',
    margin: '0 10px 0 0',
    cursor: 'pointer',
  });

  /* OPEN PANEL BUTTON */
  const openPanelButton = createImg(
    buttonStyles(),
    'dist/images/blue-bar/open-panel-icon.svg',
    'Open panel',
  );
  openPanelButton.setAttribute('data-tooltip-box-left', '298px');
  openPanelButton.setAttribute('data-tooltip-caret-left', '342px');

  openPanelButton.onclick = () => {
    window.port.postMessage({ type: 'TogglePanel' });
    window.port.postMessage({ type: 'Metrics', data: { type: 'engaged' } });
  };

  buttonGroup.append(openPanelButton);

  /* OPEN INSIGHTS APP BUTTON */
  const openAppButton = createImg(
    buttonStyles(),
    'dist/images/blue-bar/open-app-icon.svg',
    'Open Insights tab',
  );
  openAppButton.setAttribute('data-tooltip-box-left', '308px');
  openAppButton.setAttribute('data-tooltip-caret-left', '366px');

  openAppButton.onclick = () => {
    window.port.postMessage({ type: 'OpenApp' });
    window.port.postMessage({ type: 'Metrics', data: { type: 'engaged' } });
  };

  buttonGroup.append(openAppButton);

  /* OPEN TRACKER PARENTAGE BUTTON */
  const openTrackerParentageButton = createImg(
    buttonStyles(),
    'dist/images/blue-bar/open-tracker-parentage-icon.svg',
    'View Tracker Parentage',
  );
  openTrackerParentageButton.setAttribute('data-tooltip-box-left', '316px');
  openTrackerParentageButton.setAttribute('data-tooltip-caret-left', '390px');

  openTrackerParentageButton.onclick = () => {
    window.port.postMessage({ type: 'OpenApp', data: 3 });
    window.port.postMessage({ type: 'Metrics', data: { type: 'engaged' } });
    window.port.postMessage({ type: 'Metrics', data: { type: 'tracker_parentage_visit' } });
  };

  buttonGroup.append(openTrackerParentageButton);

  /* BUTTON GROUP DIVIDER */
  const buttonGroupDividerStyles = {
    width: '1px',
    height: '14px',
    margin: '0 10px 0 0',
    'background-color': 'white',
  };
  const buttonGroupDivider = createDiv(buttonGroupDividerStyles);

  buttonGroup.append(buttonGroupDivider);

  /* CLOSE BUTTON */
  const closeButton = createImg(
    buttonStyles(true),
    'dist/images/blue-bar/x-icon.svg',
    'Dismiss',
  );
  closeButton.setAttribute('data-tooltip-box-left', '394px');
  closeButton.setAttribute('data-tooltip-caret-left', '424px');

  closeButton.onclick = () => {
    removeBlueBar();
    sendMetrics({ type: 'close_blue_bar' });
  };

  buttonGroup.append(closeButton);

  /* TOOLTIP */
  const tooltipStyles = {
    position: 'absolute',
    opacity: 0,
    transition: 'opacity 0.5s',
  };
  const tooltip = createDiv(tooltipStyles);
  blueBar.append(tooltip);

  const tooltipBoxStyles = {
    position: 'absolute',
    'box-shadow': 'none',
    background: '#e0e0e0',
    'border-radius': '3px',
    margin: 0,
    padding: '8px 15px',
    width: 'auto',
    height: 'auto',
    display: 'block',
    ...sharedStyles.fontFamily,
    'font-weight': 400,
    'font-size': '12px',
    'line-height': '20px',
    'text-align': 'center',
    'text-shadow': 'none',
    color: '#4a4a4a',
    'white-space': 'nowrap',
  };
  const tooltipBox = createDiv(tooltipBoxStyles);
  const tooltipClass = `_${(Math.random() + 1).toString(36).substring(2)}`;
  tooltipBox.className = tooltipClass;
  tooltip.append(tooltipBox);

  const tooltipCaretStyles = {
    position: 'absolute',
    'border-width': '6px',
    'border-style': 'solid',
    width: 0,
    height: 0,
    display: 'block',
    content: '',
  };
  const tooltipCaret = createDiv(tooltipCaretStyles);
  tooltip.append(tooltipCaret);

  const moveTooltip = (buttonNode) => {
    if (Number(blueBarDisplayState.top.split('p')[0]) > (window.innerHeight * 0.75)) {
      tooltipBox.style.top = '-53px';
      tooltipCaret.style.top = '-17px';
      tooltipCaret.style.borderColor = '#e0e0e0 transparent transparent transparent';
    } else {
      tooltipBox.style.top = '17px';
      tooltipCaret.style.top = '5px';
      tooltipCaret.style.borderColor = 'transparent transparent #e0e0e0 transparent';
    }
    tooltipBox.style.left = buttonNode.getAttribute('data-tooltip-box-left');
    tooltipCaret.style.left = buttonNode.getAttribute('data-tooltip-caret-left');
  };

  [].forEach.call(buttonGroup.childNodes, (buttonNode) => {
    if (buttonNode.tagName === 'DIV') { return; }
    buttonNode.onmouseover = () => {
      buttonNode.style.border = '1px solid #00aef0';
      document.getElementsByClassName(tooltipClass)[0].innerHTML = buttonNode.alt;
      moveTooltip(buttonNode);
      tooltip.style.opacity = 0.95;
    };
    buttonNode.onmouseout = () => {
      buttonNode.style.border = '1px solid transparent';
      tooltip.style.opacity = 0;
    };
  });

  /* DRAG AND RESIZE HANDLERS */
  /* ------------------------------------------------------------------------------------- */
  const checkBlueBarToWindow = () => {
    if (blueBar.offsetTop > (window.innerHeight - 24)) {
      const top = `${window.innerHeight - 24}px`;
      blueBar.style.top = top;
      blueBarDisplayState.top = top;
    } else if (blueBar.offsetTop < 0) {
      blueBar.style.top = '0px';
      blueBarDisplayState.top = '0px';
    }

    if (blueBar.offsetLeft < 0 && window.innerWidth < blueBarWidth) { return; }
    if (blueBar.offsetLeft > (window.innerWidth - blueBarWidth)) {
      const left = `${window.innerWidth - blueBarWidth}px`;
      blueBar.style.left = left;
      blueBarDisplayState.left = left;
    } else if (blueBar.offsetLeft < 0) {
      blueBar.style.left = '0px';
      blueBarDisplayState.left = '0px';
    }
  };

  window.onresize = () => window.requestAnimationFrame(checkBlueBarToWindow);

  const stopDragging = () => {
    const { top, left } = blueBarDisplayState;
    window.port.postMessage({
      type: 'SetPrefs',
      data: {
        blueBarPosition: { top, left },
      },
    });

    document.onmouseup = null;
    document.onmousemove = null;
    statsGroup.style.cursor = 'grab';
  };

  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  const drag = (e) => {
    const safeEvent = e || window.event;
    safeEvent.preventDefault();

    pos1 = pos3 - safeEvent.clientX;
    pos2 = pos4 - safeEvent.clientY;
    pos3 = safeEvent.clientX;
    pos4 = safeEvent.clientY;

    if ((pos3 < 0 || pos3 > window.innerWidth) || (pos4 < 0 || pos4 > window.innerHeight)) {
      stopDragging();
    }

    const top = `${(blueBar.offsetTop - pos2)}px`;
    const left = `${(blueBar.offsetLeft - pos1)}px`;
    blueBar.style.top = top;
    blueBar.style.left = left;
    blueBarDisplayState.top = top;
    blueBarDisplayState.left = left;

    window.requestAnimationFrame(checkBlueBarToWindow);
  };

  const dragMouseDown = (e) => {
    const safeEvent = e || window.event;
    safeEvent.preventDefault();

    statsGroup.style.cursor = 'grabbing';

    pos3 = safeEvent.clientX;
    pos4 = safeEvent.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = drag;
  };

  statsGroup.onmousedown = dragMouseDown;
  buttonGroup.onmouseover = stopDragging;

  /* DISPLAY MESSAGING */
  /* ------------------------------------------------------------------------------------- */
  const blueBarDisplayListener = (message) => {
    switch (message.type) {
      case 'RequestsByTypeDelta':
      case 'timingPerformance': {
        setTimeout(mapStateToNodes, 1);
        break;
      }
      case 'Settings':
      case 'SettingsUpdated': {
        const { blueBarPosition, showBlueBar, userInfo } = message.data;
        if (blueBarPosition) {
          if (blueBarPosition === 'default') {
            blueBar.style.top = '25px';
            blueBar.style.left = `${window.innerWidth - blueBarWidth - 25}px`;
          } else {
            const { top, left } = blueBarPosition;
            if (top && left) {
              blueBar.style.top = top;
              blueBar.style.left = left;
              checkBlueBarToWindow();
            }
          }
        }
        if (typeof showBlueBar === 'boolean') {
          injectionControlState.show = showBlueBar;
          if (!showBlueBar) { removeBlueBar(); }
        }
        if (userInfo) {
          const { insightsUser } = userInfo;
          if (!insightsUser) { removeBlueBar(); }
        }
        break;
      }
      case 'UserInfo': {
        const { insightsUser } = message.data;
        if (!insightsUser) { removeBlueBar(); }
        break;
      }
      case 'InjectPanel': {
        removeBlueBar();
        break;
      }
      default:
    }
  };

  window.port.onMessage.addListener(blueBarDisplayListener);

  /* FADE IN BLUE BAR */
  /* ------------------------------------------------------------------------------------- */
  checkBlueBarToWindow();
  setTimeout(() => { blueBar.style.opacity = 1; }, 0);
  setTimeout(() => { blueBar.style.transition = 'none'; }, 450);

  injectionControlState.blueBarInjected = true;
};

export default injectBlueBar;
