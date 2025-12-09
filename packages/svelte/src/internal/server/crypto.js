// TODO - remove this and use global `crypto` when we drop Node 18
// @ts-ignore - we don't install node types in the prod build
import { webcrypto } from 'node:crypto';

let text_encoder;

/** @param {string} data */
export async function sha256(data) {
	text_encoder ??= new TextEncoder();
	// @ts-ignore - we don't install node types in the prod build
	const hash_buffer = await webcrypto.subtle.digest('SHA-256', text_encoder.encode(data));
	// @ts-ignore - we don't install node types in the prod build
	return Buffer.from(hash_buffer).toString('base64');
}
