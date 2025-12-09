let text_encoder;

/** @param {string} data */
export async function sha256(data) {
	text_encoder ??= new TextEncoder();
	const hash_buffer = await crypto.subtle.digest('SHA-256', text_encoder.encode(data));
	return Buffer.from(hash_buffer).toString('base64');
}
