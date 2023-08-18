// @ts-expect-error custom suffix doesn't have types
import js from './redirect.js?minified';

// prerenderer will choke otherwise
export const prerender = false;

export function GET() {
	return new Response(`<html><head><script>${js}</script></head></html>`, {
		headers: {
			'content-type': 'text/html'
		}
	});
}
