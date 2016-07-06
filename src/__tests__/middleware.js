jest.unmock('../middleware');
import promiseMiddleware from '../middleware';
import * as actions from '../changeAsyncState';

let dispatch, next, action;

const callMiddleware = () => promiseMiddleware({ dispatch })(next)(action);

const changeAsyncStateResponse = { ok: true };

// FSA = flux standard action
// for more info go here https://github.com/acdlite/flux-standard-action
describe('promise middleware', () => {
  beforeEach(() => {
    spyOn(actions, 'changeAsyncState').and.returnValue(changeAsyncStateResponse);
    dispatch = jasmine.createSpy('dispatch');
    next = jasmine.createSpy('next');
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.runAllTicks();
  });

  describe("when action isn't an FSA", () => {
    beforeEach(() => {
      action = { boing: true };
      callMiddleware();
    });

    it("calls next with the action and doesn't call dispatch", () => {
      expect(next).toHaveBeenCalledWith(action);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('when action is an FSA but not a promise', () => {
    beforeEach(() => {
      action = {
        type: 'SOME_ACTION',
        payload: { boom: true },
      };
      callMiddleware();
    });

    it("calls next with the action and doesn't call dispatch", () => {
      expect(next).toHaveBeenCalledWith(action);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('when action is a promise and not an FSA', () => {
    const resolvedAction = { boom: true };
    beforeEach(() => {
      action = new Promise((resolve) => process.nextTick(() => resolve(resolvedAction)));
      callMiddleware();
    });

    it('dispatches the object that the promise returns and does not call next', () => {
      jest.runAllTicks();
      expect(dispatch).toHaveBeenCalledWith(resolvedAction);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when action is an FSA and has a promise as a payload', () => {
    const actionType = 'SOME_ACTION';
    const actionKey = 123;

    describe('when the promise resolves without error', () => {
      const resolvedAction = { boom: true };

      beforeEach(() => {
        action = {
          type: actionType,
          payload: new Promise((resolve) => process.nextTick(() => resolve(resolvedAction))),
          meta: { actionKey },
        };
        callMiddleware();
      });

      it('dispatches changeAsyncState with the "pending" state & actionKey', () => {
        expect(actions.changeAsyncState.calls.count()).toBe(1);
        expect(actions.changeAsyncState).toHaveBeenCalledWith(actionType, 'pending', actionKey);
      });

      describe('when the promise resolves without error', () => {
        it('dispatches changeAsyncState with the "success" state & actionKey', () => {
          jest.runAllTicks();
          jest.runOnlyPendingTimers();
          expect(actions.changeAsyncState.calls.count()).toBe(2);
          expect(actions.changeAsyncState).toHaveBeenCalledWith(actionType, 'success', actionKey);
          expect(dispatch).toHaveBeenCalledWith(changeAsyncStateResponse);
        });
      });
    });

    describe('when the promise throws an error', () => {
      const err = new Error('boom');
      beforeEach(() => {
        action = {
          type: actionType,
          payload: new Promise((_, reject) => process.nextTick(() => reject(err))),
          meta: { actionKey },
        };
        callMiddleware();
        jest.runAllTicks();
        jest.runOnlyPendingTimers();
      });

      it('dispatches changeAsyncState with the "error" state & actionKey', () => {
        expect(actions.changeAsyncState.calls.count()).toBe(2);
        expect(actions.changeAsyncState).toHaveBeenCalledWith(actionType, 'error', actionKey);
        expect(dispatch).toHaveBeenCalledWith(changeAsyncStateResponse);
      });

      it('dispatches the action with the error as a payload and error set to true', () => {
        expect(dispatch).toHaveBeenCalledWith(
          { ...action, payload: err, error: true }
        );
      });
    });
  });
});
