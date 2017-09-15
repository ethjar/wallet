import React, { Component } from 'react';
import {
    Jumbotron, Button, ButtonToolbar,
    Grid, Row, Col,
    Nav, NavItem, Panel,
    FormGroup, FormControl, ControlLabel, HelpBlock,
} from 'react-bootstrap';
import './Wallet.css';

import PasswordModal from './Components/PasswordModal';
import Avatar from './Components/Avatar';
import QRAnchor from './Components/QRAnchor';

import QRCode from 'qrcode.react';
import EthereumWallet from 'ethereumjs-wallet';
import EthereumTx from 'ethereumjs-tx';

export default class Wallet extends Component {
    pendingImport = null;
    state = {
        wallet: null,
        saved: false,
        generated: false,
        showExportPassword: false,
        showImportPassword: false,
    };

    generate = () => {
        this.setState({
            wallet: EthereumWallet.generate(),
            generated: true,
            saved: false,
        });
    }

    promptExportPassword = () => {
        this.setState({showExportPassword: true});
    }

    cancelSave = () => {
        this.setState({showExportPassword: false});
    }

    save = (passwd) => {
        this.setState({
            showExportPassword: false,
            saved: true,
        });
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
            wallet = EthereumWallet.fromV3(this.pendingImport, passwd);
        } catch(e) {
            console.log("TODO: wrong password, re-open password input");
            return
        }
        this.setState({
            wallet: wallet,
            generated: false,
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
                    <Button onClick={this.selectImport}>Load</Button>
                    <Button onClick={this.generate}>New</Button>
                    <Button onClick={this.promptExportPassword} disabled={wallet ? false : true}>Save</Button>
                </ButtonToolbar>
                {avatar}
                <p>{addr}</p>
            </Jumbotron>
            <Grid>
                <Row hidden={this.state.saved || !this.state.generated}>
                    <Col mdOffset={4} md={4} xsOffset={2} xs={8}>
                        <Panel header="Wallet NOT saved!" bsStyle="danger">
                            Don't forget to save your wallet before transfering
                            Ether to it.
                        </Panel>
                    </Col>
                </Row>
                <Row>
                    <Col mdOffset={2} md={8}>
                        {body}
                    </Col>
                </Row>
            </Grid>
        </div>
    }
}

class Actions extends Component {
    state = {
        active: "receive",
        transaction: null,
        txAddress: "",
    };
    pendingTransaction = {
            nonce: '0x00',
            gasPrice: '0xee6b2800',
            gasLimit: '0x5208',
            to: '0x0000000000000000000000000000000000000000',
            value: '0x00',
            data: '0x',
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: 1
    };

    createTransaction = (e) => {
        e.preventDefault();

        const tx = new EthereumTx(this.pendingTransaction)
        tx.sign(this.props.wallet.getPrivateKey());
        const serializedTx = tx.serialize();
        this.setState({transaction: `0x${serializedTx.toString("hex")}`});
    }

    updateTransaction = (e) => {
        // Prevent any old transaction to stay cached until we create again.
        this.setState({transaction: null});

        switch (e.target.id) {
            case "txAddress": {
                if (e.target.value.length > 42) {
                    return;
                }
                this.setState({txAddress: e.target.value});
                this.pendingTransaction.to = e.target.value;
                break;
            }
            case "txNonce": {
                this.pendingTransaction.nonce = `0x${e.target.value.toString(16)}`;
                break;
            }
            case "txAmount": {
                // Ether.
                const value = e.target.value * 1e18;
                this.pendingTransaction.value = `0x${value.toString(16)}`;
                break;
            }
            case "txGas": {
                // Gwei.
                const value = e.target.value * 1e9;
                this.pendingTransaction.gasPrice = `0x${value.toString(16)}`;
                break;
            }
            default:
        }
    }

    navigate = (key) => {
        this.setState({active: key});
    }

    render() {
        const txQR = this.state.transaction
            ? <QRCode size={200} value={"https://api.ethjar.store/v2/eth_sendRawTransaction?data=" + this.state.transaction} />
            : <div className="placeholder"></div>;
        const address = `0x${this.props.wallet.getAddress().toString("hex")}`
        return (
            <div className="actions">
                <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.navigate}>
                    <NavItem eventKey="receive" title="Receive">Receive Ether</NavItem>
                    <NavItem eventKey="send" title="Send">Send Ether</NavItem>
                    <NavItem eventKey="balance" title="Balance">Balance</NavItem>
                </Nav>
                <div className="nav-body">
                    <Row hidden={this.state.active !== "receive"}>
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
                    <Row hidden={this.state.active !== "send"}>
                        <Col sm={4}>
                            <div className="qr-code">
                                {txQR}
                            </div>
                            <HelpBlock>
                                Fill in the form to generate a transaction QR.
                                Scan it with your mobile device to sync with the network.
                            </HelpBlock>
                        </Col>
                        <Col sm={8}>
                            <form>
                                <Row>
                                    <Col xs={10}>
                                        <FieldGroup
                                            id="txAddress"
                                            type="text"
                                            label="To Address"
                                            onChange={this.updateTransaction}
                                            value={this.state.txAddress}
                                            placeholder={address}
                                        />
                                    </Col>
                                    <Col xs={2}>
                                        <Avatar address={this.state.txAddress} scale={7} />
                                    </Col>
                                </Row>
                                <FieldGroup
                                    id="txAmount"
                                    type="number"
                                    label="Amount of ether to send"
                                    onChange={this.updateTransaction}
                                    placeholder="0"
                                />
                                <HelpBlock>
                                    To check the current balance, see <QRAnchor href={`https://etherscan.io/address/${address}`}>etherscan.io</QRAnchor>.
                                </HelpBlock>
                                <FieldGroup
                                    id="txNonce"
                                    type="number"
                                    label="Transaction counter (nonce)"
                                    onChange={this.updateTransaction}
                                    defaultValue={0}
                                />
                                <HelpBlock>
                                    This must match the number of previous
                                    transactions created by this wallet.
                                    You can verify the current number of transactions with <QRAnchor href={`https://api.ethjar.store/v2/eth_getTransactionCount?data=${address}`}>Ethjar API</QRAnchor>.
                                </HelpBlock>
                                <FieldGroup
                                    id="txGas"
                                    type="number"
                                    label="Transfer fee (gas price in Gwei)"
                                    onChange={this.updateTransaction}
                                    defaultValue={parseInt(this.pendingTransaction.gasPrice, 16)/1e9}
                                />
                                <HelpBlock>
                                    For up to date gas prices, see <QRAnchor href="http://ethgasstation.info/">ethgasstation.info</QRAnchor>.
                                    Pay a higher gas price if transaction speed is a priority.
                                </HelpBlock>
                                <Button bsStyle="primary" type="submit" onClick={this.createTransaction}>Generate Transaction</Button>
                            </form>
                        </Col>
                    </Row>
                    <Row hidden={this.state.active !== "balance"}>
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
                </div>
            </div>
        );
    }
}

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
        <FormControl.Feedback />
    </FormGroup>
  );
}
