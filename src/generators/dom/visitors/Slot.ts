import { DomGenerator } from '../index';
import Block from '../Block';
import getStaticAttributeValue from './shared/getStaticAttributeValue';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitSlot(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	const slotName = getStaticAttributeValue(node, 'name');
	const name = block.getUniqueName(`slot_${slotName || 'default'}`);

	const parentNode = state.parentNode || '#target';

	block.addVariable(name);
	block.addElement(
		name,
		`@createElement('slot')`,
		`@claimElement(${state.parentNodes}, 'slot', {${slotName ? ` name: '${slotName}' ` : ''}})`,
		parentNode
	);



	// block.builders.mount.addLine(
	// 	`if ( #component._yield ) #component._yield.mount( ${parentNode}, null );`
	// );

	// block.builders.unmount.addLine(
	// 	`if ( #component._yield ) #component._yield.unmount();`
	// );
}
