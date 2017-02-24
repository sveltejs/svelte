import parse from 'css-tree/lib/parser/index.js';
import walk from 'css-tree/lib/utils/walk.js';

const commentsPattern = /\/\*[\s\S]*?\*\//g;

export default function processCss ( parsed, code ) {
	const css = parsed.css.content.styles;
	const offset = parsed.css.content.start;

	const ast = parse( css, {
		positions: true
	});

	const attr = `[svelte-${parsed.hash}]`;

	walk.rules( ast, rule => {
		rule.selector.children.each( selector => {
			const start = selector.loc.start.offset;
			const end = selector.loc.end.offset;

			const selectorString = css.slice( start, end );

			const firstToken = selector.children.head;

			let transformed;

			if ( firstToken.data.type === 'TypeSelector' ) {
				const insert = firstToken.data.loc.end.offset;
				const head = css.slice( start, insert );
				const tail = css.slice( insert, end );

				transformed = `${head}${attr}${tail}, ${attr} ${selectorString}`;
			} else {
				transformed = `${attr}${selectorString}, ${attr} ${selectorString}`;
			}

			code.overwrite( start + offset, end + offset, transformed );
		});
	});

	// remove comments. TODO would be nice if this was exposed in css-tree
	let match;
	while ( match = commentsPattern.exec( css ) ) {
		const start = match.index + offset;
		const end = start + match[0].length;

		code.remove( start, end );
	}

	return code.slice( parsed.css.content.start, parsed.css.content.end );
}