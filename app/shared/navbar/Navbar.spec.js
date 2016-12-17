import { expect } from 'chai';
import React from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import NavItem from 'react-bootstrap/lib/NavItem';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Immutable from 'seamless-immutable';

import Logo from 'shared/logo';
import User from 'utils/fixtures/User';
import { getSearchPageUrl } from 'utils/searchUtils';
import { shallowWithIntl } from 'utils/testUtils';
import Navbar from './Navbar';

describe('shared/navbar/Navbar', () => {
  function getWrapper(props) {
    const defaults = {
      clearSearchResults: () => null,
      isAdmin: false,
      isLoggedIn: false,
      user: {},
    };
    return shallowWithIntl(<Navbar {...defaults} {...props} />);
  }

  it('renders a link to home page', () => {
    const homePageLink = getWrapper().find(IndexLink);
    expect(homePageLink).to.have.length(1);
  });

  it('displays the logo of the service', () => {
    expect(getWrapper().find(Logo)).to.have.length(1);
  });

  it('renders a link to search page', () => {
    const searchLink = getWrapper().find(LinkContainer).filter({ to: getSearchPageUrl() });
    expect(searchLink).to.have.length(1);
  });

  describe('if user is logged in but is not an admin', () => {
    const props = {
      isAdmin: false,
      isLoggedIn: true,
      user: Immutable(User.build()),
    };
    function getLoggedInNotAdminWrapper() {
      return getWrapper(props);
    }

    it('renders a NavDropdown', () => {
      const navDropdown = getLoggedInNotAdminWrapper().find(NavDropdown);
      expect(navDropdown).to.have.length(1);
    });

    it('NavDropdown has the name of the logged in user as its title', () => {
      const actual = getLoggedInNotAdminWrapper().find(NavDropdown).prop('title');
      const expected = [props.user.firstName, props.user.lastName].join(' ');
      expect(actual).to.equal(expected);
    });

    it('renders a link to my reservations page', () => {
      const myReservationsLink = getLoggedInNotAdminWrapper()
        .find(LinkContainer).filter({ to: '/my-reservations' });
      expect(myReservationsLink).to.have.length(1);
    });

    it('does not render a link to admin resources page', () => {
      const myReservationsLink = getLoggedInNotAdminWrapper()
        .find(LinkContainer).filter({ to: '/admin-resources' });
      expect(myReservationsLink).to.have.length(0);
    });

    it('renders a logout link', () => {
      const logoutHref = `/logout?next=${window.location.origin}`;
      const logoutLink = getLoggedInNotAdminWrapper().find(MenuItem).filter({ href: logoutHref });
      expect(logoutLink).to.have.length(1);
    });

    it('does not render a link to login page', () => {
      const loginLink = getLoggedInNotAdminWrapper().find(NavItem).filter({ href: '/login' });
      expect(loginLink).to.have.length(0);
    });
  });

  describe('if user is logged in and is an admin', () => {
    const props = {
      isAdmin: true,
      isLoggedIn: true,
      user: Immutable(User.build()),
    };
    function getLoggedInAdminWrapper() {
      return getWrapper(props);
    }

    it('renders a link to admin resources page', () => {
      const myReservationsLink = getLoggedInAdminWrapper()
        .find(LinkContainer).filter({ to: '/admin-resources' });
      expect(myReservationsLink).to.have.length(1);
    });
  });

  describe('if user is not logged in', () => {
    const props = {
      isAdmin: false,
      isLoggedIn: false,
      user: {},
    };
    function getNotLoggedInWrapper() {
      return getWrapper(props);
    }

    it('does not render a NavDropdown', () => {
      const navDropdown = getNotLoggedInWrapper().find(NavDropdown);
      expect(navDropdown).to.have.length(0);
    });

    it('renders a link to login page', () => {
      const loginLink = getNotLoggedInWrapper().find(NavItem).filter({ href: '/login' });
      expect(loginLink).to.have.length(1);
    });

    it('does not render a logout link', () => {
      const logoutHref = `/logout?next=${window.location.origin}`;
      const logoutLink = getNotLoggedInWrapper().find(MenuItem).filter({ href: logoutHref });
      expect(logoutLink).to.have.length(0);
    });

    it('does not render a link to my reservations page', () => {
      const myReservationsLink = getNotLoggedInWrapper()
        .find(LinkContainer).filter({ to: '/my-reservations' });
      expect(myReservationsLink).to.have.length(0);
    });

    it('does not render a link to admin resources page', () => {
      const myReservationsLink = getNotLoggedInWrapper()
        .find(LinkContainer).filter({ to: '/admin-resources' });
      expect(myReservationsLink).to.have.length(0);
    });
  });
});
