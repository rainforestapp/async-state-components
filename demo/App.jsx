import React, { Component } from 'react';
import Fork from 'react-ghfork';
import pkgInfo from '../package.json';
import Demo from './Demo.jsx';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import promiseMiddleware from '../src/middleware';
import promiseState from '../src/reducer';

const store = createStore(
  combineReducers({ promiseState }),
  compose(applyMiddleware(
    promiseMiddleware
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
