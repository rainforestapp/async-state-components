import React from 'react';
import Fork from 'react-ghfork';
import pkgInfo from '../package.json';
import Demo from './Demo.jsx';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import { middleware, reducer } from '../src';

const store = createStore(
  combineReducers({ promiseState: reducer }),
  compose(applyMiddleware(
    middleware
  ))
);

const App = () => (
  <Provider store={store}>
    <div>
      <Fork
        className="right"
        project={`${pkgInfo.user}/${pkgInfo.name}`}
      />
      <Demo />
    </div>
  </Provider>
);

export default App;
