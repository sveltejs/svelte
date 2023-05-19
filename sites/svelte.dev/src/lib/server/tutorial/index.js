import { CONTENT_BASE_PATHS } from '$lib/constants.js';
import fs from 'node:fs';
import { createShikiHighlighter } from 'shiki-twoslash';
import { SHIKI_LANGUAGE_MAP, extract_frontmatter, transform } from '../markdown/index.js';

/**
 * @param {import('./types').TutorialData} tutorial_data
 * @param {string} slug
 */
export async function get_parsed_tutorial(tutorial_data, slug) {
	const tutorial = tutorial_data
		.find(({ tutorials }) => tutorials.find((t) => t.slug === slug))
		?.tutorials?.find((t) => t.slug === slug);

	if (!tutorial) return null;

	const body = tutorial.content;

	const highlighter = await createShikiHighlighter({ theme: 'css-variables' });

	const content = transform(body, {
		/**
		 * @param {string} html
		 */
		heading(html) {
			const title = html
				.replace(/<\/?code>/g, '')
				.replace(/&quot;/g, '"')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');

			return title;
		},
		code: (source, language) => {
			let html = '';

			source = source
				.replace(/^([\-\+])?((?:    )+)/gm, (match, prefix = '', spaces) => {
					if (prefix && language !== 'diff') return match;

					// for no good reason at all, marked replaces tabs with spaces
					let tabs = '';
					for (let i = 0; i < spaces.length; i += 4) {
						tabs += '  ';
					}
					return prefix + tabs;
				})
				.replace(/\*\\\//g, '*/');

			html = highlighter.codeToHtml(source, { lang: SHIKI_LANGUAGE_MAP[language] });

			html = html
				.replace(
					/^(\s+)<span class="token comment">([\s\S]+?)<\/span>\n/gm,
					(match, intro_whitespace, content) => {
						// we use some CSS trickery to make comments break onto multiple lines while preserving indentation
						const lines = (intro_whitespace + content).split('\n');
						return lines
							.map((line) => {
								const match = /^(\s*)(.*)/.exec(line);
								const indent = (match[1] ?? '').replace(/\t/g, '  ').length;

								return `<span class="token comment wrapped" style="--indent: ${indent}ch">${
									line ?? ''
								}</span>`;
							})
							.join('');
					}
				)
				.replace(/\/\*…\*\//g, '…');

			return html;
		},
		codespan: (text) => '<code>' + text + '</code>'
	});

	return { ...tutorial, content };
}

/**
 * @returns {import('./types').TutorialData}
 */
export function get_tutorial_data(base = CONTENT_BASE_PATHS.TUTORIAL) {
	const tutorials = [];

	for (const subdir of fs.readdirSync(base)) {
		const section = {
			title: '', // Initialise with empty
			slug: subdir.split('-').slice(1).join('-'),
			tutorials: []
		};

		if (!(fs.statSync(`${base}/${subdir}`).isDirectory() || subdir.endsWith('meta.json'))) continue;

		if (!subdir.endsWith('meta.json'))
			section.title = JSON.parse(fs.readFileSync(`${base}/${subdir}/meta.json`, 'utf-8')).title;

		for (const section_dir of fs.readdirSync(`${base}/${subdir}`)) {
			const match = /\d{2}-(.+)/.exec(section_dir);
			if (!match) continue;

			const slug = match[1];

			const tutorial_base_dir = `${base}/${subdir}/${section_dir}`;

			// Read the file, get frontmatter
			const contents = fs.readFileSync(`${tutorial_base_dir}/text.md`, 'utf-8');
			const { metadata, body } = extract_frontmatter(contents);

			// Get the contents of the apps.
			const completion_states_data = { initial: [], complete: [] };
			for (const app_dir of fs.readdirSync(tutorial_base_dir)) {
				if (!app_dir.startsWith('app-')) continue;

				const app_dir_path = `${tutorial_base_dir}/${app_dir}`;
				const app_contents = fs.readdirSync(app_dir_path, 'utf-8');

				for (const file of app_contents) {
					completion_states_data[app_dir === 'app-a' ? 'initial' : 'complete'].push({
						name: file,
						type: file.split('.').at(-1),
						content: fs.readFileSync(`${app_dir_path}/${file}`, 'utf-8')
					});
				}
			}

			section.tutorials.push({
				title: metadata.title,
				slug,
				content: body,
				dir: `${subdir}/${section_dir}`,
				...completion_states_data
			});
		}

		tutorials.push(section);
	}

	return tutorials;
}

/**
 * @param {import('./types').TutorialData} tutorial_data
 * @returns {import('./types').TutorialsList}
 */
export function get_tutorial_list(tutorial_data) {
	return tutorial_data.map((section) => ({
		title: section.title,
		tutorials: section.tutorials.map((tutorial) => ({
			title: tutorial.title,
			slug: tutorial.slug
		}))
	}));
}
