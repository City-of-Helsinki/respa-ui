import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import Nav from 'react-bootstrap/lib/Nav';

import getIsFeatureEnabled from '../feature-flags/getIsFeatureEnabled';
import FeatureFlags from '../feature-flags/FeatureFlags';
import injectT from '../../../app/i18n/injectT';
import { SUPPORTED_LANGUAGES } from '../../../app/i18n/TranslationConstants';
import TabbableNavDropdown from '../../../app/shared/tabbable-nav-dropdown/TabbableNavDropdown';
import TabbableNavItem from '../../../app/shared/tabbable-nav-dropdown/TabbableNavItem';
import HeaderFontSizeControl from './HeaderFontSizeControl';
import HeaderContrastControl from './HeaderContrastControl';
import HeaderUniversalAccessIcon from './HeaderUniversalAccessIcon';

// Bootstrap uses magic to force props on child elements based on
// element type. Because our vanilla elements don't make use of those
// props, they end up in the DOM and raise errors. For that reason, we
// blocking bootstrap from applying these props.
const BootstrapGuardedLI = (props) => {
  // eslint-disable-next-line react/prop-types
  return <li className={props.className}>{props.children}</li>;
};

class TopNavbar extends Component {
  static propTypes = {
    changeLocale: PropTypes.func.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    userName: PropTypes.string.isRequired,
  };

  onLanguageItemClick(nextLocale) {
    this.props.changeLocale(nextLocale);
  }

  handleLoginClick() {
    const next = encodeURIComponent(window.location.href);
    window.location.assign(`${window.location.origin}/login?next=${next}`);
  }

  render() {
    const {
      currentLanguage, isLoggedIn, t, userName,
    } = this.props;
    const isFontSizeControlEnabled = getIsFeatureEnabled(FeatureFlags.FONT_SIZE_CONTROLS);
    const isContrastEnabled = getIsFeatureEnabled(FeatureFlags.CONTRAST_CONTROL);
    const contrastControl = isContrastEnabled ? <HeaderContrastControl /> : null;
    const fontSizeControl = isFontSizeControlEnabled ? <HeaderFontSizeControl /> : null;

    return (
      <Navbar className="app-TopNavbar">
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <span className="brand-logo" />
            </Link>
          </Navbar.Brand>
        </Navbar.Header>

        <Nav activeKey="none" pullRight>
          {(contrastControl || fontSizeControl) && (
            <TabbableNavDropdown
              as="li"
              className="app-TopNavbar__mobile-accessibility-menu-toggle"
              renderToggle={props => (
                <LinkButton
                  {...props}
                  aria-label={t('Navbar.accessibilityMenuToggle.label')}
                >
                  <HeaderUniversalAccessIcon />
                </LinkButton>
              )}
            >
              {() => (
                <>
                  {contrastControl}
                  {fontSizeControl}
                </>
              )}
            </TabbableNavDropdown>
          )}
          {contrastControl && (
            <BootstrapGuardedLI className="app-TopNavbar__non-mobile-accessibility-control">
              {contrastControl}
            </BootstrapGuardedLI>
          )}
          {fontSizeControl && (
            <BootstrapGuardedLI className="app-TopNavbar__non-mobile-accessibility-control">
              {fontSizeControl}
            </BootstrapGuardedLI>
          )}
          <TabbableNavDropdown
            as="li"
            className="app-TopNavbar__language"
            id="language-nav-dropdown"
            renderToggle={props => (
              <LinkButton
                {...props}
                aria-label={t(`common.language.${currentLanguage}`)}
              >
                {currentLanguage.toUpperCase()}
              </LinkButton>
            )}
          >
            {({ closeMenu }) => Object.values(SUPPORTED_LANGUAGES)
              .filter(language => language !== currentLanguage)
              .map(language => (
                <TabbableNavItem
                  href="#"
                  key={language}
                  lang={language}
                  onClick={(e) => {
                    e.preventDefault();
                    this.onLanguageItemClick(language);
                    closeMenu();
                  }}
                >
                  {t(`common.language.${language}`)}
                </TabbableNavItem>
              ))
            }
          </TabbableNavDropdown>

          {isLoggedIn && (
            <TabbableNavDropdown
              as="li"
              className="app-TopNavbar__name"
              id="user-nav-dropdown"
              renderToggle={props => (
                <LinkButton {...props}>{userName}</LinkButton>
              )}
            >
              {({ closeMenu }) => (
                <TabbableNavItem
                  href={`/logout?next=${window.location.origin}`}
                  onClick={closeMenu}
                >
                  {t('Navbar.logout')}
                </TabbableNavItem>
              )}
            </TabbableNavDropdown>
          )}

          {!isLoggedIn && (
            <NavItem id="app-TopNavbar__login" onClick={this.handleLoginClick}>
              {t('Navbar.login')}
            </NavItem>
          )}
        </Nav>
      </Navbar>
    );
  }
}

// Due to style rules, which expect an a element, we have to use an anchor
// instead of a button.
const LinkButton = ({ children, ...props }) => (
  <a href="#" type="button" {...props}>
    {children}
  </a>
);

LinkButton.propTypes = {
  children: PropTypes.node,
};

export default injectT(TopNavbar);
