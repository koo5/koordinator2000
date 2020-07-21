const base = 'https://localhost:3000/';

export function send({ method, path, data, token }) {
	const fetch = process.browser ? window.fetch : require('node-fetch').default;

	const opts = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		opts.headers['Authorization'] = `Token ${token}`;
	}

	return fetch(`${base}/${path}`, opts)
}

function decode(promise) {
		promise.then(r => r.text())
		.then(json => {
			try {
				return JSON.parse(json);
			} catch (err) {
				return json;
			}
		});
}

export function get(path, token) {
	return decode(send({ method: 'GET', path, token }));
}

export function del(path, token) {
	return decode(send({ method: 'DELETE', path, token }));
}

export function post(path, data, token) {
	return decode(send({ method: 'POST', path, data, token }));
}

export function put(path, data, token) {
	return decode(send({ method: 'PUT', path, data, token }));
}