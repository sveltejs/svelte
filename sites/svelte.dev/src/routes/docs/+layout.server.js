import { extract_frontmatter } from '$lib/server/markdown';
import fs from 'fs';
import { base } from '$app/paths';

export const prerender = true;

const base_dir = '../../site/content/docs/';

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	const sections = fs.readdirSync(base_dir).map((file) => {
		const { title } = extract_frontmatter(fs.readFileSync(`${base_dir}/${file}`, 'utf-8')).metadata;

		return {
			title,
			path: `${base}/docs/${file.slice(3, -3)}`,
		};
	});

	return {
		sections,
	};
}
