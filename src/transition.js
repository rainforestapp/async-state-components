// @flow
import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import changeAsync from './changeAsyncState';
import lifecycle from 'recompose/lifecycle';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import omit from 'lodash/omit';

export const mapStateToProps = ({ promiseState }) => ({ promiseState });

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

  return {
    ...ownProps,
    ...asyncActions,
    asyncState,
    actionName,
    actionKey,
  };
};

export const connectToState = Comp => (connect(
  mapStateToProps,
  { changeAsyncState: changeAsync },
  mergeProps
)(Comp));

const identity = (Comp) => (props) => <Comp {...props} />;

type TransitionCompProps = {
  setTimeoutId: (id: number) => void;
  timeoutId: number;
  resetButtonState: () => void;
  actionName: string;
  actionKey: string|number;
  changeAsyncState: (actionName: string, state: string, actionKey: ?string) => void;
  asyncState: string;
};

type hoc = (comp: ReactClass) => (props: Object) => ReactClass;

type TransitionObject = {
  success?: hoc;
  pending?: hoc;
  error?: hoc;
};

export const transition = (transitions: TransitionObject, delay = 4000): hoc => compose(
  connectToState,

  withState('timeoutId', 'setTimeoutId', undefined),

  withHandlers({
    resetButtonState: ({
      changeAsyncState,
      actionName,
      actionKey,
      timeoutId,
      setTimeoutId,
    }) => (asyncState: string) => {
      if (asyncState === 'error' || asyncState === 'success') {
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

  (Comp) => (props: TransitionCompProps) => {
    const internalProps = [
      'setTimeoutId',
      'timeoutId',
      'resetButtonState',
      'actionName',
      'actionKey',
      'changeAsyncState',
      'asyncState',
    ];

    const { asyncState } = props;
    let render = identity;
    if (transitions[asyncState]) render = transitions[asyncState];
    return render(Comp)(omit(props, internalProps));
  }
);

export default transition;
