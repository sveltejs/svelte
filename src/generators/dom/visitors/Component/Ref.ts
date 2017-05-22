import deindent from '../../../../utils/deindent.js';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitRef ( generator: DomGenerator, block: Block, state: State, node: Node, attribute: Node, local ) {
	generator.usesRefs = true;

	local.create.addLine(
		`${block.component}.refs.${attribute.name} = ${local.name};`
	);

	block.builders.destroy.addLine( deindent`
		if ( ${block.component}.refs.${attribute.name} === ${local.name} ) ${block.component}.refs.${attribute.name} = null;
	` );
}