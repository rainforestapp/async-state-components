// @flow
jest.unmock('../changeAsyncState');
jest.unmock('../transition');
jest.unmock('../middleware');
jest.unmock('../constants');
jest.unmock('../reducer');

import React from 'react';
import { mount } from 'enzyme';
import { promiseMiddleware } from '../middleware';
import { transition } from '../transition';
import * as actions from '../changeAsyncState';
import { createAction } from 'redux-actions';
import { promiseState } from '../reducer';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

const ACTION_NAME = 'ACTION_NAME';
const actionKey = 123;
const fakeActionWithKey = createAction(
  ACTION_NAME,
  () => new window.Promise((fulfill) => process.nextTick(() => fulfill({}))),
  () => ({ actionKey })
);

const fakeActionWithKeyAndFailingPromise = createAction(
  ACTION_NAME,
  () => new window.Promise((_, reject) => process.nextTick(() => reject({}))),
  () => ({ actionKey })
);

const fakeActionWithoutKey = createAction(
  ACTION_NAME,
  () => new window.Promise((fulfill) => setTimeout(() => fulfill({}), 3000))
);


const DefaultComponent = (props) => <button {...props}>Click me</button>;
const SuccessComp = () => <button>Success</button>;
const PendingComp = () => <button>Success</button>;
const ErrorComp = () => <button>Success</button>;

let props, store, comp, AsyncComponent;
const App = ({ children }: Object) => <Provider store={store}>{children}</Provider>;

const transitions = {
  pending: () => () => <PendingComp />,
  success: () => () => <SuccessComp />,
  error: () => () => <ErrorComp />,
};

// hoc - higher order component
// We use recompose throughout this library, the transition has the
// same interface as hoc's in recompose. To find out more about recompose
// go here https://github.com/acdlite/recompose
describe('transition hoc', () => {
  beforeEach(() => {
    AsyncComponent = transition(transitions, 4000)(DefaultComponent);
    spyOn(actions, 'changeAsyncState').and.callThrough();

    store = createStore(
      combineReducers({ promiseState }),
      compose(applyMiddleware(
        promiseMiddleware
      ))
    );

    props = {
      actionName: ACTION_NAME,
      actionKey,
      onClick: () => store.dispatch(fakeActionWithKey()),
    };
    comp = mount(
      <App>
        <AsyncComponent {...props} />
      </App>
    );
  });

  afterEach(() => {
    jest.runAllTicks();
    jest.runAllTimers();
  });

  it('renders the component', () => {
    expect(comp.find(DefaultComponent).length).toBe(1);
  });

  it('sets async state to pending and passes right key when promise is started', () => {
    comp.find(AsyncComponent).simulate('click');
    expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'pending', actionKey);
  });

  describe('when promise gets resolved successfully', () => {
    beforeEach(() => {
      comp.find(AsyncComponent).simulate('click');
    });

    afterEach(() => {
      jest.runAllTimers();
      comp.unmount();
    });

    it('first sets async state to pending and renders the pending component', () => {
      expect(actions.changeAsyncState.calls.count()).toBe(1);
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'pending', actionKey);
      expect(actions.changeAsyncState).not.toHaveBeenCalledWith(ACTION_NAME, 'success', actionKey);
      expect(comp.find(PendingComp).length).toBe(1);
    });

    it('then sets async state to success and renders the success component', () => {
      jest.runAllTicks();
      expect(actions.changeAsyncState.calls.count()).toBe(2);
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'success', actionKey);
      expect(comp.find(SuccessComp).length).toBe(1);
    });

    it('finally sets async state to default and renders the default component', () => {
      jest.runAllTimers();
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'default', actionKey);
      expect(actions.changeAsyncState.calls.count()).toBe(3);
      expect(comp.find(DefaultComponent).length).toBe(1);
    });
  });

  describe('when promise throws an error (gets rejected)', () => {
    beforeEach(() => {
      props.onClick = () => store.dispatch(fakeActionWithKeyAndFailingPromise());

      comp.unmount();
      comp = mount(
        <App>
          <AsyncComponent {...props} />
        </App>
      );

      comp.find(AsyncComponent).simulate('click');
    });

    it('first sets async state to pending and renders the pending component', () => {
      expect(actions.changeAsyncState.calls.count()).toBe(1);
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'pending', actionKey);
      expect(actions.changeAsyncState).not.toHaveBeenCalledWith(ACTION_NAME, 'success', actionKey);
      expect(comp.find(PendingComp).length).toBe(1);
    });

    it('then sets async state to error and renders the error component', () => {
      jest.runAllTicks();
      expect(actions.changeAsyncState.calls.count()).toBe(2);
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'error', actionKey);
      expect(comp.find(ErrorComp).length).toBe(1);
    });

    it('finally sets async state to default and renders the default component', () => {
      jest.runAllTimers();
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'default', actionKey);
      expect(actions.changeAsyncState.calls.count()).toBe(3);
      expect(comp.find(DefaultComponent).length).toBe(1);
    });
  });

  describe('when fakeActionWithoutKey is called', () => {
    beforeEach(() => {
      props.onClick = () => store.dispatch(fakeActionWithoutKey());
      comp = mount(
        <App>
          <AsyncComponent {...props} />
        </App>
      );
    });

    it('calls changeAsyncState with the right arguments', () => {
      comp.find(AsyncComponent).simulate('click');
      expect(actions.changeAsyncState).toHaveBeenCalledWith(ACTION_NAME, 'pending', undefined);
    });
  });
});
