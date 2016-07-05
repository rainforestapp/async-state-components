import React, { Component } from 'react';
import Fork from 'react-ghfork';
import pkgInfo from '../package.json';
import Demo from './Demo.jsx';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import promiseMiddleware from '../src/middleware';
import promiseState from '../src/reducer';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

injectTapEventPlugin();

const store = createStore(
  combineReducers({ promiseState }),
  compose(applyMiddleware(
    promiseMiddleware
  ))
);

class App extends Component {
  getChildContext() {
    return { muiTheme: getMuiTheme(baseTheme) };
  }

  render() {
    return (
      <MuiThemeProvider>
        <Provider store={store}>
          <div>
            <Fork
              className="right"
              project={`${pkgInfo.user}/${pkgInfo.name}`}
            />
            <Demo />
          </div>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

App.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default App;
