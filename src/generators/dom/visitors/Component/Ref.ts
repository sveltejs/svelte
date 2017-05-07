import deindent from '../../../../utils/deindent.js';

export default function visitRef ( generator, block, state, node, attribute, local ) {
	generator.usesRefs = true;

	local.create.addLine(
		`${block.component}.refs.${attribute.name} = ${local.name};`
	);

	block.builders.destroy.addLine( deindent`
		if ( ${block.component}.refs.${attribute.name} === ${local.name} ) ${block.component}.refs.${attribute.name} = null;
	` );
}