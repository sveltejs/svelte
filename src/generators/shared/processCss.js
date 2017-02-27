const commentsPattern = /\/\*[\s\S]*?\*\//g;

export default function processCss ( parsed, code ) {
	const css = parsed.css.content.styles;
	const offset = parsed.css.content.start;

	const attr = `[svelte-${parsed.hash}]`;

	function transform ( rule ) {
		rule.selector.children.forEach( selector => {
			const start = selector.start - offset;
			const end = selector.end - offset;

			const selectorString = css.slice( start, end );

			const firstToken = selector.children[0];

			let transformed;

			if ( firstToken.type === 'TypeSelector' ) {
				const insert = firstToken.end - offset;
				const head = css.slice( start, insert );
				const tail = css.slice( insert, end );

				transformed = `${head}${attr}${tail}, ${attr} ${selectorString}`;
			} else {
				transformed = `${attr}${selectorString}, ${attr} ${selectorString}`;
			}

			code.overwrite( start + offset, end + offset, transformed );
		});
	}

	function walk ( node ) {
		if ( node.type === 'Rule' ) {
			transform( node );
		} else if ( node.children ) {
			node.children.forEach( walk );
		} else if ( node.block ) {
			walk( node.block );
		}
	}

	parsed.css.children.forEach( walk );

	// remove comments. TODO would be nice if this was exposed in css-tree
	let match;
	while ( match = commentsPattern.exec( css ) ) {
		const start = match.index;
		const end = start + match[0].length;

		code.remove( start, end );
	}

	return code.slice( parsed.css.content.start, parsed.css.content.end );
}