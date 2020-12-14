import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import get from 'lodash/get';
import classNames from 'classnames';
import moment from 'moment';
import pick from 'lodash/pick';
import snakeCaseKeys from 'snakecase-keys';

import { batchAddReservations } from '../../actions/reservationActions';
import ReservationInfoModal from '../../shared/modals/reservation-info/ReservationInfoModalContainer';
import PageWrapper from '../PageWrapper';
import ReservationCancelModal from '../../shared/modals/reservation-cancel/ReservationCancelModalContainer';
import injectT from '../../i18n/injectT';
import userReservationsPageSelector from './userReservationsPageSelector';
import ReservationList from './reservation-list/ReservationListContainer';
import * as searchUtils from '../../../src/domain/search/utils';
import client from '../../../src/common/api/client';
import constants from '../../constants/AppConstants';

const PAGE_SIZE = 10;
// We request past reservations from the API by using the start and end
// parameters. When using one of these parameters, you also have to use
// the other. To get past reservations we are using the below value for
// the start parameter, and current datetime for the end parameter.
const ARBITRARY_START_DATETIME = '2000-01-01T00:00';
const UPCOMING_PARAMETERS = ['ordering'];
const PAST_PARAMETERS = ['all', 'ordering', 'start', 'end'];
const initialModelState = Object.freeze({
  data: [],
  loading: false,
  error: null,
});
const TABS = Object.freeze({
  UPCOMING: 'upcoming',
  PAST: 'past',
});

// This view uses its internal state to keep track of reservations.
// However, some components like modals or action buttons still make
// updates into the redux state. For a low area integration, we are
// preferring a version of the reservation object existing within the
// redux state. This way the actions targeting the redux state end up
// being reflected within the list. At the same time, we are still able
// to control the logic of the list (pagination, filtering, etc.)
// outside of the redux state, which is in line with the architectural
// trend in this repo.

// This approach may introduce some "cache" invalidation issues in the
// long run.
function injectReservationFromReduxState(
  naiveReservations = [],
  reduxReservations = {},
) {
  return naiveReservations.map((reservation) => {
    const reduxReservation = reduxReservations[reservation.url];
    const reduxReservationInSnakeCase = reduxReservation
      ? snakeCaseKeys(reduxReservation)
      : reduxReservation;

    if (!reduxReservation) {
      return reservation;
    }

    return {
      ...reservation,
      ...reduxReservationInSnakeCase,
      resource: reservation.resource,
    };
  });
}

class UnconnectedUserReservationsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      upcomingReservation: {
        ...this.initialModelState,
        loading: true,
        count: 0,
      },
      pastReservation: {
        ...this.initialModelState,
        count: 0,
      },
      tab: TABS.UPCOMING,
    };
  }

  componentDidMount() {
    this.loadUpcomingReservations();
  }

  get initialModelState() {
    return initialModelState;
  }

  get isLoading() {
    const { upcomingReservation, pastReservation } = this.state;

    return upcomingReservation.loading || pastReservation.loading;
  }

  get filters() {
    return searchUtils.getFiltersFromUrl(this.props.location, false);
  }

  get page() {
    const filterCache = this.filters;

    return filterCache && filterCache.page ? Number(filterCache.page) : 1;
  }

  get count() {
    if (this.tab === TABS.UPCOMING) {
      return this.state.upcomingReservation.count;
    }

    if (this.tab === TABS.PAST) {
      return this.state.pastReservation.count;
    }

    return 0;
  }

  get pages() {
    return Math.round(this.count / PAGE_SIZE);
  }

  get tab() {
    return this.state.tab;
  }

  get reservations() {
    const { reduxReservations } = this.props;

    if (this.tab === TABS.UPCOMING) {
      return injectReservationFromReduxState(
        this.state.upcomingReservation.data,
        reduxReservations,
      );
    }

    if (this.tab === TABS.PAST) {
      return injectReservationFromReduxState(
        this.state.pastReservation.data,
        reduxReservations,
      );
    }

    return [];
  }

  setModel = (name, data, cb) => {
    const currentState = get(this.state, name, {});

    this.setState(
      {
        [name]: {
          ...currentState,
          ...data,
        },
      },
      cb,
    );
  };

  loadModel = (name, params, mapResponseToState, stateName) => {
    const nameInState = stateName || name;

    this.setModel(nameInState, {
      loading: true,
    });

    client.get(name, params).then(async (response) => {
      const defaultNextState = {
        loading: false,
        data: get(response.data, 'results', []),
      };
      const customNextState = mapResponseToState
        ? await mapResponseToState(response)
        : {};

      this.setModel(nameInState, {
        ...defaultNextState,
        ...customNextState,
      });
    });
  };

  fetchReservations = (namespace, getFilters) => {
    const filters = getFilters ? getFilters(this.filters) : this.filters;
    const params = {
      ...filters,
      // Ignore default date search parameter because this view is not
      // date specific.
      date: undefined,
      page_size: PAGE_SIZE,
      include: 'resource_detail',
      is_own: true,
    };

    this.loadModel(
      'reservation',
      params,
      async (response) => {
        const reservationsWithSimpleResource = get(
          response.data,
          'results',
          [],
        );
        const resourceIds = reservationsWithSimpleResource.map(
          reservation => reservation.resource.id,
        );
        const completeResourcesResponses = await Promise.all(
          resourceIds.map(resourceId => client.get(`resource/${resourceId}`)),
        );
        const completeResources = completeResourcesResponses.map(
          resourceResponse => resourceResponse.data,
        );
        // By default the resource that is returned with a reservation
        // omits most of the fields. We need these fields most of the
        // time to be able to tell whether a reservation is paid or not
        // so we are just loading them here.
        const reservations = reservationsWithSimpleResource.map(
          (reservation) => {
            const resource = completeResources.find(
              completeResource => completeResource.id === reservation.resource.id,
            );

            return {
              ...reservation,
              resource,
            };
          },
        );

        // Here we are duplicating the loaded reservations into the
        // redux state. This makes them discoverable for some action
        // buttons and modals which are heavily tied to the redux state.
        // This is a relatively brittle approach to handle this and can
        // likely cause new issues later on.
        this.props.sendReservationsToRedux(reservations);

        return {
          count: response.data.count,
          data: reservations,
        };
      },
      `${namespace}Reservation`,
    );
  };

  loadUpcomingReservations = (getFilters) => {
    const getFilterWithDefaults = (defaultFilters) => {
      const filters = { ...defaultFilters, ordering: 'begin' };

      return getFilters ? getFilters(filters) : filters;
    };

    this.fetchReservations('upcoming', getFilterWithDefaults);
  };

  loadPastReservations = (getFilters) => {
    const getFilterWithDefaults = (defaultFilters) => {
      const now = moment().format(constants.DATETIME_FORMAT);
      const filters = {
        ...defaultFilters,
        all: true,
        ordering: '-begin',
        // Note that using this method to fetch a reservation has a
        // weakness: it'll also list currently ongoing reservations. By
        // common heuristics these should not be considered to be in the
        // past, but I could not find a more efficient way to find past
        // reservations.
        start: moment(ARBITRARY_START_DATETIME, 'YYYY-MM-DD[T]HH:mm').format(
          constants.DATETIME_FORMAT,
        ),
        end: now,
      };

      return getFilters ? getFilters(filters) : filters;
    };

    this.fetchReservations('past', getFilterWithDefaults);
  };

  handlePageChange = (newPage) => {
    const { history } = this.props;
    const filters = this.filters;
    const nextFilters = { ...filters, page: newPage };

    history.push({
      search: searchUtils.getSearchFromFilters(nextFilters),
    });

    if (this.tab === TABS.UPCOMING) {
      this.loadUpcomingReservations(defaultFilters => ({
        ...defaultFilters,
        ...nextFilters,
      }));
    }

    if (this.tab === TABS.PAST) {
      this.loadPastReservations(defaultFilters => ({
        ...defaultFilters,
        ...nextFilters,
      }));
    }
  };

  handleTabChange = (tab) => {
    if (this.tab === tab) {
      return;
    }

    const { history } = this.props;
    // Reset pagination
    const nextFilters = {};

    history.push({
      search: searchUtils.getSearchFromFilters(nextFilters),
    });

    this.setState({ tab });

    if (tab === TABS.UPCOMING) {
      this.loadUpcomingReservations(filters => pick(filters, UPCOMING_PARAMETERS));
    }

    if (tab === TABS.PAST) {
      this.loadPastReservations(filters => pick(filters, PAST_PARAMETERS));
    }
  };

  render() {
    const { t } = this.props;

    const upcomingReservationLoading = this.state.upcomingReservation.loading;
    const upcomingReservationCount = this.state.upcomingReservation.count;

    return (
      <div className="app-UserReservationPage">
        <PageWrapper
          className="app-UserReservationPage__wrapper"
          title={t('UserReservationsPage.title')}
          transparent={false}
        >
          <h1>{t('UserReservationsPage.title')}</h1>
          <div className="app-UserReservationPage__tabs">
            <button
              aria-selected={this.tab === TABS.UPCOMING}
              className={classNames('app-UserReservationPage__tab', {
                'app-UserReservationPage__tab--active':
                  this.tab === TABS.UPCOMING,
              })}
              onClick={() => this.handleTabChange(TABS.UPCOMING)}
              role="tab"
              type="button"
            >
              {t('ReservationListContainer.comingReservations')}
              {' '}
              {!upcomingReservationLoading
                ? `(${upcomingReservationCount})`
                : '(...)'}
            </button>
            <button
              aria-selected={this.tab === TABS.PAST}
              className={classNames('app-UserReservationPage__tab', {
                'app-UserReservationPage__tab--active':
                  this.tab === TABS.PAST,
              })}
              onClick={() => this.handleTabChange(TABS.PAST)}
              role="tab"
              type="button"
            >
              {t('ReservationListContainer.pastReservations')}
            </button>
          </div>
          <Loader loaded={!this.isLoading}>
            {/* In order to avoid mounting multiple instances of the
                same component, we change data instead of component
                instance. */}
            <ReservationList
              onPageChange={this.handlePageChange}
              page={this.page}
              pages={this.pages}
              reservations={this.reservations}
            />
          </Loader>
          <ReservationCancelModal />
          <ReservationInfoModal />
        </PageWrapper>
      </div>
    );
  }
}

UnconnectedUserReservationsPage.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func.isRequired,
  reduxReservations: PropTypes.object.isRequired,
  sendReservationsToRedux: PropTypes.func.isRequired,
};
UnconnectedUserReservationsPage = injectT(UnconnectedUserReservationsPage); // eslint-disable-line

function mapDispatch(dispatch) {
  return {
    sendReservationsToRedux: reservations => dispatch(batchAddReservations(reservations)),
  };
}

export { UnconnectedUserReservationsPage };
export default connect(
  userReservationsPageSelector,
  mapDispatch,
)(UnconnectedUserReservationsPage);
