// @flow
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import transition from '../src/transition';
import CheckIcon from 'react-icons/lib/fa/check';
import * as actions from './actions';
import { connect } from 'react-redux';
import { SAVE_SETTINGS } from './constants';

const colors = {
  default: '#eee',
  success: 'green',
  error: 'red',
};

const AsyncButton = transition({
  success: (Comp) => (props) => (
    <Comp {...props} style={{ color: 'white' }} backgroundColor={colors.success}>
      <CheckIcon /> Yea, it saved!
    </Comp>
  ),

  pending: (Comp) => (props) => (
    <Comp {...props} backgroundColor={colors.default}>
     Hold on, it's saving.
    </Comp>
  ),

  error: (Comp) => (props) => (
    <Comp {...props} backgroundColor={colors.error}>
      Sorry there's an error
    </Comp>
  ),
}, 4000)(RaisedButton);

type DemoProps = {
  saveSettings: () => void;
};

const Demo = ({ saveSettings }: DemoProps) => (
  <div>
    <h1>A save button</h1>
    <AsyncButton
      style={{ padding: '0 1em' }}
      actionName={SAVE_SETTINGS}
      onClick={saveSettings}
      backgroundColor={colors.default}
    >
      Save Me!
    </AsyncButton>
  </div>
);

export default connect(func => func, actions)(Demo);
