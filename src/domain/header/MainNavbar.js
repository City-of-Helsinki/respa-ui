import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import FAIcon from '../../../app/shared/fontawesome-icon/FontAwesomeIcon';
import injectT from '../../../app/i18n/injectT';
import { getSearchPageUrl } from '../../../app/utils/searchUtils';
import TabbableNavDropdown from '../../../app/shared/tabbable-nav-dropdown/TabbableNavDropdown';
import AccessibilityMenu from './AccessibilityMenu';
import { getSelA11yPref } from '../../../app/utils/accessibilityUtils';

class MainNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  collapseItem() {
    this.setState({ expanded: false });
  }

  toggleCollapse() {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  }

  render() {
    const {
      activeLink, clearSearchResults, isAdmin, isLoggedIn, t, viewpoints,
    } = this.props;

    return (
      <Navbar
        className="app-MainNavbar"
        expanded={this.state.expanded}
        onToggle={() => this.toggleCollapse()}
      >
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Varaamo</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav activeKey={activeLink}>
            <LinkContainer to={getSearchPageUrl()}>
              <NavItem
                eventKey="search"
                onClick={() => {
                  this.collapseItem();
                  clearSearchResults();
                }}
              >
                {t('Navbar.search')}
              </NavItem>
            </LinkContainer>
            {isLoggedIn && (
              <LinkContainer to="/admin-resources">
                <NavItem eventKey="admin-resources" onClick={() => this.collapseItem()}>
                  {isAdmin ? t('Navbar.adminResources') : t('Navbar.userFavorites')}
                </NavItem>
              </LinkContainer>
            )}
            {isLoggedIn && (
              <LinkContainer to="/my-reservations">
                <NavItem eventKey="my-reservations" onClick={() => this.collapseItem()}>
                  {t('Navbar.userResources')}
                </NavItem>
              </LinkContainer>
            )}
            {isAdmin
              && (
                <Fragment>
                  <LinkContainer to="/manage-reservations">
                    <NavItem eventKey="manage-reservations" onClick={() => this.collapseItem()}>
                      {t('Navbar.manageReservations')}
                    </NavItem>
                  </LinkContainer>
                  <NavItem eventKey="adminMaintenance" href="https://api.hel.fi/respa/ra/" target="_blank">
                    {t('Navbar.adminMaintenance')}
                    <FAIcon icon={faExternalLinkAlt} />
                  </NavItem>

                  <NavItem eventKey="adminGuide" href="https://cityofhelsinki.gitbook.io/varaamo" target="_blank">
                    {t('Navbar.adminGuide')}
                    <FAIcon icon={faExternalLinkAlt} />
                  </NavItem>
                </Fragment>
              )
            }
            <LinkContainer to="/about">
              <NavItem eventKey="about" onClick={() => this.collapseItem()}>
                {t('Navbar.aboutLink')}
              </NavItem>
            </LinkContainer>
          </Nav>
          <Nav pullRight>
            <TabbableNavDropdown
              as="li"
              id="user-nav-dropdown"
              renderToggle={(props) => {
                return (
                  <a {...props} className="app-MainNavbar__selection" href="#" type="button">
                    {t('Navbar.accessibilityMenuToggle.label')}
                    <span className="app-MainNavbar__selection-overview">
                      {`${getSelA11yPref().length} ${t('common.selection')}`}
                    </span>
                  </a>
                );
              }}
            >
              {({ closeMenu }) => (
                <AccessibilityMenu handleClose={closeMenu} viewpoints={viewpoints} />
              )}
            </TabbableNavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

MainNavbar.propTypes = {
  activeLink: PropTypes.string.isRequired,
  clearSearchResults: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  viewpoints: PropTypes.array.isRequired,
};

export default injectT(MainNavbar);
