import { content } from './content.server';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	return json({
		blocks: content()
	});
}
