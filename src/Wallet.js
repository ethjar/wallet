import React, { Component } from 'react';
import { Jumbotron } from 'react-bootstrap';

import eth from 'ethereumjs-wallet';
import Blockies from './vendor/blockies';

class Wallet extends Component {
    constructor(props) {
        super(props);

        this.state = {
            wallet: null
        };
    }
    generate = () => {
        this.setState({wallet: eth.generate()});
    }

    save = () => {
        
    }

    render() {
        const wallet = this.state.wallet;
        let addr = "No wallet loaded";
        if (wallet) {
            addr = `0x${wallet.getAddress().toString("hex")}`;
        }
        const imgURL = Blockies.create({
            seed: addr,
            size: 8,
            scale: 16,
        }).toDataURL();
        
        return <Jumbotron>
            <h1>Ethereum</h1>
            <img alt="avatar" src={imgURL} />
            <p>{addr}</p>
            <button>Load</button>
            <button onClick={this.generate}>New</button>
            <button onClick={this.save}>Save</button>
        </Jumbotron>
    }
}

export default Wallet;