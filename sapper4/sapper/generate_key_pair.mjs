import generateKeyPair from 'jose/util/generate_key_pair';
import fromKeyLike from 'jose/jwk/from_key_like';
import parseJwk from 'jose/jwk/parse';
import SignJWT from 'jose/jwt/sign'
import jwtVerify from 'jose/jwt/verify'

(async () => {
	const alg = 'ES256'
	const { publicKey, privateKey } = await generateKeyPair(alg)
	//console.log(publicKey.export({type:'spki',format:'pem'}))
	//console.log(JSON.stringify(publicKey,null,' '))
	//console.log(privateKey)

	const privateJwk = await fromKeyLike(privateKey)
	const publicJwk = await fromKeyLike(publicKey)

	privateJwk.alg = alg
	publicJwk.alg = alg
	const x = {private:privateJwk,public:publicJwk}
	console.log(x)

	const ecPrivateKey = await parseJwk(x.private)
	const rsaPublicKey = await parseJwk(x.public)
	ecPrivateKey.alg = alg
	rsaPublicKey.alg = alg

	const jwt = await new SignJWT({ 'urn:id': 545 })
	  .setProtectedHeader({ alg })
	  .setIssuedAt()
	  .setIssuer('urn:example:issuer')
	  .setAudience('urn:example:audience')
	  .setExpirationTime('2h')
	  .sign(privateKey)

	console.log(jwt)

	const { payload, protectedHeader } = await jwtVerify(jwt, rsaPublicKey, {
	  issuer: 'urn:example:issuer',
	  audience: 'urn:example:audience'
	})

	console.log(protectedHeader)
	console.log(payload)

})();
