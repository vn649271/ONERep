import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

export const initialState = {
  lastAction: { 
    type: '', 
    payload: {}
  },
  userAction: {
    showLoginModal: false,
    user: null,
    wallet: null,
    isAdmin: false,
    badgeTokenAddress: null,
    error: ''
  },
  // commonAction: {
  //   isLoading: false
  // },
  myPrograms : {
    isLoading: false
  }
};

const logger = store => next => action => {
  let result = next(action);
  return result;
};

var store = createStore(
  reducers,
  initialState,
  applyMiddleware(thunk, logger)
);
export default store;
