// @flow
import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import * as actions from './actions';
import lifecycle from 'recompose/lifecycle';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';

const mapStateToProps = ({ promiseState }) => ({ promiseState });

export const mergeProps = (
  { promiseState },
  asyncActions,
  { actionName, actionKey, ...ownProps }
) => {
  let asyncState = 'default';

  if (actionKey !== undefined && promiseState.has(`${actionName}_${actionKey}`)) {
    asyncState = promiseState.get(`${actionName}_${actionKey}`);
  } else if (promiseState.has(actionName) && actionKey === undefined) {
    asyncState = promiseState.get(actionName);
  }

  return { ...ownProps, ...asyncActions, asyncState, actionName, actionKey };
};

export const connectToState = connect(
  mapStateToProps,
  actions,
  mergeProps
);

const identity = (Comp) => (props) => <Comp {...props} />;

const transition = (transitions, delay = 4000) => compose(
  connectToState,

  withState('timeoutId', 'setTimeoutId', undefined),

  withHandlers({
    resetButtonState: ({
      changeAsyncState,
      actionName,
      actionKey,
      timeoutId,
      setTimeoutId,
    }) => (asyncState) => {
      if (asyncState === 'failure' || asyncState === 'success') {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }

        setTimeoutId(
          window.setTimeout(
            () => (
              changeAsyncState(
                actionName,
                'default',
                actionKey
              )
            ),
            delay
          )
        );
      }
    },
  }),

  lifecycle({
    componentDidMount() {
      this.props.resetButtonState(this.props.asyncState);
    },

    componentWillReceiveProps(nextProps) {
      const { asyncState: oldAsyncState, resetButtonState } = this.props;
      const { asyncState: newAsyncState } = nextProps;

      if (newAsyncState !== oldAsyncState) {
        resetButtonState(newAsyncState);
      }
    },
  }),

  (Comp) => (props) => {
    const { asyncState } = props;
    let render = identity;
    if (transitions[asyncState]) render = transitions[asyncState];
    return render(Comp)(props);
  }
);

export default transition;
