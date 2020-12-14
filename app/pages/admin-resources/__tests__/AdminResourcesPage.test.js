import React from 'react';
import Loader from 'react-loader';
import simple from 'simple-mock';

import PageWrapper from '../../PageWrapper';
import AvailabilityView from '../../../shared/availability-view/AvailabilityView';
import ResourceTypeFilter from '../../../shared/resource-type-filter/ResourceTypeFilterContainer';
import { shallowWithIntl } from '../../../utils/testUtils';
import { UnconnectedAdminResourcesPage as AdminResourcesPage } from '../AdminResourcesPage';

describe('pages/admin-resources/AdminResourcesPage', () => {
  const changeAdminResourcesPageDate = simple.stub();
  const fetchFavoritedResources = simple.stub();
  const fetchUnits = simple.stub();
  const selectAdminResourceType = simple.stub();
  const openConfirmReservationModal = simple.stub();
  const unselectAdminResourceType = simple.stub();
  const myPremisesSetSelectedTimeSlots = simple.stub();

  const defaultProps = {
    actions: {
      changeAdminResourcesPageDate,
      changeRecurringBaseTime: () => null,
      fetchFavoritedResources,
      fetchUnits,
      selectAdminResourceType,
      openConfirmReservationModal,
      unselectAdminResourceType,
      myPremisesSetSelectedTimeSlots,
    },
    date: '2017-01-10',
    selectedResourceTypes: [],
    isAdmin: true,
    isLoggedin: true,
    isFetchingResources: false,
    location: { id: '123' },
    resources: [],
    resourceTypes: ['a', 'b', 'c'],
  };

  function getWrapper(extraProps = {}) {
    return shallowWithIntl(<AdminResourcesPage {...defaultProps} {...extraProps} />);
  }

  describe('rendering', () => {
    test('renders PageWrapper with correct props', () => {
      const pageWrapper = getWrapper().find(PageWrapper);
      expect(pageWrapper).toHaveLength(1);
      expect(pageWrapper.prop('className')).toBe('admin-resources-page');
      expect(pageWrapper.prop('title')).toBe('AdminResourcesPage.adminTitle');
    });

    describe('when user is not admin', () => {
      let wrapper;
      beforeAll(() => {
        wrapper = getWrapper({ isAdmin: false });
      });

      test('renders a paragraph', () => {
        expect(wrapper.find('p')).toHaveLength(1);
      });
    });

    describe('when user is an admin', () => {
      function getIsAdminWrapper(props) {
        return getWrapper({ ...props, isAdmin: true });
      }

      test('displays correct title inside h1 tags', () => {
        const h1 = getIsAdminWrapper().find('h1');
        expect(h1.text()).toBe('AdminResourcesPage.adminTitle');
      });

      describe('Loader', () => {
        test(
          'is not loaded if fetching resources and no resources in the state',
          () => {
            const props = { isFetchingResources: true, resources: [] };
            const loader = getIsAdminWrapper(props).find(Loader);
            expect(loader.prop('loaded')).toBe(false);
          },
        );

        test('is loaded if not fetching resource', () => {
          const props = { isFetchingResources: false, resources: [] };
          const loader = getIsAdminWrapper(props).find(Loader);
          expect(loader.prop('loaded')).toBe(true);
        });

        test('is loaded if resources in state', () => {
          const props = { isFetchingResources: true, resources: [{ id: 'r-1' }] };
          const loader = getIsAdminWrapper(props).find(Loader);
          expect(loader.prop('loaded')).toBe(true);
        });
      });

      test('renders AvailabilityView with correct props', () => {
        const resources = [{ foo: 'bar' }];
        const wrapper = getIsAdminWrapper({ resources });
        const view = wrapper.find(AvailabilityView);
        expect(view).toHaveLength(1);
        expect(view.prop('groups')).toEqual([
          { name: '', resources },
        ]);
        expect(view.prop('date')).toEqual('2017-01-10');
        expect(view.prop('onDateChange')).toBe(changeAdminResourcesPageDate);
        expect(view.prop('onSelect')).toBe(wrapper.instance().handleSelect);
      });

      test('renders ResourceTypeFilter with correct props', () => {
        const wrapper = getIsAdminWrapper();
        const resourceTypeFilter = wrapper.find(ResourceTypeFilter);
        expect(resourceTypeFilter).toHaveLength(1);
        expect(resourceTypeFilter.prop('selectedResourceTypes')).toEqual(defaultProps.selectedResourceTypes);
        expect(resourceTypeFilter.prop('resourceTypes')).toEqual(defaultProps.resourceTypes);
        expect(resourceTypeFilter.prop('onSelectResourceType')).toBe(selectAdminResourceType);
        expect(resourceTypeFilter.prop('onUnselectResourceType')).toBe(unselectAdminResourceType);
      });
    });
  });

  describe('componentDidMount', () => {
    describe('if user is an admin', () => {
      const isAdmin = true;
      const timer = 5;
      let instance;

      beforeAll(() => {
        fetchFavoritedResources.reset();
        simple.mock(window, 'setInterval').returnWith(timer);
        instance = getWrapper({ isAdmin }).instance();
        instance.componentDidMount();
      });

      afterAll(() => {
        simple.restore();
      });

      test('fetches favorited resources', () => {
        expect(fetchFavoritedResources.callCount).toBe(1);
      });

      test('fetches date\'s resources', () => {
        const args = fetchFavoritedResources.lastCall.args;
        expect(args[0].format('YYYY-MM-DD')).toBe('2017-01-10');
      });

      test('passes adminResourcesPage as source', () => {
        const args = fetchFavoritedResources.lastCall.args;
        expect(args[1]).toBe('adminResourcesPage');
      });

      test('starts fetching resources every ten minutes', () => {
        expect(window.setInterval.callCount).toBe(1);
        const interval = 10 * 60 * 1000;
        expect(window.setInterval.lastCall.args).toEqual([instance.fetchResources, interval]);
      });

      test('saves interval to this.updateResourcesTimer', () => {
        expect(instance.updateResourcesTimer).toBe(timer);
      });
    });
  });

  describe('componentWillReceiveProps', () => {
    let instance;

    beforeAll(() => {
      instance = getWrapper().instance();
      instance.fetchResources = simple.mock();
    });

    afterEach(() => {
      instance.fetchResources.reset();
    });

    afterAll(() => {
      simple.restore();
    });

    test('does not call fetchResources if props have not changed', () => {
      instance.componentWillReceiveProps(defaultProps);
      expect(instance.fetchResources.callCount).toBe(0);
    });

    test('calls fetchResources if props have changed date', () => {
      instance.componentWillReceiveProps({ ...defaultProps, date: '2017-01-12' });
      expect(instance.fetchResources.callCount).toBe(1);
      expect(instance.fetchResources.lastCall.args).toEqual(['2017-01-12']);
    });

    test('calls fetchResources if props have changed location', () => {
      instance.componentWillReceiveProps({ ...defaultProps, location: { id: '321' } });
      expect(instance.fetchResources.callCount).toBe(1);
      expect(instance.fetchResources.lastCall.args).toEqual([defaultProps.date]);
    });
  });

  describe('componentWillUnmount', () => {
    const timer = 5;
    let instance;

    beforeAll(() => {
      changeAdminResourcesPageDate.reset();
      simple.mock(window, 'setInterval').returnWith(timer);
      simple.mock(window, 'clearInterval').returnWith(timer);
      instance = getWrapper().instance();
      instance.componentDidMount();
      instance.componentWillUnmount();
    });

    afterAll(() => {
      simple.restore();
    });

    test('sets date to null', () => {
      expect(changeAdminResourcesPageDate.callCount).toBe(1);
      expect(changeAdminResourcesPageDate.lastCall.args).toEqual([null]);
    });

    test('it clears fetchResources interval', () => {
      expect(window.clearInterval.callCount).toBe(1);
      expect(window.clearInterval.lastCall.args).toEqual([timer]);
    });
  });

  describe('handleSelect', () => {
    test('saves selection to state', () => {
      const wrapper = getWrapper();
      const selection = { some: 'data' };
      wrapper.instance().handleSelect(selection);
      expect(wrapper.state()).toEqual({ selection });
    });

    test('calls changeRecurringBaseTime with correct time', () => {
      const changeRecurringBaseTime = simple.mock();
      const selection = {
        begin: '2017-04-21T12:00:00+03:00',
        end: '2017-04-21T13:00:00+03:00',
        resourceId: 'r-1',
      };
      const actions = { ...defaultProps.actions, changeRecurringBaseTime };
      const wrapper = getWrapper({ actions });
      wrapper.instance().handleSelect(selection);
      expect(changeRecurringBaseTime.callCount).toBe(1);
      expect(changeRecurringBaseTime.lastCall.args).toEqual([selection]);
    });

    test('opens the confirm reservation modal', () => {
      openConfirmReservationModal.reset();
      const wrapper = getWrapper();
      wrapper.instance().handleSelect({});
      expect(openConfirmReservationModal.callCount).toBe(1);
    });
  });
});
