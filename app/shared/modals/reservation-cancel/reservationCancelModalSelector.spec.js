import { expect } from 'chai';

import ActionTypes from 'constants/ActionTypes';
import ModalTypes from 'constants/ModalTypes';
import { getState } from 'utils/testUtils';
import reservationCancelModalSelector from './reservationCancelModalSelector';

describe('shared/modals/reservation-cancel/reservationCancelModalSelector', () => {
  function getSelected(extraState) {
    const state = getState(extraState);
    return reservationCancelModalSelector(state);
  }

  it('returns isAdmin', () => {
    expect(getSelected().isAdmin).to.exist;
  });

  describe('isCancellingReservations', () => {
    it('returns true if RESERVATION_DELETE_REQUEST is active', () => {
      const activeRequests = { [ActionTypes.API.RESERVATION_DELETE_REQUEST]: 1 };
      const selected = getSelected({
        'api.activeRequests': activeRequests,
      });
      expect(selected.isCancellingReservations).to.be.true;
    });

    it('returns false if RESERVATION_DELETE_REQUEST is not active', () => {
      expect(getSelected().isCancellingReservations).to.be.false;
    });
  });

  it('returns reservationsToCancel from the state', () => {
    const reservationsToCancel = [{ id: 'r-1' }, { id: 'r-2' }];
    const selected = getSelected({
      'ui.reservations.toCancel': reservationsToCancel,
    });
    expect(selected.reservationsToCancel).to.deep.equal(reservationsToCancel);
  });

  it('returns resources from the state', () => {
    expect(getSelected().resources).to.exist;
  });

  describe('show', () => {
    it('returns true if modals.open contain RESERVATION_CANCEL', () => {
      const selected = getSelected({
        'ui.modals.open': [ModalTypes.RESERVATION_CANCEL],
      });
      expect(selected.show).to.be.true;
    });

    it('returns false if modals.open does not contain RESERVATION_CANCEL', () => {
      const selected = getSelected({
        'ui.modals.open': [],
      });
      expect(selected.show).to.be.false;
    });
  });
});
