import * as jose from 'jose';

interface JWK {
    alg?: string;
    kty: string;
    crv?: string;
    x?: string;
    y?: string;
    d?: string;
    n?: string;
    e?: string;
    [key: string]: unknown;
}

interface KeyPair {
    private: JWK;
    public: JWK;
}

interface HasuraJwtSecret {
    type: string;
    key: string;
}

(async () => {
    const alg = 'ES256';

    // Generate key pair with extractable keys
    const { publicKey, privateKey } = await jose.generateKeyPair(alg, { extractable: true });

    // In jose v4+, keys are exported to JWK using exportJWK
    const privateJwk = await jose.exportJWK(privateKey) as JWK;
    const publicJwk = await jose.exportJWK(publicKey) as JWK;

    // Add algorithm to JWKs
    privateJwk.alg = alg;
    publicJwk.alg = alg;

    // Create the key pair object
    const keyPair: KeyPair = { private: privateJwk, public: publicJwk };
    console.log(keyPair);
    console.log();

    // Print MY_APP_KEYS format for environment variables
    console.log("MY_APP_KEYS=" + JSON.stringify(keyPair, null, ''));
    console.log();
    // Note: This should be in .env, not exposed to the client
    console.log('# Warning: Keep the private key secure, for server-side use only!');
    console.log();

    // Print the public key in PEM format
    console.log('Public key PEM format:');
    console.log(await jose.exportSPKI(publicKey));

    const publicKeyPem = await jose.exportSPKI(publicKey);
    console.log('\nHASURA_GRAPHQL_JWT_SECRET (PEM format):');
    const hasuraSecret: HasuraJwtSecret = {
        type: 'ES256',
        key: publicKeyPem
    };
    console.log(JSON.stringify(hasuraSecret, null, 2));
    console.log();

    // Import the keys from JWK
    const ecPrivateKey = await jose.importJWK(keyPair.private, alg);
    const ecPublicKey = await jose.importJWK(keyPair.public, alg);

    // Create a JWT with the private key
    const jwt = await new jose.SignJWT({ 'urn:id': 545 })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('2h')
        .sign(ecPrivateKey);

    console.log('jwt:', jwt);
    console.log();

    // Verify the JWT with the public key
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, ecPublicKey, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience'
    });

    console.log(protectedHeader);
    console.log();
    console.log(payload);
})();
