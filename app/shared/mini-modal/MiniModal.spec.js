import { expect } from 'chai';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';

import { shallowWithIntl } from 'utils/testUtils';
import MiniModal from './MiniModal';

function getWrapper(props) {
  const defaults = {
    buttonContent: 'button text',
    header: 'Modal header',
  };
  return shallowWithIntl(<MiniModal {...defaults} {...props} />);
}

describe('shared/mini-modal/MiniModal', () => {
  it('renders a div.app-MiniModal', () => {
    const wrapper = getWrapper();
    expect(wrapper.is('div.app-MiniModal')).to.be.true;
  });

  describe('show modal button', () => {
    it('is rendered with correct props', () => {
      const wrapper = getWrapper();
      const showButton = wrapper.find('.app-MiniModal__show-button');
      expect(showButton).to.have.length(1);
      expect(showButton.prop('onClick')).to.equal(wrapper.instance().showModal);
    });

    it('has the content given in props', () => {
      const buttonContent = <span>Some text inside a span</span>;
      const showButton = getWrapper({ buttonContent }).find('.app-MiniModal__show-button');
      expect(showButton).to.have.length(1);
      expect(showButton.prop('children')).to.equal(buttonContent);
    });
  });

  describe('Modal', () => {
    it('is rendered with correct props', () => {
      const wrapper = getWrapper();
      const modal = wrapper.find(Modal);
      expect(modal).to.have.length(1);
      expect(modal.prop('onHide')).to.equal(wrapper.instance().hideModal);
      expect(modal.prop('show')).to.equal(wrapper.instance().state.visible);
    });

    it('has the header given in props', () => {
      const header = 'Some header';
      const modalHeader = getWrapper({ header }).find(Modal).find('h2');
      expect(modalHeader.text()).to.equal(header);
    });

    it('has the children given in props as content', () => {
      const children = <span>Some text inside a span</span>;
      const modalContent = getWrapper({ children }).find(Modal).find('.app-MiniModal__modal-content');
      expect(modalContent.prop('children')).to.equal(children);
    });

    it('has a button for closing the modal', () => {
      const wrapper = getWrapper();
      const hideModal = wrapper.instance().hideModal;
      const modalCloseButton = wrapper.find(Modal).find('button').filter({ onClick: hideModal });
      expect(modalCloseButton).to.have.length(1);
    });
  });

  describe('hideModal', () => {
    it('sets state.visible to false', () => {
      const instance = getWrapper().instance();
      instance.state.visible = true;
      instance.hideModal();
      expect(instance.state.visible).to.be.false;
    });
  });

  describe('showModal', () => {
    it('sets state.visible to true', () => {
      const instance = getWrapper().instance();
      instance.state.visible = false;
      instance.showModal();
      expect(instance.state.visible).to.be.true;
    });
  });
});
