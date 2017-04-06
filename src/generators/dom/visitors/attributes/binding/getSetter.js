import deindent from '../../../../../utils/deindent.js';

export default function getSetter ({ fragment, name, keypath, context, attribute, dependencies, value }) {
	if ( fragment.contexts.has( name ) ) {
		const prop = dependencies[0];
		const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

		return deindent`
			var list = this.${context}.${fragment.listNames.get( name )};
			var index = this.${context}.${fragment.indexNames.get( name )};
			list[index]${tail} = ${value};

			${fragment.component}._set({ ${prop}: ${fragment.component}.get( '${prop}' ) });
		`;
	}

	if ( attribute.value.type === 'MemberExpression' ) {
		return deindent`
			var ${name} = ${fragment.component}.get( '${name}' );
			${keypath} = ${value};
			${fragment.component}._set({ ${name}: ${name} });
		`;
	}

	return `${fragment.component}._set({ ${name}: ${value} });`;
}

function getTailSnippet ( node ) {
	const end = node.end;
	while ( node.type === 'MemberExpression' ) node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}
