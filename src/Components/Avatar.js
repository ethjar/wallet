import React, { Component } from 'react';
import Blockies from '../vendor/blockies';
import "./Avatar.css";

class Avatar extends Component {
    componentDidUpdate() {
        if (!this.props.address) {
            return;
        }

        let canvas = this.refs.canvas;
        Blockies.render({
            seed: this.props.address.toLowerCase(),
            size: 8,
            scale: this.props.scale || 16,
        }, canvas);
    }

    render() {
        if (!this.props.address) {
            return <div className="avatar placeholder"></div>
        }
        return <div className="avatar">
            <canvas ref="canvas" />
        </div>
    }
}

export default Avatar;
