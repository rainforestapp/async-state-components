// @flow
import { Map as map } from 'immutable';
import { handleActions } from 'redux-actions';
import { ASYNC_STATE_CHANGE } from './constants';

export default handleActions({
  [ASYNC_STATE_CHANGE](state, { payload }) {
    let actionName = payload.actionName;
    if (payload.actionKey !== undefined) {
      actionName = `${payload.actionName}_${payload.actionKey}`;
    }
    return state.set(actionName, payload.state);
  },
}, map());
