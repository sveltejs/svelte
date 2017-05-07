import deindent from '../../../../utils/deindent.js';

export default function visitRef ( generator, block, state, node, attribute ) {
	const name = attribute.name;

	block.builders.create.addLine(
		`${block.component}.refs.${name} = ${state.parentNode};`
	);

	block.builders.destroy.addLine( deindent`
		if ( ${block.component}.refs.${name} === ${state.parentNode} ) ${block.component}.refs.${name} = null;
	` );

	generator.usesRefs = true; // so this component.refs object is created
}