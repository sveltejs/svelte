import deindent from '../../../../../utils/deindent.js';

export default function getSetter ({ block, name, keypath, context, attribute, dependencies, value }) {
	if ( block.contexts.has( name ) ) {
		const prop = dependencies[0];
		const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

		return deindent`
			var list = this.${context}.${block.listNames.get( name )};
			var index = this.${context}.${block.indexNames.get( name )};
			list[index]${tail} = ${value};

			${block.component}._set({ ${prop}: ${block.component}.get( '${prop}' ) });
		`;
	}

	if ( attribute.value.type === 'MemberExpression' ) {
		return deindent`
			var ${name} = ${block.component}.get( '${name}' );
			${keypath} = ${value};
			${block.component}._set({ ${name}: ${name} });
		`;
	}

	return `${block.component}._set({ ${name}: ${value} });`;
}

export function getTailSnippet ( node ) {
	const end = node.end;
	while ( node.type === 'MemberExpression' ) node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}
