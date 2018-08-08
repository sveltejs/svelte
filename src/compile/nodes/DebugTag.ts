import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';
import deindent from '../../utils/deindent';

export default class DebugTag extends Tag {
	build(
		block: Block,
		parentNode: string,
		parentNodes: string,
	) {
		const { dependencies } = this.expression;

		const condition = [...dependencies].map(d => `changed.${d}`).join(' || ');

		const identifiers = [...dependencies].join(', ');

		block.builders.update.addBlock(deindent`
			if (${condition}) {
				const { ${identifiers} } = ctx;
				debugger;
			}
		`);
	}
}