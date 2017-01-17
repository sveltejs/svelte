export default {
	enter ( generator, node ) {
		function stringify ( chunk ) {
			if ( chunk.type === 'Text' ) return chunk.data;
			if ( chunk.type === 'MustacheTag' ) {
				const { snippet } = generator.contextualise( chunk.expression );
				return '${__escape( ' + snippet + ')}';
			}
		}

		const props = node.attributes
			.map( attribute => {
				if ( attribute.type !== 'Attribute' ) return;

				let value;

				if ( attribute.value === true ) {
					value = `true`;
				} else if ( attribute.value.length === 0 ) {
					value = `''`;
				} else if ( attribute.value.length === 1 ) {
					const chunk = attribute.value[0];
					if ( chunk.type === 'Text' ) {
						value = isNaN( chunk.data ) ? JSON.stringify( chunk.data ) : chunk.data;
					} else {
						const { snippet } = generator.contextualise( chunk.expression );
						value = snippet;
					}
				} else {
					value = '`' + attribute.value.map( stringify ).join( '' ) + '`';
				}

				return `${attribute.name}: ${value}`;
			})
			.filter( Boolean )
			.join( ', ' );

		let open = `\${template.components.${node.name}.render({${props}}`;

		if ( node.children.length ) {
			open += `, { yield: () => \``;
		}

		generator.append( open );
	},

	leave ( generator, node ) {
		const close = node.children.length ? `\` })}` : ')}';
		generator.append( close );
	}
};
