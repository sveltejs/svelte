import deindent from '../../../../utils/deindent.js';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';

export default function visitRef ( generator: DomGenerator, block: Block, state, node: Node, attribute, local ) {
	generator.usesRefs = true;

	local.create.addLine(
		`${block.component}.refs.${attribute.name} = ${local.name};`
	);

	block.builders.destroy.addLine( deindent`
		if ( ${block.component}.refs.${attribute.name} === ${local.name} ) ${block.component}.refs.${attribute.name} = null;
	` );
}