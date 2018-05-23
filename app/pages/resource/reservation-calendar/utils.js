import { filter, first, last, orderBy, some } from 'lodash';
import moment from 'moment';

import constants from 'constants/AppConstants';

function getBeginOfSelection(selected) {
  return first(orderBy(selected, 'begin'));
}

function getEndOfSelection(selected) {
  return last(orderBy(selected, 'begin'));
}

function getNextDayFromDate(date) {
  return date ? moment(date).add(1, 'days').format(constants.DATE_FORMAT) : null;
}

function getNextWeeksDays(date) {
  const selectedWeekDay = moment(date).day();
  if (selectedWeekDay === 0) {
    return 2;
  } else if (selectedWeekDay === 6) {
    return 1;
  }
  return 0;
}

function getSecondDayFromDate(date) {
  return date ? moment(date).add(2, 'days').format(constants.DATE_FORMAT) : null;
}

function isInsideOpeningHours(slot, openingHours) {
  const date = moment(slot.start).format(constants.DATE_FORMAT);
  const slotOpeningHours = filter(openingHours, { date });
  return some(slotOpeningHours, opening => (
    moment(opening.opens).isSameOrBefore(slot.start) &&
    moment(slot.end).isSameOrBefore(opening.closes)
  ));
}

function isSlotAfterSelected(slot, selected) {
  const firstSelected = getBeginOfSelection(selected);
  return moment(firstSelected.begin).isSameOrBefore(slot.start);
}

function isSlotSelectable(slot, selected, resource, lastSelectableFound) {
  if (!slot || !selected || !selected.length || !resource) {
    return true;
  }
  if (lastSelectableFound) {
    return false;
  }
  const firstSelected = getBeginOfSelection(selected);
  if (slot.reserved) return false;
  if (selected.length === 1) {
    return moment(firstSelected.begin).isSame(slot.start, 'day');
  }
  return (
    moment(firstSelected.begin).isSame(slot.start, 'day') &&
    // moment(firstSelected.begin).isSameOrBefore(slot.start) &&
    (!resource.openingHours || isInsideOpeningHours(slot, resource.openingHours || []))
  );
}

function isSlotSelected(slot, selected) {
  if (!slot || !selected || !selected.length) {
    return false;
  }
  const firstSelected = getBeginOfSelection(selected);
  const lastSelected = getEndOfSelection(selected);
  return moment(firstSelected.begin).isSameOrBefore(slot.start) &&
    moment(lastSelected.end).isSameOrAfter(slot.end);
}

export default {
  getNextDayFromDate,
  getNextWeeksDays,
  getSecondDayFromDate,
  isInsideOpeningHours,
  isSlotAfterSelected,
  isSlotSelectable,
  isSlotSelected,
};
