import deindent from '../../../../utils/deindent';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitRef(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node,
	local
) {
	generator.usesRefs = true;

	local.create.addLine(
		`#component.refs.${attribute.name} = ${local.name};`
	);

	block.builders.destroy.addLine(deindent`
		if ( #component.refs.${attribute.name} === ${local.name} ) #component.refs.${attribute.name} = null;
	`);
}
