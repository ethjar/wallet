# Ethjar

This is an Ethereum wallet optimized for running offline. It is intended to
be used as a cold storage wallet, served locally.

Transactions will be published through the use of QR codes that is scanned with a mobile device. This means that the private wallet key will never have to be exposed to the Internet.

Wallets can be saved and loaded in V3 format which is compatible with the official ethereum wallet.

You can see a demo at https://ethjar.github.io

## Developing

Install dependencies:

    npm install


Start a local version:

    npm start

Build a new release:

    npm run build
