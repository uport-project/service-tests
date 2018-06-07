const generate = require('ethjs-account').generate
const FuelTokenDidMgr = require("../src/lib/fuelTokenDidMgr");
require('dotenv').config();
const rp = require('request-promise');


describe('Unnu', () => {

    
    beforeAll(()=>{
        const entropy=btoa(Math.random())+btoa(Math.random());
        deviceKey=generate(entropy);
        recoveryKey=generate(entropy);

        console.log("DeviceKey   : "+deviceKey.address);
        console.log(deviceKey)
        console.log("RecoveryKey : "+recoveryKey.address);

        fuelTokenDidMgr= new FuelTokenDidMgr();
        fuelTokenDidMgr.setSecrets(process.env);
    })

    test('/createIdentity', done => {
        //Create fuelToken for deviceKey
        fuelTokenDidMgr.newToken(deviceKey.address)
        .then( (fuelToken) => {
            const options = {
                method: 'POST',
                uri: 'https://api.uport.me/unnu/createIdentity',
                body: {
                    deviceKey: deviceKey.address,
                    recoveryKey: recoveryKey.address,
                    blockchain: 'rinkeby',
                    managerType: 'MetaIdentityManager'
                },
                headers: {
                    'Authorization': 'Bearer '+fuelToken
                },
                json: true 
            };
    
            console.log(options)
            return rp(options)
        })
        .then( (parsedBody) =>{
            console.log(parsedBody);
            expect(parsedBody.status).toEqual('success')

            const txHash=parsedBody.data.txHash
            expect(txHash).toBeDefined();

            //TODO. Check if tx is mined!
            done();
        })
        .catch((err) =>{
            fail(err);
            done(err);
        });


    });


});