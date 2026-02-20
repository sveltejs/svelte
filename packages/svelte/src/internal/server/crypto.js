import { BROWSER } from 'esm-env';

let text_encoder;
// TODO - remove this and use global `crypto` when we drop Node 18
let crypto;

/** @param {string} data */
export async function sha256(data) {
	text_encoder ??= new TextEncoder();

	// @ts-expect-error
	crypto ??= globalThis.crypto?.subtle?.digest
		? globalThis.crypto
		: // @ts-ignore - we don't install node types in the prod build
			// don't use 'node:crypto' because static analysers will think we rely on node when we don't
			// don't use something like 'node:' + 'crypto' because that will still result in an error if the user is doing a multi-step build and it gets simplified on the first pass
			(await import(/* @vite-ignore */ atob('bm9kZTpjcnlwdG8'))).webcrypto;

	const hash_buffer = await crypto.subtle.digest('SHA-256', text_encoder.encode(data));

	return base64_encode(hash_buffer);
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function base64_encode(bytes) {
	// Using `Buffer` is faster than iterating
	// @ts-ignore
	if (!BROWSER && globalThis.Buffer) {
		// @ts-ignore
		return globalThis.Buffer.from(bytes).toString('base64');
	}

	let binary = '';

	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return btoa(binary);
}
