import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import simple from 'simple-mock';

import { UnconnectedFavoriteButtonContainer } from './FavoriteButtonContainer';
import FavoriteButton from './FavoriteButton';

describe('shared/favorite-button/FavoriteButtonContainer', () => {
  const resource = {
    id: '123',
    isFavorite: true,
  };

  const defaultProps = {
    actions: {
      favoriteResource: simple.mock(),
      unfavoriteResource: simple.mock(),
    },
    resource,
  };

  function getWrapper(props) {
    return shallow(<UnconnectedFavoriteButtonContainer {...defaultProps} {...props} />);
  }
  let wrapper;

  beforeAll(() => {
    wrapper = getWrapper();
  });

  test('renders a FavoriteButton', () => {
    expect(wrapper.is(FavoriteButton)).to.be.true;
  });

  test('has favorited prop', () => {
    expect(wrapper.prop('favorited')).to.be.true;
  });

  describe('handleClick', () => {
    let instance;

    beforeAll(() => {
      instance = wrapper.instance();
    });

    beforeEach(() => {
      defaultProps.actions.unfavoriteResource.reset();
      defaultProps.actions.favoriteResource.reset();
    });

    test('gets passed as onClick prop', () => {
      expect(wrapper.prop('onClick')).to.equal(instance.handleClick);
    });

    test('calls unfavoriteResource if resource was favorite', () => {
      instance.handleClick();
      expect(defaultProps.actions.unfavoriteResource.callCount).to.equal(1);
      expect(defaultProps.actions.unfavoriteResource.lastCall.args).to.deep.equal(['123']);
    });

    test('calls favoriteResource if resource was not favorite', () => {
      const customInstance = getWrapper({
        resource: {
          id: '123',
          isFavorite: false,
        },
      }).instance();
      customInstance.handleClick();
      expect(defaultProps.actions.favoriteResource.callCount).to.equal(1);
      expect(defaultProps.actions.favoriteResource.lastCall.args).to.deep.equal(['123']);
    });
  });
});
