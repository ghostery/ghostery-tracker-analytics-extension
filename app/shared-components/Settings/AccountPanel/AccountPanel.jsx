import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import { validateEmail, validateConfirmEmail, validatePassword } from '../../../utils/javascript/validateLogin';
import Globals from '../../../../src/classes/Globals';

import './AccountPanel.scss';

class AccountPanel extends Component {
  constructor(props) {
    super(props);
    this.state = this.getClearedState('signIn');
  }

  componentDidUpdate(prevProps) {
    const { view } = this.state;
    const { resetPasswordSent, actions: { openToast } } = this.props;

    if (view === 'resetPassword'
      && prevProps.resetPasswordSent === false && resetPasswordSent === true) {
      this.setNewView('signIn');
      openToast({
        toastText: 'Please check your email shortly for a link to reset your password.',
        altStyling: true,
      }, 0);
    }
  }

  getClearedState(viewType) {
    return {
      view: viewType,
      email: '',
      confirmEmail: '',
      firstName: '',
      lastName: '',
      password: '',
      legalConsentChecked: false,
      emailError: false,
      confirmEmailError: false,
      passwordError: false,
      passwordLengthError: false,
      passwordInvalidError: false,
      legalConsentNotCheckedError: false,
      validateInput: false,
    };
  }

  getClassNames(elementName) {
    const {
      view,
      emailError,
      confirmEmailError,
      passwordError,
      passwordLengthError,
      passwordInvalidError,
      legalConsentNotCheckedError,
    } = this.state;
    const { loginFailed, registerFailed, resetPasswordFailed } = this.props;

    const formElements = {
      accountPanelForm: { mainClass: 'AccountPanel__form', flex: 'd-flex', altStyling: 'flex-column', compressed: view === 'createAccount' },
      signInLink: { mainClass: 'AccountPanel__links', flex: 'd-flex', compressed: view === 'createAccount' },
      createAccountLink: { mainClass: 'AccountPanel__links', flex: 'd-flex' },
      forgotPasswordLink: { mainClass: 'AccountPanel__links', flex: 'd-flex', altStyling: 'centerAlign' },
      backLink: { mainClass: 'AccountPanel__links', flex: 'd-flex', altStyling: 'leftAlign' },
      emailInputLabel: { mainClass: 'AccountPanel__inputLabel', error: emailError || loginFailed || registerFailed || resetPasswordFailed },
      emailInputField: { mainClass: 'AccountPanel__inputField', error: emailError || loginFailed || registerFailed || resetPasswordFailed },
      emailErrorMessage: { mainClass: 'AccountPanel__message', flex: 'd-flex', error: emailError },
      confirmEmailInputLabel: { mainClass: 'AccountPanel__inputLabel', error: confirmEmailError || registerFailed },
      confirmEmailInputField: { mainClass: 'AccountPanel__inputField', error: confirmEmailError || registerFailed },
      confirmEmailErrorMessage: { mainClass: 'AccountPanel__message', flex: 'd-flex', error: confirmEmailError },
      nameInputLabel: { mainClass: 'AccountPanel__inputLabel' },
      nameInputField: { mainClass: 'AccountPanel__inputField' },
      passwordInputLabel: { mainClass: 'AccountPanel__inputLabel', error: passwordError || passwordLengthError || passwordInvalidError || loginFailed },
      passwordInputField: { mainClass: 'AccountPanel__inputField', error: passwordError || passwordLengthError || passwordInvalidError || loginFailed },
      passwordErrorMessage: { mainClass: 'AccountPanel__message', flex: 'd-flex', error: passwordError || passwordLengthError || passwordInvalidError },
      legalConsentBox: { mainClass: 'AccountPanel__consentBox', error: legalConsentNotCheckedError },
      legalConsentText: { mainClass: 'AccountPanel__consentText', error: legalConsentNotCheckedError },
      submitButtonContainer: { mainClass: 'AccountPanel__buttonContainer', flex: 'd-flex', compressed: view === 'createAccount' },
      submitButton: { mainClass: 'AccountPanel__button' },
    };

    const element = formElements[elementName];
    const elementClassNames = ClassNames(
      element.mainClass,
      element.flex,
      element.altStyling,
      { compressed: element.compressed },
      { error: element.error },
    );

    return elementClassNames;
  }

  setNewView(viewType) {
    const {
      actions: { updateLoginStatus, updateRegisterStatus, updateResetPasswordStatus, closeToast },
    } = this.props;
    this.setState(this.getClearedState(viewType));
    updateLoginStatus({ loginFailed: false });
    updateRegisterStatus({ registerFailed: false });
    updateResetPasswordStatus({ resetPasswordFailed: false });
    updateResetPasswordStatus({ resetPasswordSent: false });
    closeToast();
  }

  handleInputChange = (e) => {
    e.stopPropagation();
    const { name, value } = e.target;
    this.setState({ [name]: value });

    const { view, email, validateInput } = this.state;
    if (!validateInput) {
      return;
    }

    switch (name) {
      case 'email': {
        const emailIsValid = value && validateEmail(value);
        this.setState({ emailError: !emailIsValid });
        break;
      }
      case 'confirmEmail': {
        const confirmEmailIsValid = value && validateConfirmEmail(email, value);
        this.setState({ confirmEmailError: !confirmEmailIsValid });
        break;
      }
      case 'password': {
        if (view === 'signIn') {
          this.setState({
            passwordError: !value,
          });
        } else if (view === 'createAccount') {
          const passwordLengthIsValid = value && (value.length >= 8 && value.length <= 50);
          const passwordIsValid = value && validatePassword(value);
          this.setState({
            passwordLengthError: !passwordLengthIsValid,
            passwordInvalidError: !passwordIsValid,
          });
        }
        break;
      }
      default: break;
    }
  }

  handleLoginAttempt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { email, password } = this.state;
    const { panel } = this.props;
    const emailIsValid = email && validateEmail(email);

    this.setState({
      emailError: !emailIsValid,
      passwordError: !password,
      validateInput: true,
    });

    if (!emailIsValid || !password) {
      return;
    }

    const { messageCreators } = this.props;
    messageCreators.login({ email, password }, window.port);
    messageCreators.sendMetrics({ type: 'sign_in', insightsView: panel ? '2' : '3' });
  }

  handleRegisterAttempt = (e) => {
    e.preventDefault();
    const {
      email,
      confirmEmail,
      firstName,
      lastName,
      password,
      legalConsentChecked,
    } = this.state;

    const emailIsValid = email && validateEmail(email);
    const confirmEmailIsValid = confirmEmail && validateConfirmEmail(email, confirmEmail);
    const passwordLengthIsValid = password && (password.length >= 8 && password.length <= 50);
    const passwordIsValid = password && validatePassword(password);

    this.setState({
      emailError: !emailIsValid,
      confirmEmailError: !confirmEmailIsValid,
      passwordLengthError: !passwordLengthIsValid,
      passwordInvalidError: !passwordIsValid,
      legalConsentNotCheckedError: !legalConsentChecked,
      validateInput: true,
    });

    if (!emailIsValid
      || !confirmEmailIsValid
      || !passwordLengthIsValid
      || !passwordIsValid
      || !legalConsentChecked) {
      return;
    }

    const { messageCreators } = this.props;
    messageCreators.register({
      email, confirmEmail, firstName, lastName, password,
    });
  }

  handleResetPasswordAttempt = (e) => {
    e.preventDefault();
    const { email } = this.state;
    const emailIsValid = email && validateEmail(email);

    this.setState({
      emailError: !emailIsValid,
      validateInput: true,
    });

    if (!emailIsValid) {
      return;
    }

    const { messageCreators } = this.props;
    messageCreators.resetPassword({ email }, window.port);
  }

  handleCheckboxChange(checkboxStateString) {
    // eslint-disable-next-line react/destructuring-assignment
    const checkboxState = this.state[checkboxStateString];
    const { validateInput } = this.state;
    this.setState({ [checkboxStateString]: !checkboxState });

    if (checkboxStateString === 'legalConsentChecked' && validateInput) {
      this.setState({ legalConsentNotCheckedError: checkboxState });
    }
  }

  formLinkGenerator(linkClassNames, newView, linkText) {
    return (
      <div
        className={this.getClassNames(linkClassNames)}
      >
        <div
          className="AccountPanel__linksInner d-flex"
          onClick={() => this.setNewView(newView)}
        >
          {(linkText === 'Back') && (
            <img
              className="AccountPanel__backArrow"
              alt="Go back to Sign In"
              src={[chrome.extension.getURL('/dist/images/shared/caret-down-dark.svg')]}
            />
          )}
          <p>{linkText}</p>
        </div>
      </div>
    );
  }

  formTitleGenerator(titleText) {
    return (
      <div className="AccountPanel__title">
        {titleText}
      </div>
    );
  }

  formInputGenerator(
    labelClassNames,
    inputClassNames,
    labelText,
    inputType,
    inputName,
    stateInput,
  ) {
    // eslint-disable-next-line react/destructuring-assignment
    const val = this.state[stateInput];
    return (
      <label className={this.getClassNames(labelClassNames)}>
        {labelText}
        <input
          className={this.getClassNames(inputClassNames)}
          type={inputType}
          name={inputName}
          value={val}
          onChange={this.handleInputChange}
          pattern=".{1,}"
          autoComplete="off"
        />
      </label>
    );
  }

  formErrorMessageGenerator(messageClassNames, errorMessage) {
    return (
      <div className={this.getClassNames(messageClassNames)}>
        {errorMessage}
      </div>
    );
  }

  formCheckboxGenerator(checkboxStateString) {
    // eslint-disable-next-line react/destructuring-assignment
    const checkboxState = this.state[checkboxStateString];
    return (
      <div className="AccountPanel__consentInput d-flex">
        <div
          className="AccountPanel__consentBoxContainer"
          onClick={() => this.handleCheckboxChange(checkboxStateString)}
        >
          {!checkboxState ? (
            // ONLY HANDLING LEGAL CONSENT CLASS NAMES UNTIL WE ADD MORE CHECKBOXES TO THE FORM:
            <div className={this.getClassNames('legalConsentBox')} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
            >
              <g fill="none" fillRule="evenodd">
                <path d="M-1-1h15v15H-1z" />
                <path fill="#31708f" d="M10.875.875h-8.75c-.688 0-1.25.563-1.25 1.25v8.75c0 .688.563 1.25 1.25 1.25h8.75c.688 0 1.25-.563 1.25-1.25v-8.75c0-.688-.563-1.25-1.25-1.25zM5.25 9.625L2.125 6.62 3 5.78l2.25 2.163L10 3.375l.875.841L5.25 9.625z" />
              </g>
            </svg>
          )}
        </div>
        {/* ONLY HANDLING LEGAL CONSENT TEXT UNTIL WE ADD MORE CHECKBOXES TO THE FORM: */}
        <p className={this.getClassNames('legalConsentText', checkboxStateString)}>
          I accept the&nbsp;
          <a href="https://www.ghostery.com/about-ghostery/ghostery-terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          , the&nbsp;
          <a href="https://www.ghostery.com/about-ghostery/ghostery-subscription-products-end-user-license-agreement/" target="_blank" rel="noopener noreferrer">End-User License Agreement</a>
          , and consent to data practices found in the&nbsp;
          <a href="https://www.ghostery.com/about-ghostery/ghostery-plans-and-products-privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          .
        </p>
      </div>
    );
  }

  formButtonGenerator(buttonText) {
    return (
      <div className={this.getClassNames('submitButtonContainer')}>
        <input
          className={this.getClassNames('submitButton')}
          type="submit"
          value={buttonText}
        />
      </div>
    );
  }

  signInGenerator() {
    const {
      email,
      password,
      emailError,
      passwordError,
    } = this.state;
    return (
      <React.Fragment>
        <div
          className="AccountPanel__links d-flex"
        >
          <a
            className="AccountPanel__linksInner d-flex"
            href={`${Globals.SIGNON_SERVER}/register?utm_source=insightsapp`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Create Account
          </a>
        </div>
        {this.formTitleGenerator('Sign In')}
        <form
          className={this.getClassNames('accountPanelForm')}
          onSubmit={this.handleLoginAttempt}
        >
          {this.formInputGenerator(
            'emailInputLabel',
            'emailInputField',
            'Email:',
            'text',
            'email',
            email,
          )}
          {emailError
            && this.formErrorMessageGenerator(
              'emailErrorMessage',
              'Invalid email address.',
            )}
          {this.formInputGenerator(
            'passwordInputLabel',
            'passwordInputField',
            'Password:',
            'password',
            'password',
            password,
          )}
          {passwordError
            && this.formErrorMessageGenerator(
              'passwordErrorMessage',
              'Password required.',
            )}
          {this.formButtonGenerator('Sign In')}
        </form>
        {this.formLinkGenerator(
          'forgotPasswordLink',
          'resetPassword',
          'Forgot Password?',
        )}
      </React.Fragment>
    );
  }

  resetPasswordGenerator() {
    const {
      email,
      emailError,
    } = this.state;
    return (
      <React.Fragment>
        {this.formLinkGenerator(
          'backLink',
          'signIn',
          'Back',
        )}
        {this.formTitleGenerator('Forgot your password?')}
        {this.formTitleGenerator('Hey, it happens to everyone.')}
        {this.formTitleGenerator('We\'ll email you instructions to reset your password.')}
        <form
          className={this.getClassNames('accountPanelForm')}
          onSubmit={this.handleResetPasswordAttempt}
        >
          {this.formInputGenerator(
            'emailInputLabel',
            'emailInputField',
            'Email:',
            'text',
            'email',
            email,
          )}
          {emailError
            && this.formErrorMessageGenerator(
              'emailErrorMessage',
              'Invalid email address.',
            )}
          {this.formButtonGenerator('Send')}
        </form>
      </React.Fragment>
    );
  }

  render() {
    const { view } = this.state;
    return (
      <div className="AccountPanel d-flex flex-column">
        {(view === 'signIn') && this.signInGenerator()}
        {(view === 'resetPassword') && this.resetPasswordGenerator()}
      </div>
    );
  }
}

AccountPanel.propTypes = {
  panel: PropTypes.bool.isRequired,
  messageCreators: PropTypes.shape({
    login: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    resetPassword: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
  loginFailed: PropTypes.bool,
  registerFailed: PropTypes.bool,
  resetPasswordFailed: PropTypes.bool,
  resetPasswordSent: PropTypes.bool,
  actions: PropTypes.shape({
    openToast: PropTypes.func.isRequired,
    closeToast: PropTypes.func.isRequired,
    updateLoginStatus: PropTypes.func.isRequired,
    updateRegisterStatus: PropTypes.func.isRequired,
    updateResetPasswordStatus: PropTypes.func.isRequired,
  }).isRequired,
};

AccountPanel.defaultProps = {
  loginFailed: false,
  registerFailed: false,
  resetPasswordFailed: false,
  resetPasswordSent: false,
};

export default AccountPanel;
