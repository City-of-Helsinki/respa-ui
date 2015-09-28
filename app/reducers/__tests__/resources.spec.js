import chai, {expect} from 'chai';
import chaiImmutable from 'chai-immutable';

import {Map} from 'immutable';

import {fetchResourcesSuccess} from 'actions/resourceActions';
import {resources as reducer} from 'reducers/resources';

chai.use(chaiImmutable);

describe('Reducer: resources', () => {
  describe('initial state', () => {
    it('should be an empty Map', () => {
      const expected = Map();
      expect(reducer(undefined, {})).to.equal(expected);
    });
  });

  describe('handling actions', () => {
    describe('FETCH_RESOURCES_SUCCESS', () => {
      it('should return the state as Map', () => {
        const resources = [
          {id: 'r-1', name: 'some resource'},
        ];
        const initialState = Map();
        const action = fetchResourcesSuccess(resources);
        const state = reducer(initialState, action);

        expect(Map.isMap(state)).to.be.true;
      });

      it('should save resources as Maps', () => {
        const resources = [
          {id: 'r-1', name: 'some resource'},
        ];
        const initialState = Map();
        const action = fetchResourcesSuccess(resources);
        const state = reducer(initialState, action);

        expect(Map.isMap(state.get('r-1'))).to.be.true;
      });

      it('should index the given resources by id and add them to state', () => {
        const resources = [
          {id: 'r-1', name: 'some resource'},
          {id: 'r-2', name: 'other resource'},
        ];
        const initialState = Map();
        const expectedState = Map({
          'r-1': Map(resources[0]),
          'r-2': Map(resources[1]),
        });
        const action = fetchResourcesSuccess(resources);

        expect(reducer(initialState, action)).to.equal(expectedState);
      });

      it('should not remove previous resources from the state', () => {
        const resources = [
          {id: 'r-1', name: 'some resource'},
          {id: 'r-2', name: 'other resource'},
        ];
        const previousResource = {id: 'r-3', name: 'previous resource'};
        const initialState = Map({
          'r-3': Map({previousResource}),
        });
        const expectedState = Map({
          'r-1': Map(resources[0]),
          'r-2': Map(resources[1]),
          'r-3': Map({previousResource}),
        });
        const action = fetchResourcesSuccess(resources);

        expect(reducer(initialState, action)).to.equal(expectedState);
      });

      it('should overwrite previous resources with the same id', () => {
        const resources = [
          {id: 'r-1', name: 'some resource'},
          {id: 'r-2', name: 'other resource'},
        ];
        const previousResource = {id: 'r-1', name: 'old name'};
        const initialState = Map({
          'r-1': Map({previousResource}),
        });
        const expectedState = Map({
          'r-1': Map(resources[0]),
          'r-2': Map(resources[1]),
        });
        const action = fetchResourcesSuccess(resources);

        expect(reducer(initialState, action)).to.equal(expectedState);
      });
    });
  });
});
