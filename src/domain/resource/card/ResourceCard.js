import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import flowRight from 'lodash/flowRight';
import iconHome from 'hel-icons/dist/shapes/home.svg';
import iconMapMarker from 'hel-icons/dist/shapes/map-marker.svg';
import iconTicket from 'hel-icons/dist/shapes/ticket.svg';
import iconUser from 'hel-icons/dist/shapes/user-o.svg';
import iconHeart from 'hel-icons/dist/shapes/heart-o.svg';

import FontSizes from '../../../../app/constants/FontSizes';
import injectT from '../../../../app/i18n/injectT';
import iconMap from '../../../../app/assets/icons/map.svg';
import iconHeartFilled from '../../../../app/assets/icons/heart-filled.svg';
import iconAccessible from '../../../../app/assets/icons/accessibility-ok.svg';
import iconNotAccessible from '../../../../app/assets/icons/accessibility-error.svg';
import * as dataUtils from '../../../common/data/utils';
import * as urlUtils from '../../../common/url/utils';
import * as searchUtils from '../../search/utils';
import * as resourceUtils from '../utils';
import BackgroundImage from '../../../../app/shared/background-image/BackgroundImage';
import { getMainImage } from '../../../../app/utils/imageUtils';
import ResourceAvailability from '../availability/ResourceAvailability';
import UnpublishedLabel from '../../../../app/shared/label/unpublished/UnpublishedLabel';
import ResourceCardInfoCell from './ResourceCardInfoCell';
import { isLoggedInSelector } from '../../../../app/state/selectors/authSelectors';
import accessibilityPreferencesSelector from '../../../../app/state/selectors/accessibilityPreferencesSelector';

class ResourceCard extends React.Component {
  static propTypes = {
    date: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    unit: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    history: PropTypes.object,
    intl: intlShape.isRequired,
    isStacked: PropTypes.bool,
    isLoggedIn: PropTypes.bool,
    onFavoriteClick: PropTypes.func.isRequired,
    onFilterClick: PropTypes.func.isRequired,
    isNormalFontSize: PropTypes.bool,
    accessibilityPreferences: PropTypes.array.isRequired,
  };

  getResourcePageLink = () => {
    const { date, resource } = this.props;

    return {
      pathname: resourceUtils.getResourcePageLink(resource),
      search: date ? urlUtils.getSearch({ date }) : '',
      state: { fromSearchResults: true },
    };
  };

  onSearchClick = (filters) => {
    const { history } = this.props;
    history.push(searchUtils.getSearchPageLink(filters));
  };

  render() {
    const {
      date,
      isLoggedIn,
      isStacked,
      resource,
      onFavoriteClick,
      onFilterClick,
      unit,
      intl,
      t,
      isNormalFontSize,
      accessibilityPreferences,
    } = this.props;
    const locale = intl.locale;
    const typeName = resource.type
      ? dataUtils.getLocalizedFieldValue(resource.type.name, locale)
      : '';
    const accessibilityShortcomingsCount = searchUtils.getAccessibilityShortcomingsCount(
      resource,
      accessibilityPreferences,
    );

    return (
      <div
        className={classNames('app-resourceCard2', {
          'app-resourceCard2__stacked': isStacked,
          'app-resourceCard2--normal-font-size': isNormalFontSize,
        })}
      >
        <Link
          className={classNames('app-resourceCard2__image-link', {
            'app-resourceCard2__image-link--large-font-size': !isNormalFontSize,
          })}
          onClick={this.handleLinkClick}
          to={this.getResourcePageLink()}
        >
          <BackgroundImage
            height={420}
            image={getMainImage(resource.images)}
            width={700}
          />
        </Link>
        <div className="app-resourceCard2__content">
          <Link onClick={this.handleLinkClick} to={this.getResourcePageLink()}>
            <h3>
              {dataUtils.getLocalizedFieldValue(resource.name, locale, true)}
            </h3>
            <div className="app-resourceCard2__unit-name">
              <span>{dataUtils.getLocalizedFieldValue(unit.name, locale)}</span>
              <div className="app-resourceCard2__unit-name-labels">
                <ResourceAvailability date={date} resource={resource} />
                {!resource.public && <UnpublishedLabel />}
              </div>
            </div>
          </Link>
          <div className="app-resourceCard2__description">
            {dataUtils.getLocalizedFieldValue(
              resource.description,
              locale,
              true,
            )}
          </div>
        </div>
        <div className="app-resourceCard2__info">
          {resource.type && (
            <ResourceCardInfoCell
              className="app-resourceCard2__info-cell"
              icon={iconHome}
              onClick={() => onFilterClick('search', typeName)}
              text={typeName}
            />
          )}
          <ResourceCardInfoCell
            icon={iconUser}
            onClick={
              resource.people_capacity
                ? () => onFilterClick(
                  'people',
                  searchUtils.getClosestPeopleCapacityValue(
                    resource.people_capacity,
                  ),
                )
                : null
            }
            text={
              resource.people_capacity
                ? t('ResourceCard.peopleCapacity', {
                  people: resource.people_capacity,
                })
                : '-'
            }
          />
          <ResourceCardInfoCell
            icon={iconTicket}
            onClick={
              resourceUtils.isFree(resource)
                ? () => onFilterClick('freeOfCharge', true)
                : null
            }
            text={resourceUtils.getPriceFromSnakeCaseResource(resource, t)}
          />
          <ResourceCardInfoCell
            icon={iconMap}
            text={resourceUtils.getUnitAddress(unit, locale)}
          />
          {resource.distance && (
            <ResourceCardInfoCell
              icon={iconMapMarker}
              onClick={() => null}
              text={resourceUtils.getResourceDistance(resource)}
            />
          )}
          {isLoggedIn && (
            <ResourceCardInfoCell
              alt={typeName}
              icon={resource.is_favorite ? iconHeartFilled : iconHeart}
              onClick={() => onFavoriteClick(resource)}
            />
          )}
          <ResourceCardInfoCell
            alt="accessibilityShortcomings"
            icon={
              accessibilityShortcomingsCount
                ? iconNotAccessible
                : iconAccessible
            }
            text={
              accessibilityShortcomingsCount
                ? t(
                  accessibilityShortcomingsCount === 1
                    ? 'ResourceInfo.foundAccessibilityShortcoming'
                    : 'ResourceInfo.foundAccessibilityShortcomings',
                  {
                    nShortcomings: accessibilityShortcomingsCount,
                  },
                )
                : t('ResourceInfo.noAccessibilityShortcomings')
            }
          />
        </div>
      </div>
    );
  }
}

const UnconnectedResourceCard = injectT(ResourceCard);
export { UnconnectedResourceCard };

const isNormalFontSizeSelector = state => state.ui.accessibility.fontSize !== FontSizes.LARGE;

const selector = createStructuredSelector({
  isLoggedIn: isLoggedInSelector,
  isNormalFontSize: isNormalFontSizeSelector,
  accessibilityPreferences: accessibilityPreferencesSelector,
});

export default flowRight([injectIntl, connect(selector)])(
  UnconnectedResourceCard,
);
