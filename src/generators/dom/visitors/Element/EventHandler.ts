import deindent from '../../../../utils/deindent';
import flattenReference from '../../../../utils/flattenReference';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitEventHandler(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node
) {
	const name = attribute.name;
	const isCustomEvent = generator.events.has(name);
	const shouldHoist = !isCustomEvent && state.inEachBlock;

	generator.addSourcemapLocations(attribute.expression);

	const flattened = flattenReference(attribute.expression.callee);
	if (flattened.name !== 'event' && flattened.name !== 'this') {
		// allow event.stopPropagation(), this.select() etc
		// TODO verify that it's a valid callee (i.e. built-in or declared method)
		generator.code.prependRight(
			attribute.expression.start,
			`${block.component}.`
		);
		if (shouldHoist) state.usesComponent = true; // this feels a bit hacky but it works!
	}

	const context = shouldHoist ? null : state.parentNode;
	const usedContexts: string[] = [];
	attribute.expression.arguments.forEach((arg: Node) => {
		const { contexts } = block.contextualise(arg, context, true);

		contexts.forEach(context => {
			if (!~usedContexts.indexOf(context)) usedContexts.push(context);
			if (!~state.allUsedContexts.indexOf(context))
				state.allUsedContexts.push(context);
		});
	});

	const _this = context || 'this';
	const declarations = usedContexts.map(name => {
		if (name === 'state') {
			if (shouldHoist) state.usesComponent = true;
			return `var state = ${block.component}.get();`;
		}

		const listName = block.listNames.get(name);
		const indexName = block.indexNames.get(name);
		const contextName = block.contexts.get(name);

		return `var ${listName} = ${_this}._svelte.${listName}, ${indexName} = ${_this}._svelte.${indexName}, ${contextName} = ${listName}[${indexName}];`;
	});

	// get a name for the event handler that is globally unique
	// if hoisted, locally unique otherwise
	const handlerName = (shouldHoist ? generator : block).getUniqueName(
		`${name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
	);

	// create the handler body
	const handlerBody = deindent`
		${state.usesComponent && `var ${block.component} = this._svelte.component;`}
		${declarations}
		[✂${attribute.expression.start}-${attribute.expression.end}✂];
	`;

	const handler = isCustomEvent
		? deindent`
			var ${handlerName} = ${generator.alias(
				'template'
			)}.events.${name}.call( ${block.component}, ${state.parentNode}, function ( event ) {
				${handlerBody}
			});
		`
		: deindent`
			function ${handlerName} ( event ) {
				${handlerBody}
			}
		`;

	if (shouldHoist) {
		generator.blocks.push(
			<Block>{
				render: () => handler,
			}
		);
	} else {
		block.builders.create.addBlock(handler);
	}

	if (isCustomEvent) {
		block.builders.destroy.addLine(deindent`
			${handlerName}.teardown();
		`);
	} else {
		block.builders.create.addLine(deindent`
			${generator.helper(
				'addEventListener'
			)}( ${state.parentNode}, '${name}', ${handlerName} );
		`);

		block.builders.destroy.addLine(deindent`
			${generator.helper(
				'removeEventListener'
			)}( ${state.parentNode}, '${name}', ${handlerName} );
		`);
	}
}
