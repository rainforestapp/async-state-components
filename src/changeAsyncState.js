// @flow
import { ASYNC_STATE_CHANGE } from './constants';
import { createAction } from 'redux-actions';

const changeAsyncState = createAction(
  ASYNC_STATE_CHANGE,
  (actionName, state, actionKey) => ({ state, actionName, actionKey }));

export default changeAsyncState;
