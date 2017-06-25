import forEach from 'lodash/forEach';
import moment from 'moment';
import 'moment-range';
import React, { Component, PropTypes } from 'react';
import Select from 'react-select';

function updateWithTime(initialValue, time, timeFormat) {
  const timeMoment = moment(time, timeFormat);
  return moment(initialValue).set({
    hour: timeMoment.get('hour'),
    minute: timeMoment.get('minute'),
  }).toISOString();
}

class TimeControls extends Component {
  static propTypes = {
    begin: PropTypes.object.isRequired,
    end: PropTypes.object.isRequired,
    timeFormat: PropTypes.string,
    timeSlots: PropTypes.array,
  };

  static defaultProps = {
    timeFormat: 'HH:mm',
  };

  getBeginTimeOptions() {
    const { timeFormat, timeSlots } = this.props;
    const options = [];
    timeSlots.forEach((slot) => {
      if (!slot.reserved) {
        options.push({
          label: moment(slot.start).format(timeFormat),
          value: moment(slot.start).format(timeFormat),
        });
      }
    });
    return options;
  }

  getEndTimeOptions() {
    const { begin, timeFormat, timeSlots } = this.props;
    const firstPossibleIndex = timeSlots.findIndex(slot => (
      moment(slot.end).isAfter(begin.input.value)
    ));

    const options = [];
    forEach(timeSlots.slice(firstPossibleIndex), (slot) => {  // eslint-disable-line
      if (!slot.reserved) {
        options.push({
          label: moment(slot.end).format(timeFormat),
          value: moment(slot.end).format(timeFormat),
        });
      } else {
        return false;  // Exits the lodash forEach
      }
    });
    return options;
  }

  handleBeginTimeChange = ({ value }) => {
    const { begin, timeFormat } = this.props;
    if (value) {
      begin.input.onChange(
        updateWithTime(begin.input.value, value, timeFormat)
      );
    }
  }

  handleEndTimeChange = ({ value }) => {
    const { end, timeFormat } = this.props;
    if (value) {
      end.input.onChange(
        updateWithTime(end.input.value, value, timeFormat)
      );
    }
  }

  render() {
    const { begin, end, timeFormat } = this.props;

    return (
      <div className="app-TimeControls">
        <div className="app-TimeControls__begin-time-control">
          <Select
            clearable={false}
            name="app-TimeControls-begin-time-select"
            onChange={this.handleBeginTimeChange}
            options={this.getBeginTimeOptions()}
            placeholder=" "
            searchable
            value={moment(begin.input.value).format(timeFormat)}
          />
        </div>
        <div className="app-TimeControls__separator">-</div>
        <div className="app-TimeControls__end-time-control">
          <Select
            clearable={false}
            name="app-TimeControls-end-time-select"
            onChange={this.handleEndTimeChange}
            options={this.getEndTimeOptions()}
            placeholder=" "
            searchable
            value={moment(end.input.value).format(timeFormat)}
          />
        </div>
      </div>
    );
  }
}

export default TimeControls;
