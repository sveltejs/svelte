import * as jwt from 'jsonwebtoken';

const { JWT_KEY, JWT_ALG, JWT_EXP } = process.env;

const CONFIG = {
	expiresIn: JWT_EXP,
	issuer: 'https://svelte.dev',
	audience: 'https://svelte.dev',
	algorithm: JWT_ALG,
};

export const decode = jwt.decode;

export function sign(obj, opts, cb) {
	opts = Object.assign({}, opts, CONFIG);
	return jwt.sign(obj, JWT_KEY, opts, cb);
}

export function verify(str, opts, cb) {
	opts = Object.assign({}, opts, CONFIG);
	return jwt.verify(str, JWT_KEY, opts, cb);
}
