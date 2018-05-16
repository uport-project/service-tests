const generate = require('ethjs-account').generate
const FuelTokenMgr = require("../src/lib/fuelTokenMgr");
require('dotenv').config();
const rp = require('request-promise');


describe('Unnu', () => {

    
    beforeAll(()=>{
        entropy=btoa(Math.random())+btoa(Math.random());
        
        fuelTokenMgr= new FuelTokenMgr();
        fuelTokenMgr.setSecrets(process.env);

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    })

    test('/createIdentity_x30', done => {
        let promises=[];
      
        for(let i=0;i<30;i++){
            deviceKey=generate(entropy);
            recoveryKey=generate(entropy);

            console.log("DeviceKey   : "+deviceKey.address);
            console.log("RecoveryKey : "+recoveryKey.address);

            //Create fuelToken for deviceKey
            const fuelToken=fuelTokenMgr.newToken(deviceKey.address);
            const options = {
                method: 'POST',
                uri: 'https://api.uport.space/unnu/createIdentity',
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

            promises.push( new Promise( async (donePromise,failPromise) => {
                let parsedBody;
                try{
                    parsedBody=await rp(options)
                    expect(parsedBody.status).toEqual('success', 'on i='+i)
                    const txHash=parsedBody.data.txHash
                    expect(txHash).toBeDefined();
                    donePromise(parsedBody);
                }catch(err){
                    if(err.statusCode==500){
                        expect(err.error.status).toEqual('error')   
                        expect(err.error.message).toEqual('no available addresses')  
                        donePromise(err.error);
                    }else{
                        failPromise(err)
                    }
                }
            }));

        }

        console.log("# promises: "+promises.length)
        
        Promise.all(promises)
        .catch( (err)=>{
            fail(err);
        })
        .then( (promisesRes) => {
            //console.log(promisesRes);
            let successCount=0;
            let errorCount=0;
            promisesRes.forEach( (res) =>{
                if(res.status=='success') successCount++;
                if(res.status=='error') errorCount++;
            })
            expect(successCount).toEqual(20);
            expect(errorCount).toEqual(10);
            
            done();
        })

    });


});