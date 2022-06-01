import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import modules from './modules';
import WalletAddressBox from './components/WalletAddressBox';
import BadgeTokenAddressBox from './components/BadgeTokenAddressBox';

import Page404 from './components/Page404';
import Layout from './components/Layout';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App(props) {

  const [routes, setRoutes] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [messageTitle, setMessageTitle] = useState(null);
  const [messageType, setMessageType] = useState('error');
  const [messageContent, setMessageContent] = useState(null);

  useEffect(() => {
    renderRoutes();
  });

  const renderRoutes = () => {
    if (routes) {
      return;
    }

    let _routes = Object.keys(modules).map((item) => {
      return (
        <Route key={`route_${item}`} exact path={item}>
          {withRouter(modules[item])}
        </Route>
      );
    });
    setRoutes(_routes);
  }
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Layout>
            <div className="or-header">
              <div className="float-left">
                <BadgeTokenAddressBox />
              </div>
              <div className="float-right">
                <WalletAddressBox />
              </div>
            </div>
            <Switch>
              {routes}
              <Route component={Page404} />
            </Switch>
          </Layout>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;