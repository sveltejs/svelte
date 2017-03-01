const commentsPattern = /\/\*[\s\S]*?\*\//g;

export default function processCss ( parsed, code ) {
	const css = parsed.css.content.styles;
	const offset = parsed.css.content.start;

	const attr = `[svelte-${parsed.hash}]`;

	const keyframes = new Map();

	function walkKeyframes ( node ) {
		if ( node.type === 'Atrule' && node.name.toLowerCase() === 'keyframes' ) {
			node.expression.children.forEach( expression => {
				if ( expression.type === 'Identifier' ) {
					const newName = `svelte-${parsed.hash}-${expression.name}`;
					code.overwrite( expression.start, expression.end, newName );
					keyframes.set( expression.name.toLowerCase(), newName );
				}
			});
		} else if ( node.children ) {
			node.children.forEach( walkKeyframes );
		} else if ( node.block ) {
			walkKeyframes( node.block );
		}
	}

	parsed.css.children.forEach( walkKeyframes );

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

		rule.block.children.forEach( block => {
			if ( block.type === 'Declaration' ) {
				const property = block.property.toLowerCase();
				if ( property === 'animation' || property === 'animation-name' ) {
					block.value.children.forEach( block => {
						if ( block.type === 'Identifier' ) {
							const name = block.name.toLowerCase();
							if ( keyframes.has( name ) ) {
								code.overwrite( block.start, block.end, keyframes.get( name ) );
							}
						}
					});
				}
			}
		});
	}

	function walk ( node ) {
		if ( node.type === 'Rule' ) {
			transform( node );
		} else if ( node.type === 'Atrule' && node.name.toLowerCase() === 'keyframes' ) {
			// these have already been processed
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
		const start = match.index + offset;
		const end = start + match[0].length;

		code.remove( start, end );
	}

	return code.slice( parsed.css.content.start, parsed.css.content.end );
}
