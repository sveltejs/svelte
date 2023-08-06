import { content } from './content.server';
import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
	return json({
		blocks: await content()
	});
}
