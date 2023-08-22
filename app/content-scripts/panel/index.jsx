/*!
 * Panel UI
 *
 * React UI for extension injected panel
 *
 * Insights by Ghostery
 * https://www.ghostery.com/insights/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 * See https://www.ghostery.com/eula for license agreement.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ShadowDOM from 'react-shadow';
import { Provider } from 'react-redux';

import App from './App';
import createStore from '../../store/createStore';
import documentReady from '../../utils/javascript/documentReadyPromise';

const store = createStore();

const ShadowApp = () => (
  <ShadowDOM include={[chrome.extension.getURL('dist/panel/styles.css')]}>
    <div className="InsightsShadowHostElement">
      <div id="insights-content">
        <Provider store={store}>
          <App />
        </Provider>
      </div>
    </div>
  </ShadowDOM>
);

const sendMessageOnClassChange = (insightsNode) => {
  const checkForClassChange = (mutation, observer) => {
    const { type, attributeName, target } = mutation;

    if (type === 'attributes' && attributeName === 'class'
    && target.className === 'InsightsShadowHostElement resolved') {
      if (!window.port) { window.port = chrome.runtime.connect({ name: 'window' }); }
      window.port.postMessage({ type: 'PanelStylesLoaded' });
      observer.disconnect();
      return true;
    }
    return false;
  };


  const observer = new MutationObserver((mutations) => {
    mutations.some(mutation => checkForClassChange(mutation, observer));
  });

  observer.observe(insightsNode, { attributes: true, subtree: true });
};

const injectPanel = () => {
  // Create the node that you will render the Shadow DOM inside of
  const insights = document.createElement('div');
  const height = '296px';
  insights.id = 'ghostery-insights';
  insights.style.position = 'fixed';
  insights.style.bottom = '0';
  insights.style.left = '0';
  insights.style.height = height;
  insights.style.width = '100vw';
  insights.style.zIndex = '2147483647';
  insights.style.transition = 'opacity .3s';

  // Inject styling into the head of the document that will keep the panel
  // invisible until the Shadow DOM library passes the .resolved class
  // to the host element
  const hostElementStyleString = '.InsightsShadowHostElement { height: 100%; width: 100%; opacity: 0; transition: opacity .3s; } .InsightsShadowHostElement.resolved { opacity: 1; }';
  const styleWrapper = document.createElement('div');
  styleWrapper.innerHTML = `<style>${hostElementStyleString}</style>`;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(styleWrapper);

  ReactDOM.render(<ShadowApp />, insights);

  document.body.style.marginBottom = height;
  document.body.appendChild(insights);

  sendMessageOnClassChange(insights);
};

documentReady().then(() => {
  if (!document.getElementById('ghostery-insights')) { injectPanel(); }
});
