import deindent from '../../../../../utils/deindent.js';

export default function getSetter ({ current, name, context, attribute, dependencies, snippet, value }) {
	if ( name in current.contexts ) {
		const prop = dependencies[0];
		const tail = attribute.value.type === 'MemberExpression' ? getTailSnippet( attribute.value ) : '';

		return deindent`
			var list = this.${context}.${current.listNames[ name ]};
			var index = this.${context}.${current.indexNames[ name ]};
			list[index]${tail} = ${value};

			component._set({ ${prop}: component.get( '${prop}' ) });
		`;
	}
	
	if ( attribute.value.type === 'MemberExpression' ) {
		return deindent`
			var ${name} = component.get( '${name}' );
			${snippet} = ${value};
			component._set({ ${name}: ${name} });
		`;
	}
	
	return `component._set({ ${name}: ${value} });`;
}

function getTailSnippet ( node ) {
	const end = node.end;
	while ( node.type === 'MemberExpression' ) node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}