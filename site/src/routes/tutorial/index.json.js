import * as fs from 'fs';
import { extract_frontmatter } from '../../utils/markdown';

let json;

function get_sections() {
	const slugs = new Set();

	const sections = fs.readdirSync(`content/tutorial`)
		.filter(dir => /^\d+/.test(dir))
		.map(dir => {
			const meta = JSON.parse(fs.readFileSync(`content/tutorial/${dir}/meta.json`, 'utf-8'));

			return {
				title: meta.title,
				chapters: fs.readdirSync(`content/tutorial/${dir}`)
					.filter(dir => /^\d+/.test(dir))
					.map(tutorial => {
						const md = fs.readFileSync(`content/tutorial/${dir}/${tutorial}/text.md`, 'utf-8');
						const { metadata, content } = extract_frontmatter(md);

						const slug = tutorial.replace(/^\d+-/, '');

						if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
						slugs.add(slug);

						return {
							slug,
							title: metadata.title,
							section_dir: dir,
							chapter_dir: tutorial,
						};
					})
			}
		});

	return sections;
}

export function get(req, res) {
	if (!json || process.env.NODE_ENV !== 'production') {
		json = JSON.stringify(get_sections());
	}

	res.set({
		'Content-Type': 'application/json'
	});

	res.end(json);
}
