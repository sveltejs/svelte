// @ts-check
import { createShikiHighlighter } from 'shiki-twoslash';
import { SHIKI_LANGUAGE_MAP, escape, transform } from '../markdown';

/**
 * @param {import('./types').BlogData} blog_data
 * @param {string} slug
 */
export async function get_processed_blog_post(blog_data, slug) {
	const post = blog_data.find((post) => post.slug === slug);

	if (!post) return null;

	const highlighter = await createShikiHighlighter({ theme: 'css-variables' });

	return {
		...post,
		content: transform(post.content, {
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

				if (language === 'diff') {
					const lines = source.split('\n').map((content) => {
						let type = null;
						if (/^[\+\-]/.test(content)) {
							type = content[0] === '+' ? 'inserted' : 'deleted';
							content = content.slice(1);
						}

						return {
							type,
							content: escape(content)
						};
					});

					html = `<pre class="language-diff"><code>${lines
						.map((line) => {
							if (line.type) return `<span class="${line.type}">${line.content}\n</span>`;
							return line.content + '\n';
						})
						.join('')}</code></pre>`;
				} else {
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
				}

				return html;
			},
			codespan: (text) => '<code>' + text + '</code>'
		})
	};
}
