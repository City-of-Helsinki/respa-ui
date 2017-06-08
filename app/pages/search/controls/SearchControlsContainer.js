import moment from 'moment';
import queryString from 'query-string';
import React, { Component, PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import { fetchPurposes } from 'actions/purposeActions';
import { changeSearchFilters } from 'actions/uiActions';
import constants from 'constants/AppConstants';
import { injectT } from 'i18n';
import DatePickerControl from './DatePickerControl';
import PeopleCapacityControl from './PeopleCapacityControl';
import PurposeControl from './PurposeControl';
import searchControlsSelector from './searchControlsSelector';

class UnconnectedSearchControlsContainer extends Component {
  constructor(props) {
    super(props);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleFiltersChange = this.handleFiltersChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
  }

  componentDidMount() {
    const { actions, urlSearchFilters } = this.props;

    actions.changeSearchFilters(urlSearchFilters);
    actions.fetchPurposes();
  }

  handleDateChange(date) {
    const dateInCorrectFormat = (
      moment(date, 'L').format(constants.DATE_FORMAT)
    );
    this.handleFiltersChange({ date: dateInCorrectFormat });
  }

  handleFiltersChange(newFilters) {
    this.props.actions.changeSearchFilters(newFilters);
  }

  handleSearch(newFilters, options = {}) {
    const { scrollToSearchResults } = this.props;
    let filters;
    if (newFilters) {
      filters = Object.assign({}, this.props.filters, newFilters);
    } else {
      filters = this.props.filters;
    }

    browserHistory.push(`/search?${queryString.stringify(filters)}`);
    if (!options.preventScrolling) {
      scrollToSearchResults();
    }
  }

  handleSearchInputChange(event) {
    const value = event.target.value;
    this.handleFiltersChange({ search: value });
    if (event.keyCode === 13) {
      this.handleSearch();
    }
  }

  render() {
    const {
      filters,
      isFetchingPurposes,
      purposeOptions,
      t,
    } = this.props;

    return (
      <div className="app-SearchControlsContainer">
        <FormControl
          autoFocus={!filters.purpose}
          className="app-SearchControlsContainer__search-box"
          onChange={event => this.handleFiltersChange({ search: event.target.value })}
          onKeyUp={this.handleSearchInputChange}
          placeholder={t('SearchControls.searchPlaceholder')}
          type="text"
          value={filters.search}
        />
        <div className="app-SearchControlsContainer__filters">
          <DatePickerControl
            onChange={this.handleDateChange}
            value={moment(filters.date).format('L')}
          />
          <PeopleCapacityControl
            onChange={people => this.handleFiltersChange({ people })}
            value={parseInt(filters.people, 10)}
          />
          <PurposeControl
            isLoading={isFetchingPurposes}
            onChange={this.handleFiltersChange}
            purposeOptions={purposeOptions}
            value={filters.purpose}
          />
        </div>
        <Button
          block
          bsStyle="primary"
          className="search-button"
          onClick={() => this.handleSearch()}
        >
          {t('SearchControls.search')}
        </Button>
      </div>
    );
  }
}

UnconnectedSearchControlsContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  isFetchingPurposes: PropTypes.bool.isRequired,
  purposeOptions: PropTypes.array.isRequired,
  scrollToSearchResults: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  urlSearchFilters: PropTypes.object.isRequired,
};

UnconnectedSearchControlsContainer = injectT(UnconnectedSearchControlsContainer);  // eslint-disable-line

function mapDispatchToProps(dispatch) {
  const actionCreators = {
    changeSearchFilters,
    fetchPurposes,
  };

  return { actions: bindActionCreators(actionCreators, dispatch) };
}

export { UnconnectedSearchControlsContainer };
export default connect(searchControlsSelector, mapDispatchToProps)(
  UnconnectedSearchControlsContainer
);
