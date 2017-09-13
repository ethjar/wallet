import React, { Component } from 'react';
import {
    Jumbotron, Button, ButtonToolbar,
    Row, Col, Nav, NavItem,
} from 'react-bootstrap';
import './Wallet.css';

import PasswordModal from './Components/PasswordModal';
import Avatar from './Components/Avatar';

import QRCode from 'qrcode.react';
import eth from 'ethereumjs-wallet';

export default class Wallet extends Component {
    pendingImport = null;
    state = {
        wallet: null,
        showExportPassword: false,
        showImportPassword: false,
    };

    generate = () => {
        this.setState({wallet: eth.generate()});
    }

    promptExportPassword = () => {
        this.setState({showExportPassword: true});
    }

    cancelSave = () => {
        this.setState({showExportPassword: false});
    }

    save = (passwd) => {
        this.setState({showExportPassword: false});
        const wallet = this.state.wallet;
        const jsV3 = wallet.toV3(passwd);

        let fileLink = document.createElement("a");
        let file = new Blob([JSON.stringify(jsV3)], {type: 'application/octet-stream'});
        fileLink.href = URL.createObjectURL(file);
        fileLink.download = wallet.getV3Filename();
        fileLink.click();
    }

    selectImport = () => {
        this.refs.import.value = '';
        this.refs.import.click();
    }

    promptImportPassword = (e) => {
        if (!e.target.files[0]) {
            return;
        }
        let reader = new FileReader();
        reader.onload = () => {
            this.pendingImport = reader.result;
            this.setState({showImportPassword: true});
        };
        reader.readAsText(e.target.files[0]);
    }

    cancelImport = () => {
        this.setState({showImportPassword: false});
    }

    import = (passwd) => {
        let wallet;
        try {
            wallet = eth.fromV3(this.pendingImport, passwd);
        } catch(e) {
            console.log("TODO: wrong password, re-open password input");
            return
        }
        this.setState({
            wallet: wallet,
            showImportPassword: false,
        });
    }

    render() {
        const wallet = this.state.wallet;
        const addr = wallet ? `0x${wallet.getAddress().toString("hex")}` : "No wallet loaded";
        const avatar = <Avatar address={wallet ? `0x${wallet.getAddress().toString("hex")}` : null} />
        const body = wallet ? <Actions wallet={wallet} /> : null
        return <div className="wallet">
            <PasswordModal show={this.state.showExportPassword} onSubmit={this.save} onCancel={this.cancelSave} />
            <PasswordModal show={this.state.showImportPassword} onSubmit={this.import} onCancel={this.cancelImport} />
            <Jumbotron>
                <h1>Ethereum</h1>
                <input type="file" ref="import" id="import" onChange={this.promptImportPassword} />
                <ButtonToolbar>
                    <Button onClick={this.selectImport}>Import</Button>
                    <Button onClick={this.generate}>New</Button>
                    <Button onClick={this.promptExportPassword} disabled={wallet ? false : true}>Export</Button>
                </ButtonToolbar>
                {avatar}
                <p>{addr}</p>
            </Jumbotron>
            <Col sm={10} smOffset={1}>
                {body}
            </Col>
        </div>
    }
}

class Actions extends Component {
    state = {
        active: "receive"
    }

    transaction = () => {
        // const txParams = {
        //     nonce: '0x00',
        //     gasPrice: '0x09184e72a000', 
        //     gasLimit: '0x2710',
        //     to: '0x0000000000000000000000000000000000000000', 
        //     value: '0x00', 
        //     data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        //     // EIP 155 chainId - mainnet: 1, ropsten: 3
        //     chainId: 3
        // }
        
        // const tx = new EthereumTx(txParams)
        // tx.sign(privateKey)
        // const serializedTx = tx.serialize()
    }
    navigate = (key) => {
        this.setState({active: key});
    }

    render() {
        const address = `0x${this.props.wallet.getAddress().toString("hex")}`
        return (
            <div className="actions">
                <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.navigate}>
                    <NavItem eventKey="receive" title="Receive">Receive Ether</NavItem>
                    <NavItem eventKey="send" disabled={true} title="Send">Send Ether</NavItem>
                    <NavItem eventKey="balance" title="Balance">Balance</NavItem>
                </Nav>
                <div className="nav-body">
                    <Col hidden={this.state.active !== "receive"}>
                        <Row>
                            <Col sm={4}>
                                <div className="qr-code">
                                    <QRCode size={200} value={address} />
                                </div>
                            </Col>
                            <Col sm={8}>
                                <p>
                                    Scan the QR-code with your mobile device to get a copy of the address of this wallet.
                                    This address can be used as the receiver of a new ether transaction.
                                </p>
                            </Col>
                        </Row>
                    </Col>
                    <Col hidden={this.state.active !== "send"}>
                        <form>
                            
                        </form>
                    </Col>
                    <Col hidden={this.state.active !== "balance"}>
                        <Row>
                            <Col sm={4}>
                                <div className="qr-code">
                                    <QRCode
                                        size={200}
                                        value={`https://etherscan.io/address/${address}`} />
                                </div>
                            </Col>
                            <Col sm={8}>
                                <p>Scan the QR-code with your mobile device to show current balance of the wallet.</p>
                            </Col>
                        </Row>
                    </Col>
                </div>
            </div>
        );
    }
}
