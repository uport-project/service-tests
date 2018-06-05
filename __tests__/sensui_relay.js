const generate = require('ethjs-account').generate
const FuelTokenMgr = require("../src/lib/fuelTokenMgr");
require('dotenv').config();
const Transaction = require("ethereumjs-tx");
const signers=require("eth-signer").signers;
const Promise=require("bluebird");
const rp = require('request-promise');
const UportIdentity = require('uport-identity');
    
const proxyAddress = process.env.PROXY_ADDRESS;// the address of your proxy contract
const metaIdentityManagerAddress = UportIdentity.MetaIdentityManager.v2.networks['4'].address// the address of the metaIdentityManager contract
const relayAddress = UportIdentity.TxRelay.v2.networks['4'].address // the address of the txRelay contract
const txSenderAddress = '0xb608a90ffc3fd6f61f78edad1e0a6a6974f9dcc5' // the address of the service that is sending your tx
const whitelistOwner = '0x0000000000000000000000000000000000000000'// the owner of a specific whitelist in the txRelay contract. Can be the zero address for no whitelist.

describe('Sensui', () => {

    let fuelTokenMgr;
    let deviceKey;
    let destinationKey; 
    
    beforeAll(()=>{
        const entropy=btoa(Math.random())+btoa(Math.random());
        deviceKey={
            privateKey: process.env.DEVICE_PRIVATE_KEY,
            publicKey: process.env.DEVICE_PUBLIC_KEY,
            address: process.env.DEVICE_ADDRESS
        }
        destinationKey=generate(entropy);

        console.log("DeviceKey     : "+deviceKey.address);
        //console.log("DestinationKey: "+destinationKey.address);

        fuelTokenMgr= new FuelTokenMgr();
        fuelTokenMgr.setSecrets(process.env);

    })

    test('/relay', done => {
        //Create fuelToken for deviceKey
        const fuelToken=fuelTokenMgr.newToken(deviceKey.address);
        //console.log("Fuel Token: "+fuelToken);

        //Create transaction
        let txObj = {
            to: destinationKey.address,
            from: deviceKey.address,
            value: 10000,
            gasPrice: 2000000, //2Gwei
            gasLimit: 21000,
        }
        let tx = new Transaction(txObj);
        const rawTx = '0x'+tx.serialize().toString("hex");
        
        //Sign Tx

        const txRelaySigner = new signers.TxRelaySigner(
            deviceKey, 
            relayAddress, 
            txSenderAddress, 
            '0x0')
        const signer = Promise.promisifyAll(
            new signers.MIMProxySigner(proxyAddress, txRelaySigner, metaIdentityManagerAddress)
        );
            
            

        signer.signRawTxAsync(rawTx)
        .then( (metaSignedTx) => {
            console.log("metaSignedTx:"+metaSignedTx);
            
            //Call Sensui
            const options = {
                method: 'POST',
                uri: 'https://api.uport.me/sensui/relay',
                body: {
                    metaSignedTx: metaSignedTx,
                    blockchain: 'rinkeby',
                    metaNonce: 0
                },
                headers: {
                    'Authorization': 'Bearer '+fuelToken
                },
                json: true
            };

            return rp(options);
        })
        .then( (parsedBody) =>{
            console.log(parsedBody);
            expect(parsedBody.status).toEqual('success')
            const txHash=parsedBody.data
            expect(txHash).toBeDefined();

            //TODO. Check if tx is mined and check if balance is sent!
            done();
        })
        .catch((err) =>{
            fail(err);
            done(err)
        });
    });


});