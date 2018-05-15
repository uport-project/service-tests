const generate = require('ethjs-account').generate
const FuelTokenMgr = require("../src/lib/fuelTokenMgr");
require('dotenv').config();
const Transaction = require("ethereumjs-tx");
const signers=require("eth-signer").signers;
const Promise=require("bluebird");
const rp = require('request-promise');
    


describe('Sensui', () => {

    let fuelTokenMgr;
    let deviceKey;
    let destinationKey; 
    
    beforeAll(()=>{
        const entropy=btoa(Math.random())+btoa(Math.random());
        deviceKey=generate(entropy);
        destinationKey=generate(entropy);

        console.log("DeviceKey     : "+deviceKey.address);
        //console.log("DestinationKey: "+destinationKey.address);

        fuelTokenMgr= new FuelTokenMgr();
        fuelTokenMgr.setSecrets(process.env);

    })

    test('/fund', done => {
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
        const rawTx = tx.serialize().toString("hex");
        
        //Sign Tx
        const SimpleSigner = signers.SimpleSigner;
        const signer = Promise.promisifyAll(new SimpleSigner(deviceKey));


        signer.signRawTxAsync(rawTx)
        .then( (signedTx) => {
            //console.log("signedTx:"+signedTx);
            
            //Call Sensui
            const options = {
                method: 'POST',
                uri: 'https://api.uport.me/sensui/fund',
                body: {
                    tx: signedTx,
                    blockchain: 'rinkeby'
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
        });
    });


});