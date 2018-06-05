import React from 'react';
import { render } from 'react-dom';
import history from './history';
import { Redirect, Route, Router, Switch } from 'react-router-dom';

import Auth from './Auth';
import { App, Ramen, Sushi } from './components';

const auth = new Auth();

const callbackComponent = () => {
    if (auth.loggedIn) {
        setTimeout(() => history.replace('/'), 1500);
        return <h4>Loading...</h4>;
    } else {
        return <Redirect to={{ pathname: '/' }} />
    }
};

const AuthRoute = props => {
    const { Component, path } = props;
    return (
        <Route path={path} render={() => 
            auth.loggedIn ?
                <Component /> :
                <Redirect to={{ pathname: '/' }} />        
            } 
        />
    );
};

auth.checkAuthentication()
    .then(() => {
        render(
            <Router history={history}>
                <Switch>
                    <Route exact path='/' render={() => <App auth={auth}/>} />
                    <Route path='/callback' render={props => callbackComponent(props)} />
                    <AuthRoute path='/ramen' Component={Ramen}/>
                    <AuthRoute path='/sushi' Component={Sushi}/>
                </Switch>
            </Router>,
            document.getElementById('root')
        );
    });
