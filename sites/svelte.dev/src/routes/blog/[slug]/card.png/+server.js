import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import OverpassRegular from './Overpass-Regular.ttf';
import { html as toReactNode } from 'satori-html';
import { get_post } from '$lib/server/blog/index.js';
import { error } from '@sveltejs/kit';
import Card from './Card.svelte';

const height = 630;
const width = 1200;

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params, url }) => {
	const post = get_post(params.slug);

	if (!post) {
		throw error(404);
	}

	// @ts-ignore
	const result = Card.render({ post });
	const element = toReactNode(`${result.html}<style>${result.css.code}</style>`);

	const svg = await satori(element, {
		fonts: [
			{
				name: 'Overpass',
				data: Buffer.from(OverpassRegular),
				style: 'normal',
				weight: 400
			}
		],
		height,
		width
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: width
		}
	});

	const image = resvg.render();

	return new Response(image.asPng(), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=600' // cache for 10 minutes
		}
	});
};
