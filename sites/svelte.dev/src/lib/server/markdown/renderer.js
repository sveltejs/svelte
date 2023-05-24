import MagicString from 'magic-string';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createShikiHighlighter, renderCodeToHTML, runTwoSlash } from 'shiki-twoslash';
import ts from 'typescript';
import {
	SHIKI_LANGUAGE_MAP,
	escape,
	normalizeSlugify,
	slugify,
	transform
} from '../markdown/index.js';

const METADATA_REGEX = /(?:<!---\s*([\w-]+):\s*(.*?)\s*--->|\/\/\/\s*([\w-]+):\s*(.*))\n/gm;

/**
 * @param {string} filename
 * @param {string} body
 * @param {{
 * twoslashBanner?: (filename: string, content: string) => string,
 * modules?: import('$lib/generated/types').Modules,
 * cacheCodeSnippets?: boolean
 * }} options
 */
export async function render_markdown(
	filename,
	body,
	{ twoslashBanner = svelte_twoslash_banner, modules = [], cacheCodeSnippets = true } = {}
) {
	const highlighter = await createShikiHighlighter({ theme: 'css-variables' });

	const { type_links, type_regex } = create_type_links(modules);
	const SNIPPET_CACHE = await create_snippet_cache(cacheCodeSnippets);

	return parse({
		file: filename,
		body: generate_ts_from_js(replace_placeholders(body, modules)),
		code: (source, language, current) => {
			const cached_snippet = SNIPPET_CACHE.get(source + language + current);
			if (cached_snippet.code) return cached_snippet.code;

			/** @type {Record<'file' | 'link', string | null>} */
			const options = { file: null, link: null };

			source = collect_options(source, options);
			source = adjust_tab_indentation(source, language);

			let version_class = '';
			if (/^generated-(ts|svelte)$/.test(language)) {
				language = language.replace('generated-', '');
				version_class = 'ts-version';
			} else if (/^original-(js|svelte)$/.test(language)) {
				language = language.replace('original-', '');
				version_class = 'js-version';
			}

			let html = syntax_highlight({ filename, highlighter, language, source, twoslashBanner });

			if (options.file) {
				html = `<div class="code-block"><span class="filename">${options.file}</span>${html}</div>`;
			}

			if (version_class) {
				html = html.replace(/class=('|")/, `class=$1${version_class} `);
			}

			type_regex.lastIndex = 0;

			html = html.replace(type_regex, (match, prefix, name, pos, str) => {
				const char_after = str.slice(pos + match.length, pos + match.length + 1);

				if (options.link === 'false' || name === current || /(\$|\d|\w)/.test(char_after)) {
					// we don't want e.g. RequestHandler to link to RequestHandler
					return match;
				}

				const link = `<a href="${type_links.get(name)}">${name}</a>`;
				return `${prefix || ''}${link}`;
			});

			html = indent_multiline_comments(html);

			html = html.replace(/\/\*…\*\//g, '…');

			// Save everything locally now
			SNIPPET_CACHE.save(cached_snippet?.uid, html);

			return html;
		},
		codespan: (text) => {
			return (
				'<code>' +
				text.replace(type_regex, (_, prefix, name) => {
					const link = `<a href="${type_links.get(name)}">${name}</a>`;
					return `${prefix || ''}${link}`;
				}) +
				'</code>'
			);
		}
	});
}

/**
 * @param {{
 *   file: string;
 *   body: string;
 *   code: (source: string, language: string, current: string) => string;
 *   codespan: (source: string) => string;
 * }} opts
 */
function parse({ body, code, codespan }) {
	const headings = [];

	// this is a bit hacky, but it allows us to prevent type declarations
	// from linking to themselves
	let current = '';

	/** @type {string} */
	const content = transform(body, {
		heading(html, level, raw) {
			const title = html
				.replace(/<\/?code>/g, '')
				.replace(/&quot;/g, '"')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');

			current = title;

			const normalized = normalizeSlugify(raw);

			headings[level] = normalized;
			headings.length = level;

			const type_heading_match = /^\[TYPE\]:\s+(.+)/.exec(raw);

			const slug = normalizeSlugify(type_heading_match ? `type-${type_heading_match[1]}` : raw);

			return `<h${level} id="${slug}">${html
				.replace(/<\/?code>/g, '')
				.replace(
					/^\[TYPE\]:\s+(.+)/,
					'$1'
				)}<a href="#${slug}" class="permalink"><span class="visually-hidden">permalink</span></a></h${level}>`;
		},
		code: (source, language) => code(source, language, current),
		codespan
	});

	return content;
}

/** @param {string} markdown */
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
			if (!METADATA_REGEX.test(code)) {
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
				code.replace(outer, `<script lang="ts">\n\t${ts.trim()}\n</script>`) +
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
								code.appendLeft(variable_statement.name.getEnd(), `: ${name}${generics ?? ''}`);
							}

							modified = true;
						} else {
							throw new Error('Unhandled @type JsDoc->TS conversion: ' + js_code);
						}
					} else if (ts.isJSDocParameterTag(tag) && ts.isFunctionDeclaration(node)) {
						// if (node.parameters.length !== 1) {
						// 	throw new Error(
						// 		'Unhandled @type JsDoc->TS conversion; needs more params logic: ' + node.getText()
						// 	);
						// }
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
						.replace('  }>', '}>') // unindent closing brace
				];
			}
		}
		return [name];
	}
}

/**
 * @param {string} content
 * @param {import('$lib/generated/types').Modules} modules
 */
export function replace_placeholders(content, modules) {
	return content
		.replace(/> EXPANDED_TYPES: (.+?)#(.+)$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name}`);

			const type = module.types.find((t) => t.name === id);

			return (
				type.comment +
				type.children
					.map((child) => {
						let section = `### ${child.name}`;

						if (child.bullets) {
							section += `\n\n<div class="ts-block-property-bullets">\n\n${child.bullets.join(
								'\n'
							)}\n\n</div>`;
						}

						section += `\n\n${child.comment}`;

						if (child.children) {
							section += `\n\n<div class="ts-block-property-children">\n\n${child.children
								.map((v) => stringify(v))
								.join('\n')}\n\n</div>`;
						}

						return section;
					})
					.join('\n\n')
			);
		})
		.replace(/> TYPES: (.+?)(?:#(.+))?$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name}`);

			if (id) {
				const type = module.types.find((t) => t.name === id);

				return (
					`<div class="ts-block">${fence(type.snippet, 'dts')}` +
					type.children.map((v) => stringify(v)).join('\n\n') +
					`</div>`
				);
			}

			return `${module.comment}\n\n${module.types
				.map((t) => {
					let children = t.children.map((val) => stringify(val, 'dts')).join('\n\n');

					const markdown = `<div class="ts-block">${fence(t.snippet, 'dts')}` + children + `</div>`;
					return `### [TYPE]: ${t.name}\n\n${t.comment}\n\n${markdown}\n\n`;
				})
				.join('')}`;
		})
		.replace(/> EXPORT_SNIPPET: (.+?)#(.+)?$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name} for EXPORT_SNIPPET clause`);

			if (!id) {
				throw new Error(`id is required for module ${name}`);
			}

			const exported = module.exports.filter((t) => t.name === id);

			return exported
				.map((exportVal) => `<div class="ts-block">${fence(exportVal.snippet, 'dts')}</div>`)
				.join('\n\n');
		})
		.replace('> MODULES', () => {
			return modules
				.map((module) => {
					if (module.exports.length === 0 && !module.exempt) return '';

					let import_block = '';

					if (module.exports.length > 0) {
						// deduplication is necessary for now, because of `error()` overload
						const exports = Array.from(new Set(module.exports.map((x) => x.name)));

						let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
						if (declaration.length > 80) {
							declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
						}

						import_block = fence(declaration, 'js');
					}

					return `## ${module.name}\n\n${import_block}\n\n${module.comment}\n\n${module.exports
						.map((type) => {
							const markdown =
								`<div class="ts-block">${fence(type.snippet)}` +
								type.children.map((v) => stringify(v)).join('\n\n') +
								`</div>`;
							return `### ${type.name}\n\n${type.comment}\n\n${markdown}`;
						})
						.join('\n\n')}`;
				})
				.join('\n\n');
		})
		.replace(/> EXPORTS: (.+)/, (_, name) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name} for EXPORTS: clause`);

			if (module.exports.length === 0 && !module.exempt) return '';

			let import_block = '';

			if (module.exports.length > 0) {
				// deduplication is necessary for now, because of `error()` overload
				const exports = Array.from(new Set(module.exports.map((x) => x.name)));

				let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
				if (declaration.length > 80) {
					declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
				}

				import_block = fence(declaration, 'js');
			}

			return `${import_block}\n\n${module.comment}\n\n${module.exports
				.map((type) => {
					const markdown =
						`<div class="ts-block">${fence(type.snippet, 'dts')}` +
						type.children.map((val) => stringify(val, 'dts')).join('\n\n') +
						`</div>`;
					return `### ${type.name}\n\n${type.comment}\n\n${markdown}`;
				})
				.join('\n\n')}`;
		});
}

/**
 * @param {string} code
 * @param {keyof typeof import('../markdown/index').SHIKI_LANGUAGE_MAP} lang
 */
function fence(code, lang = 'ts') {
	return (
		'\n\n```' +
		lang +
		'\n' +
		(['js', 'ts'].includes(lang) ? '// @noErrors\n' : '') +
		code +
		'\n```\n\n'
	);
}

/**
 * @param {import('$lib/generated/types').Modules[number]['types'][number]} member
 * @param {keyof typeof import('../markdown').SHIKI_LANGUAGE_MAP} [lang]
 */
function stringify(member, lang = 'ts') {
	const bullet_block =
		member.bullets.length > 0
			? `\n\n<div class="ts-block-property-bullets">\n\n${member.bullets.join('\n')}</div>`
			: '';

	const child_block =
		member.children.length > 0
			? `\n\n<div class="ts-block-property-children">${member.children
					.map((val) => stringify(val, lang))
					.join('\n')}</div>`
			: '';

	return (
		`<div class="ts-block-property">${fence(member.snippet, lang)}` +
		`<div class="ts-block-property-details">\n\n` +
		bullet_block +
		'\n\n' +
		member.comment
			.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
			.replace(/^(  )+/gm, (match, spaces) => {
				return '\t'.repeat(match.length / 2);
			}) +
		child_block +
		'\n</div></div>'
	);
}

/**
 * @type {(filename: string, source: string) => string}
 */
export const svelte_twoslash_banner = (filename, source) => {
	const injected = [];

	if (/(svelte)/.test(source) || filename.includes('typescript')) {
		injected.push(
			`// @filename: ambient.d.ts`,
			`/// <reference types="svelte" />`,
			`/// <reference types="svelte/action" />`,
			`/// <reference types="svelte/compiler" />`,
			`/// <reference types="svelte/easing" />`,
			`/// <reference types="svelte/motion" />`,
			`/// <reference types="svelte/transition" />`,
			`/// <reference types="svelte/store" />`,
			`/// <reference types="svelte/action" />`
		);
	}

	if (filename.includes('svelte-compiler')) {
		injected.push('// @esModuleInterop');
	}

	if (filename.includes('svelte.md')) {
		injected.push('// @errors: 2304');
	}

	// Actions JSDoc examples are invalid. Too many errors, edge cases
	if (filename.includes('svelte-action')) {
		injected.push('// @noErrors');
	}

	if (filename.includes('typescript')) {
		injected.push('// @errors: 2304');
	}

	// Tutorials
	if (filename.startsWith('tutorial')) {
		injected.push('// @noErrors');
	}

	return injected.join('\n');
};

/** @param {string} start_path */
function find_nearest_node_modules(start_path) {
	if (fs.existsSync(path.join(start_path, 'node_modules'))) {
		return path.resolve(start_path, 'node_modules');
	}

	const parentDir = path.dirname(start_path);

	if (start_path === parentDir) {
		return null;
	}

	return find_nearest_node_modules(parentDir);
}

/**
 * @param {boolean} should
 */
async function create_snippet_cache(should) {
	const snippet_cache = find_nearest_node_modules(import.meta.url) + '/.snippets';

	/** @type {Map<string, string>} */
	const cache = new Map();

	try {
		if (should) fs.mkdirSync(snippet_cache, { recursive: true });
	} catch {}

	/**
	 * @param {string} source
	 */
	function get(source) {
		if (!should) return { uid: null, code: null };

		const hash = createHash('sha256');
		hash.update(source);
		const digest = hash.digest().toString('base64').replace(/\//g, '-');

		if (cache.has(digest)) return { uid: digest, code: cache.get(digest) };

		/** @type {string | null} */
		let content = null;

		try {
			content = fs.readFileSync(`${snippet_cache}/${digest}.html`, 'utf-8');
			cache.set(digest, content);
		} catch {}

		return { code: content, uid: digest };
	}

	/**
	 * @param {string | null} uid
	 * @param {string} content
	 */
	function save(uid, content) {
		if (!should) return;

		fs.writeFileSync(`${snippet_cache}/${uid}.html`, content);
	}

	return { get, save };
}

/**
 * @param {import('$lib/generated/types').Modules} modules
 */
function create_type_links(modules) {
	const type_regex = new RegExp(
		`(import\\(&apos;(?:svelte|@sveltejs\\/kit)&apos;\\)\\.)?\\b(${modules
			.flatMap((module) => module.types)
			.map((type) => type?.name)
			.join('|')})\\b`,
		'g'
	);

	const type_links = new Map();

	for (const module of modules) {
		const slug = slugify(module.name ?? '');

		for (const type of module.types ?? []) {
			const link = `/docs/${slug}#type-${slugify(type.name)}`;
			type_links.set(type.name, link);
		}
	}

	return { type_regex, type_links };
}

/**
 * @param {string} source
 * @param {Record<'file' | 'link', string | null>} options
 */
function collect_options(source, options) {
	return source.replace(
		/(?:<!---\s*([\w-]+):\s*(.*?)\s*--->|\/\/\/\s*([\w-]+):\s*(.*))\n/gm,
		(_, key, value) => {
			options[key] = value;
			return '';
		}
	);
}

/**
 * @param {string} source
 * @param {string} language
 */
function adjust_tab_indentation(source, language) {
	return source
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
}

/**
 *
 * @param {{
 * source: string,
 * filename: string,
 * language: string,
 * highlighter: ReturnType<import('shiki-twoslash').createShikiHighlighter>
 * twoslashBanner?: (filename: string, source: string) => string
 * }} param0
 */
function syntax_highlight({ source, filename, language, highlighter, twoslashBanner }) {
	let html = '';

	if (language === 'dts') {
		html = renderCodeToHTML(
			source,
			'ts',
			{ twoslash: false },
			{ themeName: 'css-variables' },
			highlighter
		);
	} else if (/^(js|ts)/.test(language)) {
		try {
			const banner = twoslashBanner?.(filename, source);

			if (banner) {
				if (source.includes('// @filename:')) {
					source = source.replace('// @filename:', `${banner}\n\n// @filename:`);
				} else {
					source = source.replace(
						/^(?!\/\/ @)/m,
						`${banner}\n\n// @filename: index.${language}\n` + ` // ---cut---\n`
					);
				}
			}

			const twoslash = runTwoSlash(source, language, {
				defaultCompilerOptions: {
					allowJs: true,
					checkJs: true,
					target: ts.ScriptTarget.ES2022
				}
			});

			html = renderCodeToHTML(
				twoslash.code,
				'ts',
				{ twoslash: true },
				// @ts-ignore Why shiki-twoslash requires a theme name?
				{},
				highlighter,
				twoslash
			);
		} catch (e) {
			console.error(`Error compiling snippet in ${filename}`);
			console.error(e.code);
			throw e;
		}

		// we need to be able to inject the LSP attributes as HTML, not text, so we
		// turn &lt; into &amp;lt;
		html = html.replace(
			/<data-lsp lsp='([^']*)'([^>]*)>(\w+)<\/data-lsp>/g,
			(_, lsp, attrs, name) => {
				if (!lsp) return name;
				return `<data-lsp lsp='${lsp.replace(/&/g, '&amp;')}'${attrs}>${name}</data-lsp>`;
			}
		);

		// preserve blank lines in output (maybe there's a more correct way to do this?)
		html = html.replace(/<div class='line'><\/div>/g, '<div class="line"> </div>');
	} else if (language === 'diff') {
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
		const highlighted = highlighter.codeToHtml(source, {
			lang: SHIKI_LANGUAGE_MAP[language]
		});

		html = highlighted.replace(/<div class='line'><\/div>/g, '<div class="line"> </div>');
	}

	return html;
}

/**
 * @param {string} str
 */
function indent_multiline_comments(str) {
	return str.replace(
		/^(\s+)<span class="token comment">([\s\S]+?)<\/span>\n/gm,
		(_, intro_whitespace, content) => {
			// we use some CSS trickery to make comments break onto multiple lines while preserving indentation
			const lines = (intro_whitespace + content).split('\n');
			return lines
				.map((line) => {
					const match = /^(\s*)(.*)/.exec(line);
					const indent = (match?.[1] ?? '').replace(/\t/g, '  ').length;

					return `<span class="token comment wrapped" style="--indent: ${indent}ch">${
						line ?? ''
					}</span>`;
				})
				.join('');
		}
	);
}
