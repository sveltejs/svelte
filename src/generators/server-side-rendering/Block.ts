import deindent from '../../utils/deindent';
import flattenReference from '../../utils/flattenReference';
import { SsrGenerator } from './index';
import { Node } from '../../interfaces';
import getObject from '../../utils/getObject';

interface BlockOptions {
	// TODO
}

export default class Block {
	generator: SsrGenerator;
	conditions: string[];

	contexts: Map<string, string>;
	indexes: Map<string, string>;

	constructor(options: BlockOptions) {
		Object.assign(this, options);
	}

	addBinding(binding: Node, name: string) {
		const conditions = [`!('${binding.name}' in ctx)`].concat(
			// TODO handle contextual bindings...
			this.conditions.map(c => `(${c})`)
		);

		const { name: prop } = getObject(binding.value.node);

		this.generator.bindings.push(deindent`
			if (${conditions.join('&&')}) {
				tmp = ${name}.data();
				if ('${prop}' in tmp) {
					ctx.${binding.name} = tmp.${prop};
					settled = false;
				}
			}
		`);
	}

	child(options: BlockOptions) {
		return new Block(Object.assign({}, this, options, { parent: this }));
	}

	// contextualise(expression: Node, context?: string, isEventHandler?: boolean) {
	// 	return this.generator.contextualise(this.contexts, this.indexes, expression, context, isEventHandler);
	// }
}
