import { expect } from 'chai';
import React from 'react';
import Immutable from 'seamless-immutable';
import simple from 'simple-mock';

import PageWrapper from 'pages/PageWrapper';
import { shallowWithIntl } from 'utils/testUtils';
import ResourceMap from 'shared/resource-map';
import { UnconnectedSearchPage as SearchPage } from './SearchPage';
import SearchControls from './controls';
import SearchResults from './results/SearchResults';
import MapToggle from './results/MapToggle';

describe('pages/search/SearchPage', () => {
  const defaultProps = {
    actions: {
      changeSearchFilters: simple.stub(),
      fetchPurposes: simple.stub(),
      fetchUnits: simple.stub(),
      searchResources: simple.stub(),
      toggleMap: () => {},
    },
    isLoggedIn: false,
    isFetchingSearchResults: false,
    filters: {
      date: '2015-10-10',
      purpose: 'some-purpose',
    },
    location: {
      search: 'data:2015-10-10',
    },
    history: {},
    match: { params: {} },
    position: null,
    resultCount: 2,
    searchDone: true,
    searchResultIds: Immutable(['resource-1', 'resource-2']),
    selectedUnitId: '123',
    showMap: false,
    uiFilters: {
      date: '2015-10-10',
      purpose: 'some-purpose',
    },
  };

  function getWrapper(extraProps) {
    return shallowWithIntl(<SearchPage {...defaultProps} {...extraProps} />);
  }

  describe('render', () => {
    test('renders SearchControls with correct props', () => {
      const searchControls = getWrapper().find(SearchControls);
      expect(searchControls.length).to.equal(1);
      expect(searchControls.prop('location')).to.deep.equal(defaultProps.location);
      expect(searchControls.prop('params')).to.deep.equal(defaultProps.match.params);
    });

    test('renders PageWrapper with correct props', () => {
      const pageWrapper = getWrapper().find(PageWrapper);
      expect(pageWrapper).to.have.length(1);
      expect(pageWrapper.prop('className')).to.equal('app-SearchPage__wrapper');
      expect(pageWrapper.prop('title')).to.equal('SearchPage.title');
      expect(pageWrapper.prop('transparent')).to.be.true;
    });

    test('renders a MapToggle component with correct props', () => {
      const mapToggle = getWrapper().find(MapToggle);
      expect(mapToggle).to.have.length(1);
      expect(mapToggle.props()).to.deep.equal({
        mapVisible: defaultProps.showMap,
        onClick: defaultProps.actions.toggleMap,
        resultCount: defaultProps.resultCount,
      });
    });

    test('renders a ResourceMap with correct props', () => {
      const props = {
        searchResultIds: Immutable(['resource-1', 'resource-2']),
        selectedUnitId: '123',
        showMap: true,
      };
      const resourceMap = getWrapper(props).find(ResourceMap);
      expect(resourceMap).to.have.length(1);
      expect(resourceMap.prop('showMap')).to.equal(true);
      expect(resourceMap.prop('resourceIds')).to.deep.equal(props.searchResultIds);
      expect(resourceMap.prop('selectedUnitId')).to.equal(props.selectedUnitId);
    });

    describe('SearchResults', () => {
      function getSearchResults(props) {
        return getWrapper(props).find(SearchResults);
      }

      test('are not rendered when no search has been done', () => {
        const isFetchingSearchResults = false;
        const searchDone = false;
        const searchResults = getSearchResults({ isFetchingSearchResults, searchDone });
        expect(searchResults.length).to.equal(0);
      });

      test('are rendered when fetching search results', () => {
        const isFetchingSearchResults = true;
        const searchDone = false;
        const searchResults = getSearchResults({ isFetchingSearchResults, searchDone });
        expect(searchResults.props().isFetching).to.equal(isFetchingSearchResults);
        expect(searchResults.props().searchResultIds).to.deep.equal(defaultProps.searchResultIds);
      });

      test('are rendered when search is done', () => {
        const isFetchingSearchResults = false;
        const searchDone = true;
        const searchResults = getSearchResults({ isFetchingSearchResults, searchDone });
        expect(searchResults.props().isFetching).to.equal(isFetchingSearchResults);
        expect(searchResults.props().resultCount).to.equal(defaultProps.resultCount);
        expect(searchResults.props().searchResultIds).to.deep.equal(defaultProps.searchResultIds);
        expect(searchResults.props().showMap).to.equal(defaultProps.showMap);
      });
    });
  });

  describe('componentDidMount', () => {
    function callComponentDidMount(props, extraActions) {
      const actions = { ...defaultProps.actions, ...extraActions };
      const instance = getWrapper({ ...props, actions }).instance();
      instance.componentDidMount();
    }

    test('fetches resources if searchDone is false', () => {
      const searchResources = simple.mock();
      callComponentDidMount({ searchDone: false }, { searchResources });
      expect(searchResources.callCount).to.equal(1);
      expect(searchResources.lastCall.args).to.deep.equal([defaultProps.filters]);
    });

    test('fetches resources if ui filters do not match url filters', () => {
      const searchResources = simple.mock();
      const props = {
        filters: { people: 1 },
        uiFilters: { people: 2 },
        searchDone: true,
      };
      callComponentDidMount(props, { searchResources });
      expect(searchResources.callCount).to.equal(1);
      expect(searchResources.lastCall.args).to.deep.equal([props.filters]);
    });

    test('does not fetch resources otherwise', () => {
      const searchResources = simple.mock();
      callComponentDidMount({ searchDone: true }, { searchResources });
      expect(searchResources.callCount).to.equal(0);
    });

    test('fetches units', () => {
      const fetchUnits = simple.mock();
      callComponentDidMount({}, { fetchUnits });
      expect(fetchUnits.callCount).to.equal(1);
    });

    describe('scrolls to correct position', () => {
      const setTimeoutMock = simple.mock();
      const scrollToMock = simple.mock();
      const scrollTop = 123;

      beforeAll(() => {
        const location = { state: { scrollTop } };
        const props = Object.assign({}, defaultProps, { location });
        simple.mock(window, 'setTimeout', setTimeoutMock);
        simple.mock(window, 'scrollTo', scrollToMock);
        callComponentDidMount(props, {});
      });

      afterAll(() => {
        simple.restore();
      });

      test('calls setTimeout and scrolls to correct position', () => {
        expect(setTimeoutMock.callCount).to.equal(1);
        const args = setTimeoutMock.lastCall.args;
        expect(args).to.have.length(2);
        expect(typeof args[0]).to.equal('function');
        args[0]();
        expect(scrollToMock.callCount).to.equal(1);
        const args2 = scrollToMock.lastCall.args;
        expect(args2).to.have.length(2);
        expect(args2[0]).to.equal(0);
        expect(args2[1]).to.equal(scrollTop);
      });
    });
  });

  describe('componentWillUpdate', () => {
    describe('if isLoggedIn changed', () => {
      let nextProps;

      beforeAll(() => {
        defaultProps.actions.changeSearchFilters.reset();
        defaultProps.actions.searchResources.reset();
        const instance = getWrapper().instance();
        nextProps = {
          filters: defaultProps.filters,
          isLoggedIn: !defaultProps.isLoggedIn,
          location: defaultProps.location,
          position: null,
          url: '/?search=some-search',
        };
        instance.componentWillUpdate(nextProps);
      });

      test('refetches search results', () => {
        expect(defaultProps.actions.searchResources.callCount).to.equal(1);
      });

      test('does not update search filters in state', () => {
        expect(defaultProps.actions.changeSearchFilters.callCount).to.equal(0);
      });
    });

    describe('if search filters did change and url has query part', () => {
      let nextProps;

      beforeAll(() => {
        defaultProps.actions.changeSearchFilters.reset();
        defaultProps.actions.searchResources.reset();
        const instance = getWrapper().instance();
        nextProps = {
          filters: { purpose: 'new-purpose' },
          isLoggedIn: defaultProps.isLoggedIn,
          location: defaultProps.location,
          position: null,
          url: '/?purpose=new-purpose',
        };
        instance.componentWillUpdate(nextProps);
      });

      test('updates search filters in state with the new filters', () => {
        const actualArg = defaultProps.actions.changeSearchFilters.lastCall.args[0];

        expect(defaultProps.actions.changeSearchFilters.callCount).to.equal(1);
        expect(actualArg).to.deep.equal(nextProps.filters);
      });

      test('searches resources with given filters', () => {
        const actualArg = defaultProps.actions.searchResources.lastCall.args[0];

        expect(defaultProps.actions.searchResources.callCount).to.equal(1);
        expect(actualArg).to.deep.equal(nextProps.filters);
      });
    });

    describe('if search filters did not change', () => {
      let nextProps;

      beforeAll(() => {
        defaultProps.actions.changeSearchFilters.reset();
        defaultProps.actions.searchResources.reset();
        const instance = getWrapper().instance();
        nextProps = {
          filters: defaultProps.filters,
          isLoggedIn: defaultProps.isLoggedIn,
          location: defaultProps.location,
          position: null,
          url: '/?search=some-search',
        };
        instance.componentWillUpdate(nextProps);
      });

      test('does not update search filters in state', () => {
        expect(defaultProps.actions.changeSearchFilters.callCount).to.equal(0);
      });

      test('does not do a search', () => {
        expect(defaultProps.actions.searchResources.callCount).to.equal(0);
      });
    });

    describe('if position changed', () => {
      let nextProps;

      beforeAll(() => {
        defaultProps.actions.changeSearchFilters.reset();
        defaultProps.actions.searchResources.reset();
        const instance = getWrapper().instance();
        nextProps = {
          filters: defaultProps.filters,
          isLoggedIn: defaultProps.isLoggedIn,
          location: defaultProps.location,
          position: {
            lat: 12,
            lon: 11,
          },
        };
        instance.componentWillUpdate(nextProps);
      });

      test('refetches search results', () => {
        expect(defaultProps.actions.searchResources.callCount).to.equal(1);
      });

      test('includes position argument on searchResources call', () => {
        expect(defaultProps.actions.searchResources.lastCall.args[0].lat).to.equal(12);
        expect(defaultProps.actions.searchResources.lastCall.args[0].lon).to.equal(11);
      });
    });

    describe('if location state changed', () => {
      beforeAll(() => {
        simple.mock(window, 'scrollTo');
        const instance = getWrapper().instance();
        const nextProps = {
          filters: defaultProps.filters,
          isLoggedIn: defaultProps.isLoggedIn,
          location: {
            state: null,
          },
          position: defaultProps.position,
        };
        instance.componentWillUpdate(nextProps);
      });

      afterAll(() => {
        simple.restore();
      });

      test('scrolls to top of page', () => {
        expect(window.scrollTo.callCount).to.equal(1);
        expect(window.scrollTo.lastCall.args).to.deep.equal([0, 0]);
      });
    });
  });
});
