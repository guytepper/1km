import React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from './routes';

function RouteWithSubRoutes(route) {
  console.log(route);
  return <Route path={route.path} exact={route.exact} render={(props) => <route.component {...props} routes={route.routes} />} />;
}

export function RenderRoutes() {
  return (
    <Switch>
      {routes.map((route) => {
        return <RouteWithSubRoutes key={route.key} {...route} />;
      })}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
}
