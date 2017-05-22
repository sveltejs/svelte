import deindent from '../../../../../utils/deindent.js';

export default function getSetter ({ block, name, context, attribute, dependencies, value }) {
	const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

	if ( block.contexts.has( name ) ) {
		const prop = dependencies[0];

		return deindent`
			var list = this.${context}.${block.listNames.get( name )};
			var index = this.${context}.${block.indexNames.get( name )};
			list[index]${tail} = ${value};

			${block.component}._set({ ${prop}: ${block.component}.get( '${prop}' ) });
		`;
	}

	if ( attribute.value.type === 'MemberExpression' ) {
		const alias = block.alias( name );

		return deindent`
			var ${alias} = ${block.component}.get( '${name}' );
			${alias}${tail} = ${value};
			${block.component}._set({ ${name}: ${alias} });
		`;
	}

	return `${block.component}._set({ ${name}: ${value} });`;
}

function getTailSnippet ( node ) {
	const end = node.end;
	while ( node.type === 'MemberExpression' ) node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}
