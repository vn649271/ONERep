import { USERS } from "../actionTypes";

export default function userReducer(
	state = {
		user: null,
		wallet: null,
		error: '',
    showLoginModal: false,
	},
	action
) {
    switch (action.type) {
    case USERS.TOGGLE_LOGIN_MODAL:
      return Object.assign({}, state, { showLoginModal: action.payload.showLoginModal });

		case USERS.LOGIN_SUCCESS:
			localStorage.setItem('user', JSON.stringify(action.payload))
    	return Object.assign({}, state, { user: action.payload, error: '' });

		case USERS.LOGIN_FAILED:
    	return Object.assign({}, state, {error: action.payload});
	      
		case USERS.LOGOUT:
    	return Object.assign({}, state, { user: null });

    case USERS.CONNECT_WALLET:
    	return Object.assign({}, state, { 
    		wallet: action.payload.wallet, 
    		user: action.payload.user,
    		badgeTokenAddress: action.payload.badgeTokenAddress
    	});

    default:
    	return state;
    }
}