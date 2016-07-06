// @flow
import { isFSA } from 'flux-standard-action';
import changeAsyncState from './changeAsyncState';

function isPromise(val) {
  return val && typeof val.then === 'function';
}

// taken from redux-promise:
// https://github.com/acdlite/redux-promise/blob/master/src/index.js
// and modified
export const promiseMiddleware =
  ({ dispatch }) => next => action => {
    const { type, meta } = action;
    const actionKey = meta ? meta.actionKey : undefined;

    if (!isFSA(action)) {
      if (isPromise(action)) {
        return action.then(dispatch);
      }
      return next(action);
    }

    if (isPromise(action.payload)) {
      dispatch(changeAsyncState(type, 'pending', actionKey));
      action.payload.then(
        result => {
          dispatch(changeAsyncState(type, 'success', actionKey));
          return dispatch({ ...action, payload: result });
        },
        error => {
          dispatch(changeAsyncState(type, 'error', actionKey));
          return dispatch({ ...action, payload: error, error: true });
        }
      );
      return action.payload;
    }
    return next(action);
  };

export default promiseMiddleware;
