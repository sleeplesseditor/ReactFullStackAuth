import React, { Component } from 'react';
import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

class AuthForm extends Component {
    state = {
        username: '',
        password: ''
    }

    updateInput = type => event => {
        this.setState({ [type]: event.target.value });
    }

    signup = () => {
        const { username, password } = this.state;
        this.props.auth.signup(username, password);
    }

    login = () => {
        console.log('this.state', this.state);
    }

    render() {
        return (
            <div>
                <h2>Foodie Hub</h2>
                <FormGroup>
                    <FormControl 
                        type='text'
                        value={this.state.username}
                        placeholder='Username'
                        onChange={this.updateInput('username')}
                    />
                    <br />
                    <FormControl 
                        type='password'
                        value={this.state.password}
                        placeholder='Password'
                        onChange={this.updateInput('password')}
                    />
                </FormGroup>
                <Button onClick={this.login}>Log In</Button>
                <span> or </span>
                <Button onClick={this.signup}>Sign Up</Button>
            </div>
        );
    }
}

export default AuthForm;