import { createAction } from 'redux-actions';
import {
  SAVE_SETTINGS,
  LOAD_ITEMS,
} from './constants';

export const saveSettings = createAction(
  SAVE_SETTINGS,
  () => new window.Promise((fulfill) => setTimeout(fulfill, 3000))
);

export const loadItems = createAction(
  LOAD_ITEMS,
  () => new window.Promise((fulfill) => setTimeout(fulfill, 3000))
);
