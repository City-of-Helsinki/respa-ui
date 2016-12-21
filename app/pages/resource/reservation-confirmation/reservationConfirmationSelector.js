import { formValueSelector } from 'redux-form';
import { createStructuredSelector } from 'reselect';

import ActionTypes from 'constants/ActionTypes';
import ModalTypes from 'constants/ModalTypes';
import resourceSelector from 'state/selectors/resourceSelector';
import selectedReservationsSelector from 'state/selectors/selectedReservationsSelector';
import staffUnitsSelector from 'state/selectors/staffUnitsSelector';
import modalIsOpenSelectorFactory from 'state/selectors/factories/modalIsOpenSelectorFactory';
import requestIsActiveSelectorFactory from 'state/selectors/factories/requestIsActiveSelectorFactory';

const toEditSelector = state => state.ui.reservations.toEdit;
const staffEventSelectedSelector = state => (
  formValueSelector('preliminaryReservation')(state, 'staffEvent')
);

const reservationCalendarSelector = createStructuredSelector({
  confirmReservationModalIsOpen: modalIsOpenSelectorFactory(ModalTypes.RESERVATION_CONFIRM),
  isMakingReservations: requestIsActiveSelectorFactory(ActionTypes.API.RESERVATION_POST_REQUEST),
  reservationsToEdit: toEditSelector,
  resource: resourceSelector,
  selectedReservations: selectedReservationsSelector,
  staffEventSelected: staffEventSelectedSelector,
  staffUnits: staffUnitsSelector,
});

export default reservationCalendarSelector;
