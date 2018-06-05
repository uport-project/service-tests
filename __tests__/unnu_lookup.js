const rp = require('request-promise');


describe('Unnu', () => {
    beforeAll(()=>{
        
    })

    test('/lookup', done => {
        const options = {
            method: 'POST',
            uri: 'https://api.uport.me/unnu/lookup',
            body: {
                deviceKey: '0xD351063c0Bd4Ea7eBbaadb65D751eB473E1a4AeD'
            },
            json: true 
        };

        rp(options)
        .then( (parsedBody) =>{
            console.log(parsedBody);
            expect(parsedBody.status).toEqual('success')

            const identity=parsedBody.data.identity
            expect(identity).toBeDefined();

            //TODO. Check if tx is mined!
            done();
        })
        .catch((err) =>{
            fail(err);
        });


        done();
    });


});