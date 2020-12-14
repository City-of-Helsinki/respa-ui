import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Modal from 'react-bootstrap/lib/Modal';

import constants from '../../../constants/AppConstants';
import { resourceRoles, resourcePermissionTypes } from '../../../../src/domain/resource/permissions/constants';
import { hasPermissionForResource } from '../../../../src/domain/resource/permissions/utils';
import injectT from '../../../i18n/injectT';
import ReservationCancelModal from '../reservation-cancel/ReservationCancelModalContainer';
import InfoLabel from '../../../../src/common/label/InfoLabel';
import { isStaffEvent, getEditReservationUrl } from '../../../utils/reservationUtils';
import ReservationEditForm from './ReservationEditForm';
import { hasProducts } from '../../../utils/resourceUtils';
import { RESERVATION_STATE } from '../../../../src/constants/ReservationState';

class ReservationInfoModal extends Component {
  constructor(props) {
    super(props);
    this.commentsInput = React.createRef();

    this.handleEditFormSubmit = this.handleEditFormSubmit.bind(this);
    this.handleSaveCommentsClick = this.handleSaveCommentsClick.bind(this);
    this.handleStartEditClick = this.handleStartEditClick.bind(this);
  }

  handleEditFormSubmit(values) {
    const { onEditFormSubmit, reservation, resource } = this.props;
    const staffEvent = isStaffEvent(reservation, resource);
    onEditFormSubmit({ ...reservation, ...values, staffEvent });
  }

  handleSaveCommentsClick() {
    const comments = this.commentsInput.value;
    this.props.onSaveCommentsClick(comments);
  }

  handleStartEditClick() {
    const {
      selectReservationToEdit, reservation, resource, history,
    } = this.props;

    if (!resource === null) {
      return;
    }

    const nextUrl = getEditReservationUrl(reservation);

    selectReservationToEdit({ reservation, slotSize: resource.slot_size });
    history.push(nextUrl);
  }

  render() {
    const {
      hideReservationInfoModal,
      isAdmin,
      isEditing,
      isSaving,
      userUnitRole,
      onCancelClick,
      onCancelEditClick,
      onConfirmClick,
      onDenyClick,
      reservation,
      reservationIsEditable,
      resource,
      show,
      t,
    } = this.props;

    const disabled = isSaving || isEditing;
    const canComment = hasPermissionForResource(userUnitRole, resourcePermissionTypes.CAN_COMMENT_RESERVATIONS);
    const canViewComment = hasPermissionForResource(
      userUnitRole,
      resourcePermissionTypes.CAN_ACCESS_RESERVATION_COMMENTS,
    );
    const canModify = hasPermissionForResource(userUnitRole, resourcePermissionTypes.CAN_MODIFY_RESERVATIONS);
    const showCancelButton = reservationIsEditable && (
      reservation.state === RESERVATION_STATE.CONFIRMED
      || (reservation.state === RESERVATION_STATE.REQUESTED && !isAdmin)
    );
    const paymentLabel = constants.RESERVATION_PAYMENT_LABELS[reservation.state];
    const stateLabel = constants.RESERVATION_STATE_LABELS[reservation.state];

    return (
      <Modal
        className="reservation-info-modal"
        onHide={hideReservationInfoModal}
        show={show}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('ReservationInfoModal.title')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!isEmpty(reservation)
            && (
            <div>
              <div className="reservation-labels-wrapper">
                {hasProducts(resource)
                  && paymentLabel
                  && !reservation.staffEvent && (
                    <InfoLabel labelStyle={paymentLabel.labelBsStyle} labelText={t(paymentLabel.labelTextId)} />
                )}
                {stateLabel && <InfoLabel labelStyle={stateLabel.labelBsStyle} labelText={t(stateLabel.labelTextId)} />}
              </div>
              <ReservationEditForm
                enableReinitialize
                initialValues={reservation}
                isAdmin={isAdmin}
                isEditing={isEditing}
                isSaving={isSaving}
                onCancelEditClick={onCancelEditClick}
                onStartEditClick={this.handleStartEditClick}
                onSubmit={this.handleEditFormSubmit}
                reservation={reservation}
                reservationIsEditable={reservationIsEditable}
                resource={resource}
                userUnitRole={userUnitRole}
              />
              {canViewComment && reservationIsEditable && (
                <form className="comments-form">
                  <FormGroup controlId="commentsTextarea">
                    <ControlLabel>
                      {t('common.commentsLabel')}
  :
                    </ControlLabel>
                    <FormControl
                      componentClass="textarea"
                      defaultValue={reservation.comments}
                      disabled={disabled || !canComment}
                      // eslint-disable-next-line no-return-assign
                      inputRef={ref => this.commentsInput = ref}
                      placeholder={t('common.commentsPlaceholder')}
                      rows={5}
                    />
                  </FormGroup>
                  {canComment && (
                    <div className="form-controls">
                      <Button
                        bsStyle="primary"
                        disabled={disabled}
                        onClick={this.handleSaveCommentsClick}
                      >
                        {isSaving ? t('common.saving') : t('ReservationInfoModal.saveComment')}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </div>
            )
          }
        </Modal.Body>

        <Modal.Footer>
          <Button
            bsStyle="default"
            onClick={hideReservationInfoModal}
          >
            {t('common.back')}
          </Button>
          {canModify && reservationIsEditable && reservation.state === 'requested' && (
            <Button
              bsStyle="danger"
              disabled={disabled}
              onClick={onDenyClick}
            >
              {t('ReservationInfoModal.denyButton')}
            </Button>
          )}
          {canModify && reservationIsEditable && reservation.state === 'requested' && (
            <Button
              bsStyle="success"
              disabled={disabled}
              onClick={onConfirmClick}
            >
              {t('ReservationInfoModal.approveButton')}
            </Button>
          )}
          {showCancelButton && (
            <Button
              bsStyle="danger"
              disabled={disabled}
              onClick={onCancelClick}
            >
              {t('ReservationInfoModal.cancelButton')}
            </Button>
          )}
        </Modal.Footer>
        <ReservationCancelModal />
      </Modal>
    );
  }
}

ReservationInfoModal.propTypes = {
  hideReservationInfoModal: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  // this prop is null until the user selects a reservation
  userUnitRole: PropTypes.oneOf([...Object.values(resourceRoles), null]),
  onCancelClick: PropTypes.func.isRequired,
  onCancelEditClick: PropTypes.func.isRequired,
  onConfirmClick: PropTypes.func.isRequired,
  onDenyClick: PropTypes.func.isRequired,
  onEditFormSubmit: PropTypes.func.isRequired,
  onSaveCommentsClick: PropTypes.func.isRequired,
  reservation: PropTypes.object.isRequired,
  reservationIsEditable: PropTypes.bool.isRequired,
  resource: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  selectReservationToEdit: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default injectT(ReservationInfoModal);
