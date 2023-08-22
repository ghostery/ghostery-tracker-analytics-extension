import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import './AccessDeniedOverlay.scss';

const NOT_SIGNED_IN = 1;
const EMAIL_NOT_VERIFIED = 2;
const FREE_TRIAL_EXPIRED = 3;
const ACTIVE = 4;

const AccessDeniedOverlay = (props) => {
  const {
    isFullPage,
    maxWidth,
    userInfo,
    messageCreators,
    emailVerificationSent,
    isPageNotScanned,
  } = props;
  const {
    signedIn, insightsUser, email, emailVerified, freeTrial, freeTrialTriggered,
  } = userInfo;

  let accountState = NOT_SIGNED_IN;
  if (signedIn && (!emailVerified || !freeTrialTriggered)) { accountState = EMAIL_NOT_VERIFIED; }
  if (signedIn && emailVerified && !insightsUser && (!freeTrial && freeTrialTriggered)) {
    accountState = FREE_TRIAL_EXPIRED;
  }
  if (signedIn && emailVerified && (insightsUser || freeTrial)) { accountState = ACTIVE; }
  // TODO implement handling of this state if we ever pass data from the backend
  // indicating if the user has subscribed in the past
  // if (signedIn && !insightsUser) { accountState = NOT_SUBSCRIBED; }

  if (accountState === ACTIVE) {
    return null;
  }

  const logoUrlRoot = 'dist/images/shared';
  let logoUrl;
  let logoAlt;
  let headerCopy;
  let textCopy;
  let buttonCopy;
  let buttonFn;
  let additionalLinks = false;
  switch (accountState) {
    case NOT_SIGNED_IN:
      logoUrl = `${logoUrlRoot}/sign-in.svg`;
      logoAlt = 'Sign In';
      headerCopy = '';
      textCopy = 'Sign in or create an account to continue.';
      buttonCopy = '';
      buttonFn = () => {};
      break;
    case EMAIL_NOT_VERIFIED:
      logoUrl = `${logoUrlRoot}/email-not-verified.svg`;
      logoAlt = 'Verify Email';
      headerCopy = 'Please verify your account to proceed.';
      textCopy = `Click the verification link that was sent to ${email} and refresh Insights.`;
      buttonCopy = emailVerificationSent ? 'Sent' : 'Resend Link';
      buttonFn = emailVerificationSent ? () => {} : messageCreators.sendEmailVerification;
      additionalLinks = true;
      break;
    case FREE_TRIAL_EXPIRED:
      logoUrl = `${logoUrlRoot}/ghosty-insights.svg`;
      logoAlt = 'Ghosty Insights';
      headerCopy = 'Your free trial period has ended.';
      textCopy = 'Consider becoming a Contributor to gain access to Insights.';
      buttonCopy = 'Donate now';
      buttonFn = messageCreators.subscribe;
      break;
    default:
      logoUrl = `${logoUrlRoot}/ghosty-insights.svg`;
      logoAlt = 'Ghosty Insights';
      headerCopy = '';
      textCopy = '';
      buttonCopy = '';
      buttonFn = () => {};
  }

  const ui = {
    image: {
      src: chrome.extension.getURL(logoUrl),
      alt: logoAlt,
    },
    header: { copy: headerCopy },
    text: { copy: textCopy },
    button: {
      copy: buttonCopy,
      fn: buttonFn,
    },
  };

  const containerClassNames = ClassNames(
    'AccessDeniedOverlay__container',
    'd-flex',
    'align-items-center',
    'flex-column',
    { altStyling: !signedIn },
  );
  const imageClassNames = ClassNames('AccessDeniedOverlay__image', {
    large: isFullPage,
    emailNotVerified: accountState === EMAIL_NOT_VERIFIED,
  });
  const headerClassNames = ClassNames('AccessDeniedOverlay__header', {
    large: isFullPage,
    reduceMargin: additionalLinks,
  });
  const textClassNames = ClassNames('AccessDeniedOverlay__text', {
    large: isFullPage,
  });
  const buttonClassNames = ClassNames('AccessDeniedOverlay__button', {
    emailSent: signedIn && !emailVerified && emailVerificationSent,
    large: isFullPage,
    reduceMargin: additionalLinks,
  });
  const linkClassNames = ClassNames('AccessDeniedOverlay__link', {
    large: isFullPage,
  });

  return (
    <React.Fragment>
      {!isPageNotScanned && (
        <div className="AccessDeniedOverlay d-flex justify-content-center">
          <div
            className={containerClassNames}
            style={{ maxWidth }}
          >
            <div className="flex-grow-1" />
            <img
              src={ui.image.src}
              className={imageClassNames}
              alt={ui.image.alt}
            />
            {ui.header.copy && (
              <div className={headerClassNames}>
                {ui.header.copy}
              </div>
            )}
            <div className={textClassNames}>
              {ui.text.copy}
            </div>
            {signedIn && (
              <div
                className={buttonClassNames}
                onClick={() => {
                  ui.button.fn();
                  if (accountState === FREE_TRIAL_EXPIRED) {
                    messageCreators.sendMetrics({ type: 'subscribe', insightsView: isFullPage ? '1' : '0' });
                  }
                }}
              >
                {ui.button.copy}
              </div>
            )}
            {additionalLinks && (
              <React.Fragment>
                <div className={linkClassNames} onClick={messageCreators.logout}>
                  Sign Out
                </div>
                <a
                  className={linkClassNames}
                  href="mailto: support-insights@ghostery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support-insights@ghostery.com
                </a>
              </React.Fragment>
            )}
            <div className="flex-grow-1" />
            {isFullPage && (<div className="flex-grow-1" />)}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

AccessDeniedOverlay.propTypes = {
  isFullPage: PropTypes.bool,
  maxWidth: PropTypes.string.isRequired,
  userInfo: PropTypes.shape({
    signedIn: PropTypes.bool.isRequired,
    insightsUser: PropTypes.bool.isRequired,
    email: PropTypes.string.isRequired,
    emailVerified: PropTypes.bool.isRequired,
    freeTrial: PropTypes.bool.isRequired,
    freeTrialTriggered: PropTypes.bool.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    sendEmailVerification: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
  emailVerificationSent: PropTypes.bool.isRequired,
  isPageNotScanned: PropTypes.bool.isRequired,
};

AccessDeniedOverlay.defaultProps = {
  isFullPage: false,
};

export default AccessDeniedOverlay;
