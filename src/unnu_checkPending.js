
//Call Unnu
const rp = require('request-promise');
const options = {
    method: 'POST',
    uri: 'https://api.uport.me/unnu/checkPending',
    body: {
        blockchain: 'rinkeby',
        age: 3600
    },
    json: true // Automatically stringifies the body to JSON
};

rp(options)
    .then( (parsedBody) => {
        console.log("Success!");
        console.log(parsedBody)
    })
    .catch( (err) => {
        console.log("Error!");
        console.log(err)
    });

        

