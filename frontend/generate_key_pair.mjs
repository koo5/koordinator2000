import * as jose from 'jose'

(async () => {
    const alg = 'ES256'
    
    // Generate key pair with extractable keys
    const { publicKey, privateKey } = await jose.generateKeyPair(alg, { extractable: true })
    
    // In jose v4+, keys are exported to JWK using exportJWK
    const privateJwk = await jose.exportJWK(privateKey)
    const publicJwk = await jose.exportJWK(publicKey)
    
    // Add algorithm to JWKs
    privateJwk.alg = alg
    publicJwk.alg = alg
    
    // Create the key pair object
    const keyPair = { private: privateJwk, public: publicJwk }
    console.log(keyPair)
    console.log()
    
    // Print MY_APP_KEYS format for environment variables
    console.log("MY_APP_KEYS=" + JSON.stringify(keyPair, null, ''))
    console.log()
    // Note: This should be in .env, not exposed to the client
    console.log('# Warning: Keep the private key secure, for server-side use only!')
    console.log()
    
    // Import the keys from JWK
    const ecPrivateKey = await jose.importJWK(keyPair.private, alg)
    const ecPublicKey = await jose.importJWK(keyPair.public, alg)
    
    // Create a JWT with the private key
    const jwt = await new jose.SignJWT({ 'urn:id': 545 })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('2h')
        .sign(ecPrivateKey)
    
    console.log(jwt)
    console.log()
    
    // Verify the JWT with the public key
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, ecPublicKey, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience'
    })
    
    console.log(protectedHeader)
    console.log()
    console.log(payload)
})();