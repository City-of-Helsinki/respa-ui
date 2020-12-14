import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Pagination from '../../../../src/common/pagination/Pagination';
import injectT from '../../../i18n/injectT';
import ReservationListItem from './ReservationListItem';
import reservationListSelector from './reservationListSelector';

class UnconnectedReservationListContainer extends Component {
  constructor(props) {
    super(props);
    this.renderReservationListItem = this.renderReservationListItem.bind(this);
  }

  renderReservationListItem(reservation) {
    const {
      isAdmin,
    } = this.props;

    return (
      <ReservationListItem
        isAdmin={isAdmin}
        key={reservation.url}
        reservation={reservation}
      />
    );
  }

  render() {
    const {
      emptyMessage,
      reservations,
      page,
      pages,
      t,
    } = this.props;

    if (reservations.length <= 0) return <p>{emptyMessage || t('ReservationListContainer.emptyMessage')}</p>;

    return (
      <>
        <ul className="reservation-list">
          {reservations.map(this.renderReservationListItem)}
        </ul>
        <Pagination
          onChange={this.props.onPageChange}
          page={page}
          pages={pages}
        />
      </>
    );
  }
}

UnconnectedReservationListContainer.propTypes = {
  emptyMessage: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  reservations: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
};
UnconnectedReservationListContainer = injectT(UnconnectedReservationListContainer);  // eslint-disable-line

export { UnconnectedReservationListContainer };
export default connect(reservationListSelector)(UnconnectedReservationListContainer);
