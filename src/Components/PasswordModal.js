import React, { Component } from 'react';
import {
    Button, ButtonToolbar,
    Modal, FormGroup, FormControl, ControlLabel, HelpBlock,
} from 'react-bootstrap';

class Password extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: null,
            passwordValidate: null,
        }

        this.onSubmit = (e) => {
            e.preventDefault();
            props.onSubmit(this.state.password);
            this.setState({
                password: null,
                passwordValidate: null,
            });
        }
        this.onCancel = () => {
            this.setState({
                password: null,
                passwordValidate: null,
            });
            props.onCancel();
        };
    }

    passwordValidation = () => {
        if (this.state.password && this.state.passwordValidate) {
            return (this.state.password === this.state.passwordValidate)
                ? 'success' : 'error';
        }
        return null;
    }

    handlePasswordValue = (e) => {
        const field = e.target.id;
        this.setState({[field]: e.target.value});
    }

    render() {
        const disabled = this.passwordValidation() !== 'success';
        return (
            <Modal show={this.props.show} backdrop={true}>
                <Modal.Header>
                    <Modal.Title>Wallet Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.onSubmit}>
                        <FormGroup
                            controlId="password"
                            validationState={this.passwordValidation()}
                        >
                            <ControlLabel>Password</ControlLabel>
                            <FormControl
                                type="password" placeholder="Choose a password"
                                onChange={this.handlePasswordValue}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                        <FormGroup
                            controlId="passwordValidate"
                            validationState={this.passwordValidation()}
                        >
                            <ControlLabel>Validate Password</ControlLabel>
                            <FormControl
                                type="password" placeholder="Re-enter the same password"
                                onChange={this.handlePasswordValue}
                            />
                            <FormControl.Feedback />
                            <HelpBlock>The password is used to encrypt the wallet.</HelpBlock>
                        </FormGroup>
                        <ButtonToolbar>
                            <Button bsStyle="primary" bsSize="large" type="submit" disabled={disabled}>OK</Button>
                            <Button bsSize="large" onClick={this.onCancel}>Cancel</Button>
                        </ButtonToolbar>
                    </form>
                </Modal.Body>
            </Modal>
        );
    }
}

export default Password;