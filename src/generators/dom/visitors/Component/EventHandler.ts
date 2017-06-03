import deindent from '../../../../utils/deindent';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitEventHandler(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node,
	local
) {
	// TODO verify that it's a valid callee (i.e. built-in or declared method)
	generator.addSourcemapLocations(attribute.expression);
	generator.code.prependRight(
		attribute.expression.start,
		`${block.component}.`
	);

	const usedContexts: string[] = [];
	attribute.expression.arguments.forEach((arg: Node) => {
		const { contexts } = block.contextualise(arg, null, true);

		contexts.forEach(context => {
			if (!~usedContexts.indexOf(context)) usedContexts.push(context);
			if (!~local.allUsedContexts.indexOf(context))
				local.allUsedContexts.push(context);
		});
	});

	// TODO hoist event handlers? can do `this.__component.method(...)`
	const declarations = usedContexts.map(name => {
		if (name === 'state') return 'var state = this._context.state;';

		const listName = block.listNames.get(name);
		const indexName = block.indexNames.get(name);

		return `var ${listName} = this._context.${listName}, ${indexName} = this._context.${indexName}, ${name} = ${listName}[${indexName}]`;
	});

	const handlerBody =
		(declarations.length ? declarations.join('\n') + '\n\n' : '') +
		`[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

	local.create.addBlock(deindent`
		${local.name}.on( '${attribute.name}', function ( event ) {
			${handlerBody}
		});
	`);
}
