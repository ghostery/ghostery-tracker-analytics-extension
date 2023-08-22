import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';

import AccessDeniedOverlay from '../AccessDeniedOverlay';

describe('app/shared-componenets/AccessDeniedOverlay/', () => {
  describe('Snapshot tests with shallow render', () => {
    test('AccessDeniedOverlay component should render with state: Not Signed In', () => {
      global.chrome = chrome;
      const AccessDeniedOverlayProps = {
        maxWidth: '500',
        userInfo: {
          signedIn: true,
          insightsUser: false,
          email: 'test@gmail.com',
          emailVerified: false,
          freeTrial: false,
          freeTrialTriggered: false,
        },
        messageCreators: {
          login: () => {},
          logout: () => {},
          subscribe: () => {},
          sendEmailVerification: () => {},
          sendMetrics: () => {},
        },
        emailVerificationSent: true,
        isPageNotScanned: false,
      };

      const component = shallow(<AccessDeniedOverlay {...AccessDeniedOverlayProps} />);

      expect(component).toMatchSnapshot();
    });
  });

  test('AccessDeniedOverlay component should render with state: FREE_TRIAL_EXPIRED', () => {
    global.chrome = chrome;
    const AccessDeniedOverlayProps = {
      maxWidth: '500',
      userInfo: {
        signedIn: true,
        insightsUser: false,
        email: 'test@gmail.com',
        emailVerified: true,
        freeTrial: false,
        freeTrialTriggered: true,
      },
      messageCreators: {
        login: () => {},
        logout: () => {},
        subscribe: () => {},
        sendEmailVerification: () => {},
        sendMetrics: () => {},
      },
      emailVerificationSent: true,
      isPageNotScanned: false,
    };

    const component = shallow(<AccessDeniedOverlay {...AccessDeniedOverlayProps} />);

    expect(component.find('div.AccessDeniedOverlay__button').length).toBe(1);
  });
  describe('Click functionality testing', () => {
    test('Click Button is present ', () => {
      global.chrome = chrome;

      const AccessDeniedOverlayProps = {
        maxWidth: '500',
        userInfo: {
          signedIn: true,
          insightsUser: false,
          email: 'test@gmail.com',
          emailVerified: true,
          freeTrial: false,
          freeTrialTriggered: true,
        },
        messageCreators: {
          login: () => {},
          logout: () => {},
          subscribe: () => {},
          sendEmailVerification: () => {},
          sendMetrics: () => {},
        },
        emailVerificationSent: true,
        isPageNotScanned: false,
      };

      const component = shallow(<AccessDeniedOverlay {...AccessDeniedOverlayProps} />);
      expect(component.find('div.AccessDeniedOverlay__button')).toHaveLength(1);
    });
  });
});
