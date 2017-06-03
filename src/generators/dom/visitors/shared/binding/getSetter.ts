import deindent from '../../../../../utils/deindent.js';

export default function getSetter({
	block,
	name,
	snippet,
	context,
	attribute,
	dependencies,
	value,
}) {
	const tail = attribute.value.type === 'MemberExpression'
		? getTailSnippet(attribute.value)
		: '';

	if (block.contexts.has(name)) {
		const prop = dependencies[0];
		const computed = isComputed(attribute.value);

		return deindent`
			var list = this.${context}.${block.listNames.get(name)};
			var index = this.${context}.${block.indexNames.get(name)};
			${computed && `var state = ${block.component}.get();`}
			list[index]${tail} = ${value};

			${block.component}._set({ ${prop}: ${block.component}.get( '${prop}' ) });
		`;
	}

	if (attribute.value.type === 'MemberExpression') {
		const alias = block.alias(name);

		return deindent`
			var state = ${block.component}.get();
			${snippet} = ${value};
			${block.component}._set({ ${name}: state.${name} });
		`;
	}

	return `${block.component}._set({ ${name}: ${value} });`;
}

function getTailSnippet(node) {
	const end = node.end;
	while (node.type === 'MemberExpression') node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}

function isComputed(node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}
