const didJWT = require('did-jwt')
const EthrDID = require ('ethr-did');

class FuelTokenDidMgr {
  constructor() {
    this.signer = null;
    this.mnid = null;
  }
  isSecretsSet() {
    return this.signer !== null;
  }

  setSecrets(secrets) {
    this.signer = didJWT.SimpleSigner(secrets.DID_SIGNING_KEY);
    this.mnid = secrets.DID_MNID;
  }

  async newToken(deviceKey) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      type: 'fuel',
      iat: now,
      exp: now + 31536000, //in a year
      sub: deviceKey,
      allowed: [
        "unnu::rinkeby:*", 
        "unnu::kovan:*",
        "unnu::ropste:*" 
      ]
    };
    const config={
      issuer: this.mnid,
      signer: this.signer
    }

    const keypair={
      privateKey: process.env.DEVELOP_FUEL_TOKEN_DID_PRIVATE_KEY,
      address: process.env.DEVELOP_FUEL_TOKEN_DID_ADDRESS
    }
    
    const ethrDid = new EthrDID({...keypair})
    const signedJwt = await ethrDid.signJWT(payload)
    console.log(signedJwt);
  
    return signedJwt;
  }

  
}

module.exports = FuelTokenDidMgr;
