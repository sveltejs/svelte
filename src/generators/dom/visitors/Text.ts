import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitText(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	if (!node._state.shouldCreate) return;

	const isTopLevel = !state.parentNode;
	let h;
	if (!isTopLevel) {
		h = block.getUniqueName(`${state.parentNode}_i`)
		block.addVariable(h, 0);
	} else {
		h = block.alias('h');
	}

	const prefix = state.parentNode && !node.usedAsAnchor ? '' : `var ${node._state.name} = `;

	block.builders.create.addLine(
		`${prefix}${generator.helper('hydrateText')}( ${state.parentNode || 'target'}, ${h}++, ${JSON.stringify(node.data)} )`
	);

	if (!state.parentNode) {
		this.builders.unmount.addLine(
			`${this.generator.helper('detachNode')}( ${name} );`
		);
	}

	// block.addElement(
	// 	node._state.name,
	// 	`${generator.helper('hydrateText')}( ${state.parentNode}, 0, ${JSON.stringify(node.data)} )`,
	// 	state.parentNode,
	// 	node.usedAsAnchor
	// );
}
