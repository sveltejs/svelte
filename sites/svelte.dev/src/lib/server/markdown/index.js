import { marked } from 'marked';

const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

/**
 * @param {keyof typeof escapeReplacements} ch
 */
const getEscapeReplacement = (ch) => escapeReplacements[ch];

/**
 * @param {string} html
 * @param {boolean} encode
 */
export function escape(html, encode = false) {
	if (encode) {
		if (escapeTest.test(html)) {
			return html.replace(escapeReplace, getEscapeReplacement);
		}
	} else {
		if (escapeTestNoEncode.test(html)) {
			return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
		}
	}

	return html;
}

/** @type {Partial<import('marked').Renderer>} */
const default_renderer = {
	code(code, infostring, escaped) {
		const lang = (infostring || '').match(/\S*/)[0];

		code = code.replace(/\n$/, '') + '\n';

		if (!lang) {
			return '<pre><code>' + (escaped ? code : escape(code, true)) + '</code></pre>\n';
		}

		return (
			'<pre><code class="language-' +
			escape(lang, true) +
			'">' +
			(escaped ? code : escape(code, true)) +
			'</code></pre>\n'
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

/** @param {string} markdown */
export function extract_frontmatter(markdown) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);

	/** @type {Record<string, string>} */
	const metadata = {};
	frontmatter.split('\n').forEach((pair) => {
		const i = pair.indexOf(':');
		metadata[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
	});

	return { metadata, body };
}
