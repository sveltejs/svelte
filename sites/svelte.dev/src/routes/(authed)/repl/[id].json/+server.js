import { dev } from '$app/environment';
import { client } from '$lib/db/client.js';
import * as gist from '$lib/db/gist.js';
import examples_data from '$lib/generated/examples-data.js';
import { get_example, get_examples_list } from '$lib/server/examples/index.js';
import { error, json } from '@sveltejs/kit';

export const prerender = 'auto';

const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/;

/** @type {Set<string>} */
let examples;

/** @param {import('$lib/server/examples/types').ExamplesData[number]['examples'][number]['files'][number][]} files  */
function munge(files) {
	return files
		.map((file) => {
			const dot = file.name.lastIndexOf('.');
			let name = file.name.slice(0, dot);
			let type = file.name.slice(dot + 1);

			if (type === 'html') type = 'svelte';
			// @ts-expect-error what is file.source? by @PuruVJ
			return { name, type, source: file.source ?? file.content ?? '' };
		})
		.sort((a, b) => {
			if (a.name === 'App' && a.type === 'svelte') return -1;
			if (b.name === 'App' && b.type === 'svelte') return 1;

			if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

			return a.name < b.name ? -1 : 1;
		});
}

export async function GET({ params }) {
	// Currently, these pages(that are in examples/) are prerendered. To avoid making any FS requests,
	// We prerender examples pages during build time. That means, when something like `/repl/hello-world.json`
	// is accessed, this function won't be run at all, as it will be served from the filesystem

	examples = new Set(
		get_examples_list(examples_data)
			.map((category) => category.examples)
			.flat()
			.map((example) => example.slug)
	);

	if (examples.has(params.id)) {
		const example = get_example(examples_data, params.id);

		return json({
			id: params.id,
			name: example.title,
			owner: null,
			relaxed: false, // TODO is this right? EDIT: It was example.relaxed before, which no example return to my knowledge. By @PuruVJ
			components: munge(example.files)
		});
	}

	if (dev && !client) {
		// in dev with no local Supabase configured, proxy to production
		// this lets us at least load saved REPLs
		const res = await fetch(`https://svelte.dev/repl/${params.id}.json`);

		// returning the response directly results in a bizarre
		// content encoding error, so we create a new one
		return new Response(await res.text(), {
			status: res.status,
			headers: {
				'content-type': 'application/json'
			}
		});
	}

	if (!UUID_REGEX.test(params.id)) {
		throw error(404);
	}

	const app = await gist.read(params.id);

	if (!app) {
		throw error(404, 'not found');
	}

	return json({
		id: params.id,
		name: app.name,
		// @ts-ignore
		owner: app.userid,
		relaxed: false,
		// @ts-expect-error app.files has a `source` property
		components: munge(app.files)
	});
}

export async function entries() {
	return get_examples_list(examples_data)
		.map(({ examples }) => examples)
		.flatMap((val) => val.map(({ slug }) => ({ id: slug })));
}
