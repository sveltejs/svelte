import * as fs from 'fs';
import send from '@polka/send';
import { extract_frontmatter } from '@sveltejs/site-kit/utils/markdown';

let json;

function get_sections() {
	const slugs = new Set();

	const sections = fs.readdirSync(`content/tutorial`)
		.filter(dir => /^\d+/.test(dir))
		.map(dir => {
			let meta;

			try {
				meta = JSON.parse(fs.readFileSync(`content/tutorial/${dir}/meta.json`, 'utf-8'));
			} catch (err) {
				throw new Error(`Error reading metadata for ${dir}`);
			}

			return {
				title: meta.title,
				chapters: fs.readdirSync(`content/tutorial/${dir}`)
					.filter(dir => /^\d+/.test(dir))
					.map(tutorial => {
						try {
							const md = fs.readFileSync(`content/tutorial/${dir}/${tutorial}/text.md`, 'utf-8');
							const { metadata } = extract_frontmatter(md);

							const slug = tutorial.replace(/^\d+-/, '');

							if (slugs.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
							slugs.add(slug);

							return {
								slug,
								title: metadata.title,
								section_dir: dir,
								chapter_dir: tutorial,
							};
						} catch (err) {
							throw new Error(`Error building tutorial ${dir}/${tutorial}: ${err.message}`);
						}
					})
			};
		});

	return sections;
}

export function get(req, res) {
	try {
		if (!json || process.env.NODE_ENV !== 'production') {
			json = get_sections();
		}

		send(res, 200, json);
	} catch (err) {
		send(res, 500, {
			message: err.message
		});
	}
}
