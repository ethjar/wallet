import React, { Component } from 'react';
import logo from './ETHEREUM-ICON_Black.png';
import './App.css';

import Wallet from './Wallet.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Ethjar Wallet</h2>
        </div>
        <Wallet></Wallet>
      </div>
    );
  }
}

export default App;
