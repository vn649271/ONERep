import { routes } from '../shared/constants';

// import Homepage from './Homepage';
import Dashboard from './Dashboard';
import Welcome from './Welcome';
import LogIn from './LogIn';
import Portfolio from './Portfolio';
import AddCurrency from './AddCurrency';
import Wallets from './Wallets';
import History from './History';
import SecureBackup from './SecureBackup';
import Setting from './Settings';
import RestoreWallet from './RestoreWallet';
import Currency from './Currency';
import AccountSupport from './AccountSupport';

import HomePage from './homepage'
import WalletConnect from "./WalletConnect";
import AdminModule from "./Admin";
import OneRepFileModule from "./OnerepFile";
import OneRepBoardModule from "./OnerepBoard";

export default {
	[routes.home]: HomePage,
	[routes.walletconnect]: WalletConnect,
	[routes.admin]: AdminModule,
	[routes.onerepfile]: OneRepFileModule,
	[routes.onerepboard]: OneRepBoardModule,
	[routes.dashboardpage]: Dashboard,
	[routes.welcomepage]: Welcome,
	[routes.loginpage]: HomePage,
	[routes.portfoliopage]: Portfolio,
	[routes.addcurrencypage]: AddCurrency,
	[routes.walletspage]: Wallets,
	[routes.historypage]: History,
	[routes.securebackuppage]: SecureBackup,
	[routes.settingspage]: Setting,
	[routes.restorewalletpage]: RestoreWallet,
	[routes.currencypage]: Currency,
	[routes.accountsupportpage]: AccountSupport
};
