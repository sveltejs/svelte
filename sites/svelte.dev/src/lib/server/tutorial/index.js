import { createShikiHighlighter } from 'shiki-twoslash';
import { SHIKI_LANGUAGE_MAP, transform } from '../markdown';

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
