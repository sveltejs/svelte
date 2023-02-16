import * as fs from 'fs';
import * as path from 'path';
import { renderCodeToHTML, runTwoSlash, createShikiHighlighter } from 'shiki-twoslash';
import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-typescript.js';
import 'prism-svelte';
import { escape, extract_frontmatter, transform } from '../markdown';
// import { render, replace_placeholders } from './render.js';
// import { parse_route_id } from '../../../../../../packages/kit/src/utils/routing.js';
import ts, { ScriptTarget } from 'typescript';
import MagicString from 'magic-string';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

/** @param {string} title */
export function slugify(title) {
	return title
		.toLowerCase()
		.replace(/&#39;/g, '')
		.replace(/&lt;/g, '')
		.replace(/&gt;/g, '')
		.replace(/[^a-z0-9-$]/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-/, '')
		.replace(/-$/, '');
}

/** @param {string} markdown */
export function removeMarkdown(markdown) {
	return markdown
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/`(.+?)`/g, '$1')
		.replace(/~~(.+?)~~/g, '$1')
		.replace(/\[(.+?)\]\(.+?\)/g, '$1')
		.replace(/\n/g, ' ')
		.replace(/ {2,}/g, ' ')
		.trim();
}

/** @param {string} html */
export function removeHTMLEntities(html) {
	return html.replace(/&.+?;/g, '');
}

/** @param {string} str */
export const normalizeSlugify = (str) => {
	return slugify(removeHTMLEntities(removeMarkdown(str))).replace(/(<([^>]+)>)/gi, '');
};

const base = '../../site/content/docs/';

const languages = {
	bash: 'bash',
	env: 'bash',
	html: 'html',
	svelte: 'svelte',
	sv: 'svelte',
	js: 'javascript',
	css: 'css',
	diff: 'diff',
	ts: 'typescript',
	'': '',
};

/**
 * @param {string} file
 */
export async function read_file(file) {
	const match = /\d{2}-(.+)\.md/.exec(path.basename(file));
	if (!match) return null;

	// const markdown = replace_placeholders(fs.readFileSync(`${base}/${file}`, 'utf-8'));
	const markdown = fs.readFileSync(`${base}/${file}`, 'utf-8');

	const highlighter = await createShikiHighlighter({ theme: 'css-variables' });

	const { metadata, body } = extract_frontmatter(markdown);

	const { content, sections } = parse({
		file,
		body: generate_ts_from_js(body),
		code: (source, language, current) => {
			const hash = createHash('sha256');
			hash.update(source + language + current);
			const digest = hash.digest().toString('base64').replace(/\//g, '-');

			// TODO: cache
			// if (fs.existsSync(`${snippet_cache}/${digest}.html`)) {
			// 	return fs.readFileSync(`${snippet_cache}/${digest}.html`, 'utf-8');
			// }

			/** @type {Record<string, string>} */
			const options = {};

			let html = '';

			source = source
				.replace(/^\/\/\/ (.+?): (.+)\n/gm, (_, key, value) => {
					options[key] = value;
					return '';
				})
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

			let version_class = '';
			if (language === 'generated-ts' || language === 'generated-svelte') {
				language = language.replace('generated-', '');
				version_class = 'ts-version';
			} else if (language === 'original-js' || language === 'original-svelte') {
				language = language.replace('original-', '');
				version_class = 'js-version';
			}

			// TODO: Replace later
			html = highlighter.codeToHtml(source, { lang: languages[language] });

			// if (language === 'dts') {
			// 	// @ts-ignore
			// 	html = renderCodeToHTML(source, 'ts', { twoslash: false }, {}, highlighter);
			// } else if (language === 'js' || language === 'ts') {
			// 	try {
			// 		const injected = [];
			// 		if (
			// 			source.includes('$app/') ||
			// 			source.includes('$service-worker') ||
			// 			source.includes('@sveltejs/kit/')
			// 		) {
			// 			injected.push(
			// 				`// @filename: ambient-kit.d.ts`,
			// 				`/// <reference types="@sveltejs/kit" />`
			// 			);
			// 		}

			// 		if (source.includes('$env/')) {
			// 			// TODO we're hardcoding static env vars that are used in code examples
			// 			// in the types, which isn't... totally ideal, but will do for now
			// 			injected.push(
			// 				`declare module '$env/dynamic/private' { export const env: Record<string, string> }`,
			// 				`declare module '$env/dynamic/public' { export const env: Record<string, string> }`,
			// 				`declare module '$env/static/private' { export const API_KEY: string }`,
			// 				`declare module '$env/static/public' { export const PUBLIC_BASE_URL: string }`
			// 			);
			// 		}

			// 		if (source.includes('./$types') && !source.includes('@filename: $types.d.ts')) {
			// 			const params = parse_route_id(options.file || `+page.${language}`)
			// 				.params.map((param) => `${param.name}: string`)
			// 				.join(', ');

			// 			injected.push(
			// 				`// @filename: $types.d.ts`,
			// 				`import type * as Kit from '@sveltejs/kit';`,
			// 				`export type PageLoad = Kit.Load<{${params}}>;`,
			// 				`export type PageServerLoad = Kit.ServerLoad<{${params}}>;`,
			// 				`export type LayoutLoad = Kit.Load<{${params}}>;`,
			// 				`export type LayoutServerLoad = Kit.ServerLoad<{${params}}>;`,
			// 				`export type RequestHandler = Kit.RequestHandler<{${params}}>;`,
			// 				`export type Action = Kit.Action<{${params}}>;`,
			// 				`export type Actions = Kit.Actions<{${params}}>;`
			// 			);
			// 		}

			// 		// special case — we need to make allowances for code snippets coming
			// 		// from e.g. ambient.d.ts
			// 		if (file.endsWith('30-modules.md')) {
			// 			injected.push('// @errors: 7006 7031');
			// 		}

			// 		// another special case
			// 		if (source.includes('$lib/types')) {
			// 			injected.push(`declare module '$lib/types' { export interface User {} }`);
			// 		}

			// 		if (injected.length) {
			// 			const injected_str = injected.join('\n');
			// 			if (source.includes('// @filename:')) {
			// 				source = source.replace('// @filename:', `${injected_str}\n\n// @filename:`);
			// 			} else {
			// 				source = source.replace(
			// 					/^(?!\/\/ @)/m,
			// 					`${injected_str}\n\n// @filename: index.${language}\n// ---cut---\n`
			// 				);
			// 			}
			// 		}

			// 		const twoslash = runTwoSlash(source, language, {
			// 			defaultCompilerOptions: {
			// 				allowJs: true,
			// 				checkJs: true,
			// 				target: 'es2021',
			// 			},
			// 		});

			// 		html = renderCodeToHTML(
			// 			twoslash.code,
			// 			'ts',
			// 			{ twoslash: true },
			// 			{},
			// 			highlighter,
			// 			twoslash
			// 		);
			// 	} catch (e) {
			// 		console.error(`Error compiling snippet in ${file}`);
			// 		console.error(e.code);
			// 		throw e;
			// 	}

			// 	// we need to be able to inject the LSP attributes as HTML, not text, so we
			// 	// turn &lt; into &amp;lt;
			// 	html = html.replace(
			// 		/<data-lsp lsp='([^']*)'([^>]*)>(\w+)<\/data-lsp>/g,
			// 		(match, lsp, attrs, name) => {
			// 			if (!lsp) return name;
			// 			return `<data-lsp lsp='${lsp.replace(/&/g, '&amp;')}'${attrs}>${name}</data-lsp>`;
			// 		}
			// 	);

			// 	// preserve blank lines in output (maybe there's a more correct way to do this?)
			// 	html = html.replace(/<div class='line'><\/div>/g, '<div class="line"> </div>');
			// } else if (language === 'diff') {
			// 	const lines = source.split('\n').map((content) => {
			// 		let type = null;
			// 		if (/^[\+\-]/.test(content)) {
			// 			type = content[0] === '+' ? 'inserted' : 'deleted';
			// 			content = content.slice(1);
			// 		}

			// 		return {
			// 			type,
			// 			content: escape(content),
			// 		};
			// 	});

			// 	html = `<pre class="language-diff"><code>${lines
			// 		.map((line) => {
			// 			if (line.type) return `<span class="${line.type}">${line.content}\n</span>`;
			// 			return line.content + '\n';
			// 		})
			// 		.join('')}</code></pre>`;
			// } else {
			// 	const plang = languages[language];
			// 	const highlighted = plang
			// 		? PrismJS.highlight(source, PrismJS.languages[plang], language)
			// 		: source.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

			// 	html = `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
			// }

			if (options.file) {
				html = `<div class="code-block"><span class="filename">${options.file}</span>${html}</div>`;
			}

			if (version_class) {
				html = html.replace(/class=('|")/, `class=$1${version_class} `);
			}

			// type_regex.lastIndex = 0;

			html = html
				// .replace(type_regex, (match, prefix, name) => {
				// 	if (options.link === 'false' || name === current) {
				// 		// we don't want e.g. RequestHandler to link to RequestHandler
				// 		return match;
				// 	}

				// 	const link = `<a href="${type_links.get(name)}">${name}</a>`;
				// 	return `${prefix || ''}${link}`;
				// })
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

			// fs.writeFileSync(`${snippet_cache}/${digest}.html`, html);
			return html;
		},
		codespan: (text) => {
			return (
				'<code>' +
				text +
				// text.replace(type_regex, (match, prefix, name) => {
				// 	const link = `<a href="${type_links.get(name)}">${name}</a>`;
				// 	return `${prefix || ''}${link}`;
				// }) +
				'</code>'
			);
		},
	});

	return {
		file,
		slug: match[1],
		title: metadata.title,
		content,
		sections,
	};
}

/**
 * @param {{
 *   file: string;
 *   body: string;
 *   code: (source: string, language: string, current: string) => string;
 *   codespan: (source: string) => string;
 * }} opts
 */
function parse({ file, body, code, codespan }) {
	const headings = [];

	/** @type {import('./types').Section[]} */
	const sections = [];

	/** @type {import('./types').Section} */
	let section;

	// this is a bit hacky, but it allows us to prevent type declarations
	// from linking to themselves
	let current = '';

	/** @type {string} */
	const content = transform(body, {
		/**
		 * @param {string} html
		 * @param {number} level
		 */
		heading(html, level, raw) {
			const title = html
				.replace(/<\/?code>/g, '')
				.replace(/&quot;/g, '"')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');

			current = title;

			const normalized = normalizeSlugify(raw);

			headings[level - 1] = normalized;
			headings.length = level;

			const slug = headings.filter(Boolean).join('-');

			// TODO: All this will need to change when headings in documentation are restructured to be h2+ instead of h3+ as they are right now
			if (level === 3) {
				section = {
					title,
					slug,
					sections: [],
				};

				sections.push(section);
			} else if (level === 4 || level === 5) {
				(section?.sections ?? sections).push({
					title,
					slug,
				});
			} else {
				throw new Error(`Unexpected <h${level}> in ${file}`);
			}

			return `<h${
				level - 1
			} id="${slug}">${html}<a href="#${slug}" class="permalink"><span class="visually-hidden">permalink</span></a></h${level}>`;
		},
		code: (source, language) => code(source, language, current),
		codespan,
	});

	return {
		sections,
		content,
	};
}

export function generate_ts_from_js(markdown) {
	return markdown
		.replaceAll(/```js\n([\s\S]+?)\n```/g, (match, code) => {
			if (!code.includes('/// file:')) {
				// No named file -> assume that the code is not meant to be shown in two versions
				return match;
			}
			if (code.includes('/// file: svelte.config.js')) {
				// svelte.config.js has no TS equivalent
				return match;
			}

			const ts = convert_to_ts(code);

			if (!ts) {
				// No changes -> don't show TS version
				return match;
			}

			return match.replace('js', 'original-js') + '\n```generated-ts\n' + ts + '\n```';
		})
		.replaceAll(/```svelte\n([\s\S]+?)\n```/g, (match, code) => {
			if (!code.includes('/// file:')) {
				// No named file -> assume that the code is not meant to be shown in two versions
				return match;
			}

			// Assumption: no context="module" blocks
			const script = code.match(/<script>([\s\S]+?)<\/script>/);
			if (!script) return match;

			const [outer, inner] = script;
			const ts = convert_to_ts(inner, '\t', '\n');

			if (!ts) {
				// No changes -> don't show TS version
				return match;
			}

			return (
				match.replace('svelte', 'original-svelte') +
				'\n```generated-svelte\n' +
				code.replace(outer, `<script lang="ts">${ts}</script>`) +
				'\n```'
			);
		});
}

/**
 * Transforms a JS code block into a TS code block by turning JSDoc into type annotations.
 * Due to pragmatism only the cases currently used in the docs are implemented.
 * @param {string} js_code
 * @param {string} [indent]
 * @param {string} [offset]
 *  */
function convert_to_ts(js_code, indent = '', offset = '') {
	js_code = js_code
		.replaceAll('// @filename: index.js', '// @filename: index.ts')
		.replace(/(\/\/\/ .+?\.)js/, '$1ts')
		// *\/ appears in some JsDoc comments in d.ts files due to the JSDoc-in-JSDoc problem
		.replace(/\*\\\//g, '*/');

	const ast = ts.createSourceFile(
		'filename.ts',
		js_code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const code = new MagicString(js_code);
	const imports = new Map();

	function walk(node) {
		// @ts-ignore
		if (node.jsDoc) {
			// @ts-ignore
			for (const comment of node.jsDoc) {
				let modified = false;

				for (const tag of comment.tags ?? []) {
					if (ts.isJSDocTypeTag(tag)) {
						const [name, generics] = get_type_info(tag);

						if (ts.isFunctionDeclaration(node)) {
							const is_export = node.modifiers?.some(
								(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
							)
								? 'export '
								: '';
							const is_async = node.modifiers?.some(
								(modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword
							);
							code.overwrite(
								node.getStart(),
								node.name.getEnd(),
								`${is_export ? 'export ' : ''}const ${node.name.getText()} = (${
									is_async ? 'async ' : ''
								}`
							);
							code.appendLeft(node.body.getStart(), '=> ');
							const type = generics !== undefined ? `${name}${generics}` : name;
							code.appendLeft(node.body.getEnd(), `) satisfies ${type};`);

							modified = true;
						} else if (
							ts.isVariableStatement(node) &&
							node.declarationList.declarations.length === 1
						) {
							const variable_statement = node.declarationList.declarations[0];

							if (variable_statement.name.getText() === 'actions') {
								code.appendLeft(variable_statement.getEnd(), ` satisfies ${name}`);
							} else {
								code.appendLeft(variable_statement.name.getEnd(), `: ${name}`);
							}

							modified = true;
						} else {
							throw new Error('Unhandled @type JsDoc->TS conversion: ' + js_code);
						}
					} else if (ts.isJSDocParameterTag(tag) && ts.isFunctionDeclaration(node)) {
						if (node.parameters.length !== 1) {
							throw new Error(
								'Unhandled @type JsDoc->TS conversion; needs more params logic: ' + node.getText()
							);
						}
						const [name] = get_type_info(tag);
						code.appendLeft(node.parameters[0].getEnd(), `: ${name}`);

						modified = true;
					}
				}

				if (modified) {
					code.overwrite(comment.getStart(), comment.getEnd(), '');
				}
			}
		}

		ts.forEachChild(node, walk);
	}

	walk(ast);

	if (imports.size) {
		const import_statements = Array.from(imports.entries())
			.map(([from, names]) => {
				return `${indent}import type { ${Array.from(names).join(', ')} } from '${from}';`;
			})
			.join('\n');
		const idxOfLastImport = [...ast.statements]
			.reverse()
			.find((statement) => ts.isImportDeclaration(statement))
			?.getEnd();
		const insertion_point = Math.max(
			idxOfLastImport ? idxOfLastImport + 1 : 0,
			js_code.includes('---cut---')
				? js_code.indexOf('\n', js_code.indexOf('---cut---')) + 1
				: js_code.includes('/// file:')
				? js_code.indexOf('\n', js_code.indexOf('/// file:')) + 1
				: 0
		);
		code.appendLeft(insertion_point, offset + import_statements + '\n');
	}

	const transformed = code.toString();
	return transformed === js_code ? undefined : transformed.replace(/\n\s*\n\s*\n/g, '\n\n');

	/** @param {ts.JSDocTypeTag | ts.JSDocParameterTag} tag */
	function get_type_info(tag) {
		const type_text = tag.typeExpression.getText();
		let name = type_text.slice(1, -1); // remove { }

		const import_match = /import\('(.+?)'\)\.(\w+)(<{?[\n\* \w:;,]+}?>)?/.exec(type_text);
		if (import_match) {
			const [, from, _name, generics] = import_match;
			name = _name;
			const existing = imports.get(from);
			if (existing) {
				existing.add(name);
			} else {
				imports.set(from, new Set([name]));
			}
			if (generics !== undefined) {
				return [
					name,
					generics
						.replaceAll('*', '') // get rid of JSDoc asterisks
						.replace('  }>', '}>'), // unindent closing brace
				];
			}
		}
		return [name];
	}
}
