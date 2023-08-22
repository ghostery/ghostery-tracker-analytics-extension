/**
 * User Accounts
 *
 * Implements User Accounts for Ghostery Insights.
 *
 * this._allowInsights  {Boolean}  Whether the user has an Insights subscription.
 * this._userData       {Object}   UserData returned from the API Get call.
 *   { attributes: email {string}, scopes {array} }
 *
 * Insights by Ghostery
 */

import isEmpty from 'lodash.isempty';
import Globals from './Globals';
import Settings from './Settings';
import { log } from '../utils/common';
import { get, save } from '../utils/api';

const {
  GHOSTERY_DOMAIN,
  AUTH_SERVER,
} = Globals;

class Account {
  constructor() {
    log('Account Constructor');
    this._allowInsights = false;
    this._freeTrial = false;
    this._freeTrialExpirationTimestamp = 0;
    this._freeTrialTriggered = this._isFreeTrialTriggered();
    this._userData = {};
  }

  log() {
    log('Account Log...');
    log('Account _allowInsights', this._allowInsights);
    log('Account _freeTrial', this._freeTrial);
    log('Account_freeTrialExpirationTimestamp', this._freeTrialExpirationTimestamp);
    log('Account_freeTrialTriggered', this._freeTrialTriggered);
    log('Account _userData', this._userData);
  }

  updateAndSendUserInfo = (responseMessage, updateApp) => {
    this.checkInsightsUser().then(() => {
      const userInfo = this.getUserInfo();
      updateApp(userInfo);
      responseMessage('UserInfo', userInfo);
    });
  };

  sendUserInfo = (responseMessage, updateApp) => {
    const userInfo = this.getUserInfo();
    const { signedIn, emailVerified, insightsUser, freeTrial } = userInfo;
    if (signedIn && (!emailVerified || !(insightsUser || freeTrial))) {
      this.updateAndSendUserInfo(responseMessage, updateApp);
    } else {
      responseMessage('UserInfo', userInfo);
    }
  };

  checkInsightsUser = () => (
    this._getUserIdFromCookie()
      .then(userID => (
        get('users', userID, 'trials')
          .then((userJSON) => {
            const { data } = userJSON;
            const { attributes: { scopes, stripe_customer_id } } = data;

            this._userData = data;
            this._allowInsights = (Array.isArray(scopes) && (scopes.includes('subscriptions:plus') || scopes.includes('subscriptions:insights'))) || false;

            const trials = (userJSON.included || []).find(el => el.type === 'trials');

            if (trials) {
              const { attributes: { date_expired } } = trials;
              const isTrialing = date_expired > Math.round(Date.now() / 1000);
              this._updateFreeTrialStates(isTrialing, date_expired);
            }

            if (stripe_customer_id) {
              return get('stripe/customers', userID, 'subscriptions').then((stripeJSON) => {
                if (stripeJSON && Array.isArray(stripeJSON.included)) {
                  const { included } = stripeJSON;
                  const isSubscriberIndex = included.findIndex(el => this._isSubscriptionStatus('active', el));
                  if (isSubscriberIndex !== -1) {
                    this._freeTrial = false;
                    return;
                  }

                  const isTrialingIndex = included.findIndex(el => this._isSubscriptionStatus('trialing', el));
                  if (isTrialingIndex !== -1) {
                    const { current_period_end } = included[isTrialingIndex].attributes;
                    const isTrialing = current_period_end > Math.round(Date.now() / 1000);
                    this._updateFreeTrialStates(isTrialing, current_period_end);
                  }
                }
              });
            }

            return null;
          })
      ))
      .catch(() => {
        // TODO errors should be handled where this function is being called, not hidden here
        this._clear();
      })
  );

  // checkInsightsUser helper
  _isSubscriptionStatus(desiredStatus, el) {
    const { type, attributes } = el;
    const { product_id, status } = attributes;
    return (
      type === 'subscriptions'
      && product_id === 'prod_plus'
      && status === desiredStatus
    );
  }

  // checkInsightsUser helper
  _updateFreeTrialStates(isTrialing, expirationTimestamp) {
    if (isTrialing) {
      Settings.set('freeTrialStatus', 'active');
      this._freeTrialExpirationTimestamp = expirationTimestamp;
      this._freeTrial = true;
    } else {
      this._freeTrial = false;
      Settings.set('freeTrialStatus', 'expired');
    }
  }

  eligibleForFreeTrial() {
    return (
      !this._freeTrial
      && Settings.get('freeTrialStatus') !== 'expired'
    );
  }

  /**
  * Begin a new Insights user's free trial.
  * This function is called when the panel or tab are about to be opened
  * and the free trial has never yet been triggered according to the local settings.
  * If a user has tried to be clever and messed with the local settings,
  * the backend will still detect that a trial already exists for the user.
  * The local settings is just there so we don't keep making unnecessary requests to the
  * backend for non-clever users.
  */
  startFreeTrial() {
    return new Promise((resolve, reject) => {
      if (!this._isEmailVerified()) { reject(); }

      const { id } = this._userData;

      save(`trials/${id}/prod_plus`)
        .then(() => resolve())
        .catch(() => reject());
    });
  }

  /**
   * Reports whether the conditions are right to show the free trial expiration popup
   * @returns {boolean}
   */
  showEndOfFreeTrialPopup() {
    return (
      Settings.get('freeTrialStatus') === 'expired'
      && !Settings.get('endOfFreeTrialPopupAcknowledged')
      && this.isSignedIn()
      && !this._freeTrial
      && !this._allowInsights
    );
  }

  /**
   * This function will purge the access_token cookie if it has expired.
   * We need to get the cookie so it can be automatically deleted if it
   * is expired, which will trigger our onCookieChanged event handler.
   */
  checkAccessCookie() {
    chrome.cookies.get({
      url: `https://${GHOSTERY_DOMAIN}.com`,
      name: 'access_token',
    }, () => {});
  }

  _getUserIdFromCookie() {
    return new Promise((resolve, reject) => {
      chrome.cookies.get({
        url: `https://${GHOSTERY_DOMAIN}.com`,
        name: 'user_id',
      }, (cookie) => {
        if (cookie) {
          return resolve(cookie.value);
        }
        return reject({ // eslint-disable-line prefer-promise-reject-errors
          fn: '_getUserIdFromCookie',
          error: new Error('Failed to get UserId from Cookie.'),
        });
      });
    });
  }

  _getUserDataFromServer(userId) {
    return new Promise((resolve, reject) => {
      get('users', userId)
        .then((res) => {
          log('Account GetUserDataFromServer In Then', res);
          if (res.data) {
            return resolve(res.data);
          }
          return reject({ // eslint-disable-line prefer-promise-reject-errors
            fn: '_getUserDataFromServer',
            error: new Error(`Failed to get UserData from Server: Returned with code ${res.status}.`),
          });
        })
        .catch((err) => {
          log('Account GetUserDataFromServer In Catch', err);
          return reject({ // eslint-disable-line prefer-promise-reject-errors
            fn: '_getUserDataFromServer',
            error: new Error(`Failed to get UserData from Server: Returned with code ${err[0].status}.`),
          });
        });
    });
  }

  _removeCookies() {
    const cookies = ['user_id', 'access_token', 'refresh_token', 'csrf_token', 'AUTH'];
    cookies.forEach((name) => {
      chrome.cookies.remove({
        url: `https://${GHOSTERY_DOMAIN}.com`,
        name,
      }, () => {
        log(`Removed cookie with name: ${name}`);
      });
    });
  }

  _startFreeTrialIfAppropriate(responseMessage) {
    this.checkInsightsUser()
      .then(() => {
        const { insightsUser, freeTrialTriggered } = this.getUserInfo();
        if (!insightsUser && !freeTrialTriggered) {
          this.startFreeTrial()
            .then(() => responseMessage('FreeTrialTriggered'))
            .catch(err => log(err));
        }
      })
      .catch(err => log(err));
  }

  getUserInfo() {
    return {
      email: this._getUserEmail(),
      emailVerified: this._isEmailVerified(),
      signedIn: this.isSignedIn(),
      insightsUser: this._isInsightsUser(),
      freeTrial: this._freeTrial,
      freeTrialDaysRemaining: this._freeTrialDaysRemaining(),
      freeTrialTriggered: this._isFreeTrialTriggered(),
    };
  }

  // ToDo: Is this function necessary
  isSignedIn() {
    return !isEmpty(this._userData);
  }

  isTrialExpired() {
    return (
      this.isSignedIn()
      && this._isFreeTrialTriggered()
      && !this._isInsightsUser()
      && !this._freeTrial
    );
  }

  _isEmailVerified() {
    return ((this.isSignedIn()
      && this._userData.attributes
      && this._userData.attributes.email_validated)
      || false
    );
  }

  // ToDo: Is this function necessary
  _isInsightsUser() {
    return this.isSignedIn() && this._allowInsights;
  }

  // ToDo: Is this function necessary
  _getUserEmail() {
    return (this.isSignedIn() && this._userData.attributes.email) || '';
  }

  _freeTrialDaysRemaining() {
    if (!this._freeTrial) return 0;

    const secondsLeft = this._freeTrialExpirationTimestamp - Math.round(Date.now() / 1000);

    return (Math.ceil(secondsLeft / 60 / 60 / 24));
  }

  _isFreeTrialTriggered() {
    return (Settings.get('freeTrialStatus') !== null);
  }

  _clear() {
    Settings.set('freeTrialStatus', null);
    this._allowInsights = false;
    this._freeTrial = false;
    this._freeTrialExpirationTimestamp = 0;
    this._freeTrialTriggered = false;
    this._userData = {};
  }

  sendEmailVerification = responseMessage => (
    this._getUserIdFromCookie()
      .then((userId) => {
        if (!userId) {
          log('Unable to retreive User ID');
          return;
        }
        fetch(`${AUTH_SERVER}/api/v2/send_email/validate_account/${userId}`)
          .then((res) => {
            if (res.status < 400) {
              responseMessage('EmailVerificationSent');
            } else {
              responseMessage('EmailVerificationServerError');
            }
          }).catch(err => log(err));
      })
  )

  login = ({ email, password }, responseMessage) => {
    const data = `email=${window.encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    return fetch(`${AUTH_SERVER}/api/v2/login`, {
      method: 'POST',
      credentials: 'include',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }).then((res) => {
      if (res.status === 429) {
        responseMessage('TooManyFailedLogins');
        return;
      }
      if (res.status >= 400) {
        responseMessage('LoginFailed');
        return;
      }
      responseMessage('LoginSuccess');
      this._startFreeTrialIfAppropriate(responseMessage);
    }).catch(err => log(err));
  };

  register = ({
    email, confirmEmail, firstName, lastName, password,
  }, responseMessage) => {
    const data = `email=${window.encodeURIComponent(email)}&email_confirmation=${window.encodeURIComponent(confirmEmail)}&first_name=${window.encodeURIComponent(firstName)}&last_name=${window.encodeURIComponent(lastName)}&password=${window.encodeURIComponent(password)}`;
    return fetch(`${AUTH_SERVER}/api/v2/register`, {
      method: 'POST',
      credentials: 'include',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }).then((res) => {
      if (res.status >= 400) {
        responseMessage('RegisterFailed');
        return;
      }
      responseMessage('RegisterSuccess');
      this._startFreeTrialIfAppropriate(responseMessage);
    }).catch(err => log(err));
  };

  resetPassword = ({ email }, responseMessage) => {
    const data = `email=${window.encodeURIComponent(email)}`;
    return fetch(`${AUTH_SERVER}/api/v2/send_email/reset_password`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }).then((res) => {
      if (res.status === 429) {
        responseMessage('ResetPasswordTooManyAttempts');
        return;
      }
      if (res.status >= 400) {
        responseMessage('ResetPasswordFailed');
        return;
      }
      responseMessage('ResetPasswordSent');
    }).catch(err => log(err));
  }

  logout = () => new Promise((resolve, reject) => {
    chrome.cookies.get({
      url: `https://${GHOSTERY_DOMAIN}.com`,
      name: 'csrf_token',
    }, (cookie) => {
      log('Account Logout');
      if (cookie === null) { return reject(); }
      return fetch(`${AUTH_SERVER}/api/v2/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': cookie.value },
      }).then(() => resolve()).catch((err) => {
        log(err);
        reject();
      });
    });
  }).finally(() => {
    // remove cookies in case fetch fails
    this._clear();
    this._removeCookies();
  });
}

// return the class as a singleton
export default new Account();
