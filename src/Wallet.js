import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import './Wallet.css';

import PasswordModal from './Components/PasswordModal';
import Avatar from './Components/Avatar';

import eth from 'ethereumjs-wallet';

class Wallet extends Component {
    constructor(props) {
        super(props);

        this.pendingImport = null;
        this.state = {
            wallet: null,
            showExportPassword: false,
            showImportPassword: false,
        };
    }
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
        
        return <div className="wallet">
            <PasswordModal show={this.state.showExportPassword} onSubmit={this.save} onCancel={this.cancelSave} />
            <PasswordModal show={this.state.showImportPassword} onSubmit={this.import} onCancel={this.cancelImport} />
            <Jumbotron>
                <h1>Ethereum</h1>
                {avatar}
                <p>{addr}</p>
                <input type="file" ref="import" id="import" onChange={this.promptImportPassword} />
                <Button onClick={this.selectImport}>Import</Button>
                <Button onClick={this.generate}>New</Button>
                <Button onClick={this.promptExportPassword} disabled={wallet ? false : true}>Export</Button>
            </Jumbotron>
        </div>
    }
}

export default Wallet;