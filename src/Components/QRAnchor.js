import React, { Component } from 'react';
import { Popover } from 'react-bootstrap';

import './QRAnchor.css';

import QRCode from 'qrcode.react';

export default class QRAnchor extends Component {
    state = {
      toggled: false
    };

    toggle = () => {
      this.setState({toggled: !this.state.toggled});
    }

    render() {
        return (
            <div className="QRAnchor">
                <a href="void:(0)" onClick={this.toggle}>
                    {this.props.children}
                </a>
                <span hidden={!this.state.toggled}>
                  <Popover
                      id={this.props.children}
                      placement="bottom"
                      positionTop={10}
                      positionLeft={-100}
                      title="QR URL Link"
                  >
                    <QRCode size={200} value={this.props.href} />
                  </Popover>
                </span>
            </div>
        );
    }
}
