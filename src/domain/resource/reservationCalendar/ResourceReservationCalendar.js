import * as React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

import { addNotification as addNotificationAction } from '../../../../app/actions/notificationsActions';
import injectT from '../../../../app/i18n/injectT';
import TimePickerCalendar from '../../../common/calendar/TimePickerCalendar';
import * as resourceUtils from '../utils';
import { notLoggedInErrorNotification } from '../../../common/calendar/constants';

class UntranslatedResourceReservationCalendar extends React.Component {
  calendarRef = React.createRef();

  static propTypes = {
    addNotification: PropTypes.func,
    date: PropTypes.string,
    isLoggedIn: PropTypes.bool,
    onDateChange: PropTypes.func.isRequired,
    onReserve: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    selected: null,
  };

  getDurationText = () => {
    const { selected } = this.state;
    const start = moment(selected.start);
    const end = moment(selected.end);
    const duration = moment.duration(end.diff(start));
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();

    let text = '';
    if (days) {
      text = `${days}d`;
    }

    if (hours) {
      text += `${hours}h`;
    }

    if (minutes) {
      text += `${minutes}min`;
    }

    return text;
  };

  getSelectedDateText = () => {
    const { t, resource } = this.props;
    const { selected } = this.state;

    if (selected) {
      const start = moment(selected.start);
      const end = moment(selected.end);
      const price = resourceUtils.getReservationPrice(selected.start, selected.end, resource);

      const tVariables = {
        date: start.format('dd D.M.Y'),
        start: start.format('HH:mm'),
        end: end.format('HH:mm'),
        duration: this.getDurationText(),
        price,
      };

      if (price) {
        return t('ResourceReservationCalendar.selectedDateValueWithPrice', tVariables);
      }

      return t('ResourceReservationCalendar.selectedDateValue', tVariables);
    }

    return '';
  };

  onReserveButtonClick = () => {
    const {
      addNotification,
      isLoggedIn,
      onReserve,
      resource,
      t,
    } = this.props;
    const { selected } = this.state;

    if (isLoggedIn) {
      onReserve(selected, resource);
    } else {
      addNotification(notLoggedInErrorNotification(t));
    }
  }

  render() {
    const {
      date,
      resource,
      t,
      onDateChange,
      addNotification
    } = this.props;

    const {
      selected,
    } = this.state;

    return (
      <div className="app-ResourceReservationCalendar">
        <TimePickerCalendar
          addNotification={addNotification}
          date={date}
          onDateChange={onDateChange}
          onTimeChange={selectedTime => this.setState({ selected: selectedTime })}
          resource={resource}
        />
        {selected && (
          <div className="app-ResourceReservationCalendar__selectedInfo">
            <div className="app-ResourceReservationCalendar__selectedDate">
              <strong className="app-ResourceReservationCalendar__selectedDateLabel">
                {t('ResourceReservationCalendar.selectedDateLabel')}
              </strong>
              {' '}
              <span className="app-ResourceReservationCalendar__selectedDateValue">
                {this.getSelectedDateText()}
              </span>
            </div>
            <Button
              bsStyle="primary"
              className="app-ResourceReservationCalendar__reserveButton"
              disabled={isEmpty(selected)}
              onClick={this.onReserveButtonClick}
            >
              {t('ResourceReservationCalendar.reserveButton')}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

const actions = { addNotification: addNotificationAction };

export { UntranslatedResourceReservationCalendar };

export default connect(null, actions)(injectT(UntranslatedResourceReservationCalendar));
