import js from './redirect.js?raw';

// prerenderer will choke otherwise
export const prerender = false;

export function GET() {
	return new Response(`<html><head><script>${js}</script></head></html>`, {
		headers: {
			'content-type': 'text/html'
		}
	});
}
