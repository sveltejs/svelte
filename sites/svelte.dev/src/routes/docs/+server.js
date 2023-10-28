// @ts-ignore custom suffix doesn't have types and cba to add them just for this
import js from 'virtual:minified-raw:./redirect.js';

// avoid outputting a file named "docs" that would conflict with prerendered "docs" directory
export const prerender = false;

export function GET() {
	return new Response(`<html><head><script>${js}</script></head></html>`, {
		headers: {
			'content-type': 'text/html'
		}
	});
}
