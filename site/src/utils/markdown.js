import * as fleece from 'golden-fleece';

export function extract_frontmatter(markdown) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	const frontMatter = match[1];
	const content = markdown.slice(match[0].length);

	const metadata = {};
	frontMatter.split('\n').forEach(pair => {
		const colonIndex = pair.indexOf(':');
		metadata[pair.slice(0, colonIndex).trim()] = pair
			.slice(colonIndex + 1)
			.trim();
	});

	return { metadata, content };
}

export function extract_metadata(line, lang) {
	try {
		if (lang === 'html' && line.startsWith('<!--') && line.endsWith('-->')) {
			return fleece.evaluate(line.slice(4, -3).trim());
		}

		if (
			lang === 'js' ||
			(lang === 'json' && line.startsWith('/*') && line.endsWith('*/'))
		) {
			return fleece.evaluate(line.slice(2, -2).trim());
		}
	} catch (err) {
		// TODO report these errors, don't just squelch them
		return null;
	}
}

// map lang to prism-language-attr
export const langs = {
	bash: 'bash',
	html: 'markup',
	sv: 'markup',
	js: 'javascript',
	css: 'css'
};
