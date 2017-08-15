import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import getObject from '../../../../utils/getObject';

export default function visitBinding(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute,
	local
) {
	const { name } = getObject(attribute.value);
	const { snippet, contexts, dependencies } = block.contextualise(
		attribute.value
	);

	contexts.forEach(context => {
		if (!~local.allUsedContexts.indexOf(context))
			local.allUsedContexts.push(context);
	});

	const contextual = block.contexts.has(name);

	let obj;
	let prop;

	if (contextual) {
		obj = block.listNames.get(name);
		prop = block.indexNames.get(name);
	} else if (attribute.value.type === 'MemberExpression') {
		prop = `[✂${attribute.value.property.start}-${attribute.value.property
			.end}✂]`;
		if (!attribute.value.computed) prop = `'${prop}'`;
		obj = `[✂${attribute.value.object.start}-${attribute.value.object.end}✂]`;
	} else {
		obj = 'state';
		prop = `'${name}'`;
	}

	local.bindings.push({
		name: attribute.name,
		value: attribute.value,
		snippet: snippet,
		obj,
		prop,
		dependencies
	});

	generator.hasComplexBindings = true;
}
