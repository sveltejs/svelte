export default {
	enter ( generator, node ) {
		function stringify ( chunk ) {
			if ( chunk.type === 'Text' ) return chunk.data;
			if ( chunk.type === 'MustacheTag' ) {
				const { snippet } = generator.contextualise( chunk.expression );
				return '${__escape( ' + snippet + ')}';
			}
		}

		const attributes = [];
		const bindings = [];

		node.attributes.forEach( attribute => {
			if ( attribute.type === 'Attribute' ) {
				attributes.push( attribute );
			} else if ( attribute.type === 'Binding' ) {
				bindings.push( attribute );
			}
		});

		const props = attributes
			.map( attribute => {
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
			.concat( bindings.map( binding => {
				const parts = binding.value.split( '.' );
				const value = parts[0] in generator.current.contexts ? binding.value : `root.${binding.value}`;
				return `${binding.name}: ${value}`;
			}))
			.join( ', ' );

		const expression = node.name === ':Self' ? generator.name : `template.components.${node.name}`;

		bindings.forEach( binding => {
			generator.addBinding( binding, expression );
		});

		let open = `\${${expression}.render({${props}}`;

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
