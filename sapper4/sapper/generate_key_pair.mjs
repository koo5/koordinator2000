import generateKeyPair from 'jose/util/generate_key_pair';

(async () => {
	const { publicKey, privateKey } = await generateKeyPair('PS256')
	console.log(publicKey.export({type:'spki',format:'pem'}))
	console.log(JSON.stringify(publicKey,null,' '))
	console.log(privateKey)
})();
