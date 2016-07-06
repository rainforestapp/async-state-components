// @flow
import React from 'react';
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

const Button = (props) => <button {...props} />;

const AsyncButton = transition({
  success: (Comp) => (props) => (
    <Comp {...props} style={{ color: 'white', background: colors.success }}>
      <CheckIcon /> Yea, it saved!
    </Comp>
  ),

  pending: (Comp) => (props) => (
    <Comp {...props} style={{ background: colors.default }}>
     Hold on, it's saving.
    </Comp>
  ),

  error: (Comp) => (props) => (
    <Comp {...props} style={{ background: colors.error }}>
      Sorry there's an error
    </Comp>
  ),
}, 4000)(Button);

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
    >
      Save Me!
    </AsyncButton>
  </div>
);

export default connect(func => func, actions)(Demo);
