import deindent from '../../../../../utils/deindent.js';

export default function getSetter ({ current, name, keypath, context, attribute, dependencies, value }) {
	if ( current.contexts.has( name ) ) {
		const prop = dependencies[0];
		const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

		return deindent`
			var list = this.${context}.${current.listNames.get( name )};
			var index = this.${context}.${current.indexNames.get( name )};
			list[index]${tail} = ${value};

			${current.component}._set({ ${prop}: ${current.component}.get( '${prop}' ) });
		`;
	}

	if ( attribute.value.type === 'MemberExpression' ) {
		return deindent`
			var ${name} = ${current.component}.get( '${name}' );
			${keypath} = ${value};
			${current.component}._set({ ${name}: ${name} });
		`;
	}

	return `${current.component}._set({ ${name}: ${value} });`;
}

function getTailSnippet ( node ) {
	const end = node.end;
	while ( node.type === 'MemberExpression' ) node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}
