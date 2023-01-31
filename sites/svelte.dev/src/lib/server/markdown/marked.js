import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-typescript.js';
import 'prism-svelte';
import { marked } from 'marked';

const escape_test = /[&<>"']/;
const escape_replace = /[&<>"']/g;
const escape_test_no_encode = /[<>"']|&(?!#?\w+;)/;
const escape_replace_no_encode = /[<>"']|&(?!#?\w+;)/g;
const escape_replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};
const get_escape_replacement = (ch) => escape_replacements[ch];

/**
 * @param {string} html
 * @param {boolean} encode
 */
export function escape(html, encode) {
	if (encode) {
		if (escape_test.test(html)) {
			return html.replace(escape_replace, get_escape_replacement);
		}
	} else {
		if (escape_test_no_encode.test(html)) {
			return html.replace(escape_replace_no_encode, get_escape_replacement);
		}
	}

	return html;
}

const prism_languages = {
	bash: 'bash',
	env: 'bash',
	html: 'markup',
	svelte: 'svelte',
	js: 'javascript',
	css: 'css',
	diff: 'diff',
	ts: 'typescript',
	'': ''
};

/** @type {Partial<import('marked').Renderer>} */
const default_renderer = {
	code(code, infostring, escaped) {
		const lang = (infostring || '').match(/\S*/)[0];

		const prism_language = prism_languages[lang];

		if (prism_language) {
			const highlighted = PrismJS.highlight(code, PrismJS.languages[prism_language], lang);
			return `<div class="code-block"><pre class="language-${prism_language}"><code>${highlighted}</code></pre></div>`;
		}

		return (
			'<div class="code-block"><pre><code>' +
			(escaped ? code : escape(code, true)) +
			'</code></pre></div>'
		);
	},

	blockquote(quote) {
		return '<blockquote>\n' + quote + '</blockquote>\n';
	},

	html(html) {
		return html;
	},

	heading(text, level) {
		return '<h' + level + '>' + text + '</h' + level + '>\n';
	},

	hr() {
		return '<hr>\n';
	},

	list(body, ordered, start) {
		const type = ordered ? 'ol' : 'ul',
			startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
		return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
	},

	listitem(text) {
		return '<li>' + text + '</li>\n';
	},

	checkbox(checked) {
		return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + '' + '> ';
	},

	paragraph(text) {
		return '<p>' + text + '</p>\n';
	},

	table(header, body) {
		if (body) body = '<tbody>' + body + '</tbody>';

		return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
	},

	tablerow(content) {
		return '<tr>\n' + content + '</tr>\n';
	},

	tablecell(content, flags) {
		const type = flags.header ? 'th' : 'td';
		const tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
		return tag + content + '</' + type + '>\n';
	},

	// span level renderer
	strong(text) {
		return '<strong>' + text + '</strong>';
	},

	em(text) {
		return '<em>' + text + '</em>';
	},

	codespan(text) {
		return '<code>' + text + '</code>';
	},

	br() {
		return '<br>';
	},

	del(text) {
		return '<del>' + text + '</del>';
	},

	link(href, title, text) {
		if (href === null) {
			return text;
		}
		let out = '<a href="' + escape(href) + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>' + text + '</a>';
		return out;
	},

	image(href, title, text) {
		if (href === null) {
			return text;
		}

		let out = '<img src="' + href + '" alt="' + text + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>';
		return out;
	},

	text(text) {
		return text;
	}
};

/**
 * @param {string} markdown
 * @param {Partial<import('marked').Renderer>} renderer
 */
export function transform(markdown, renderer = {}) {
	marked.use({
		renderer: {
			// we have to jump through these hoops because of marked's API design choices —
			// options are global, and merged in confusing ways. You can't do e.g.
			// `new Marked(options).parse(markdown)`
			...default_renderer,
			...renderer
		}
	});

	return marked(markdown);
}
