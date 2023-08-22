import isEmpty from 'lodash.isempty';

import { updateUserInfo } from './messageCreators';
import { log } from '../../../src/utils/common';

function onMessage({ type, data = {} }) {
  switch (type) {
    case 'TabDetails': {
      if (!isEmpty(data)) {
        this.props.actions.setInitialTabInfo(data);
      }
      return;
    }
    case 'Settings':
    case 'SettingsUpdated': {
      this.props.actions.updateLocalSettings(data);
      return;
    }
    case 'UserInfo': {
      this.props.actions.updateUserInfo(data);
      return;
    }
    case 'RequestsByTypeDelta': {
      this.props.actions.updatePageSize(data);
      return;
    }
    case 'RequestsByTrackerDelta': {
      this.props.actions.updateTrackerInfo(data);
      return;
    }
    case 'timingPerformance': {
      this.props.actions.updateTimingPerformance(data);
      return;
    }
    case 'UpdateTrackerParentage': {
      this.props.actions.updateTrackerParentage(data);
      return;
    }
    case 'clear': {
      this.props.actions.clearState();
      return;
    }
    case 'parsedUrl': {
      this.props.actions.updateParentTabUrl(data.data.hostWithPath);
      return;
    }
    case 'PageNotScanned': {
      this.props.actions.updateIsPageNotScanned();
      return;
    }
    case 'ReportIsLive': {
      this.props.actions.updateIsLive(data);
      return;
    }
    case 'searchResultsUpdated': {
      this.props.actions.updateSearchResults(data);
      return;
    }
    case 'ParentTabClosed': {
      this.props.actions.updateParentTabClosed();
      if (this.props.showToasts) {
        this.props.actions.openToast({
          toastText: 'Parent tab has been closed and data will not be updated. Please start a new session.',
        }, 0);
      }
      return;
    }
    case 'LoginFailed': {
      this.props.actions.openToast({
        toastText: 'Looks like we can\'t find this email and password combo. Give it another shot.',
        altStyling: true,
        errorStyling: true,
      }, 0);
      this.props.actions.updateLoginStatus({ loginFailed: true });
      return;
    }
    case 'TooManyFailedLogins': {
      this.props.actions.openToast({
        toastText: 'Too many failed logins. Try again in one hour.',
        altStyling: true,
        errorStyling: true,
      }, 0);
      this.props.actions.updateLoginStatus({ loginFailed: true });
      return;
    }
    case 'LoginSuccess': {
      this.props.actions.closeToast();
      this.props.actions.updateLoginStatus({ loginFailed: false });
      return;
    }
    case 'RegisterFailed': {
      this.props.actions.openToast({
        toastText: 'That email address is already in use. Please choose another.',
        altStyling: true,
        errorStyling: true,
      }, 0);
      this.props.actions.updateRegisterStatus({ registerFailed: true });
      return;
    }
    case 'RegisterSuccess': {
      this.props.actions.closeToast();
      this.props.actions.updateRegisterStatus({ registerFailed: false });
      return;
    }
    case 'FreeTrialTriggered': updateUserInfo(); return;
    case 'ResetPasswordFailed': {
      this.props.actions.openToast({
        toastText: 'Sorry, that email isn\'t in our system.',
        altStyling: true,
        errorStyling: true,
      }, 0);
      this.props.actions.updateResetPasswordStatus({
        resetPasswordFailed: true,
        resetPasswordSent: false,
      });
      return;
    }
    case 'ResetPasswordTooManyAttempts':
      this.props.actions.openToast({
        toastText: 'Too many password reset requests. Try again in one hour.',
        altStyling: true,
        errorStyling: true,
      }, 0);
      this.props.actions.updateResetPasswordStatus({
        resetPasswordFailed: true,
        resetPasswordSent: false,
      });
      return;
    case 'ResetPasswordSent': {
      this.props.actions.updateResetPasswordStatus({
        resetPasswordFailed: false,
        resetPasswordSent: true,
      });
      return;
    }
    case 'EmailVerificationSent': {
      this.props.actions.updateEmailVerificationSent();
      return;
    }
    case 'EmailVerificationServerError': {
      log('There was a server error when sending email verification message.');
      return;
    }
    default: {
      log(`Message Type ${type} not recognized on Insights App.`, data);
    }
  }
}

export default onMessage;
