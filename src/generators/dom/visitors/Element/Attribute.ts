import attributeLookup from './lookup';
import deindent from '../../../../utils/deindent';
import stringify from '../../../../utils/stringify';
import getStaticAttributeValue from './getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitAttribute(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node
) {
	const name = attribute.name;

	let metadata = state.namespace ? null : attributeLookup[name];
	if (metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf(node.name))
		metadata = null;

	const isIndirectlyBoundValue =
		name === 'value' &&
		(node.name === 'option' || // TODO check it's actually bound
			(node.name === 'input' &&
				node.attributes.find(
					(attribute: Node) =>
						attribute.type === 'Binding' && /checked|group/.test(attribute.name)
				)));

	const propertyName = isIndirectlyBoundValue
		? '__value'
		: metadata && metadata.propertyName;

	// xlink is a special case... we could maybe extend this to generic
	// namespaced attributes but I'm not sure that's applicable in
	// HTML5?
	const method = name.slice(0, 6) === 'xlink:'
		? '@setXlinkAttribute'
		: '@setAttribute';

	const isDynamic =
		(attribute.value !== true && attribute.value.length > 1) ||
		(attribute.value.length === 1 && attribute.value[0].type !== 'Text');

	if (isDynamic) {
		let value;

		if (attribute.value.length === 1) {
			// single {{tag}} — may be a non-string
			const { snippet } = block.contextualise(attribute.value[0].expression);
			value = snippet;
		} else {
			// '{{foo}} {{bar}}' — treat as string concatenation
			value =
				(attribute.value[0].type === 'Text' ? '' : `"" + `) +
				attribute.value
					.map((chunk: Node) => {
						if (chunk.type === 'Text') {
							return stringify(chunk.data);
						} else {
							const { snippet } = block.contextualise(chunk.expression);
							return `( ${snippet} )`;
						}
					})
					.join(' + ');
		}

		const last = block.getUniqueName(
			`${state.parentNode}_${name.replace(/[^a-zA-Z_$]/g, '_')}_value`
		);
		block.addVariable(last);

		const isSelectValueAttribute =
			name === 'value' && state.parentNodeName === 'select';

		let updater;

		if (isSelectValueAttribute) {
			// annoying special case
			const isMultipleSelect =
				node.name === 'select' &&
				node.attributes.find((attr: Node) => attr.name.toLowerCase() === 'multiple'); // TODO use getStaticAttributeValue
			const i = block.getUniqueName('i');
			const option = block.getUniqueName('option');

			const ifStatement = isMultipleSelect
				? deindent`
					${option}.selected = ~${last}.indexOf( ${option}.__value );`
				: deindent`
					if ( ${option}.__value === ${last} ) {
						${option}.selected = true;
						break;
					}`;

			updater = deindent`
				for ( var ${i} = 0; ${i} < ${state.parentNode}.options.length; ${i} += 1 ) {
					var ${option} = ${state.parentNode}.options[${i}];

					${ifStatement}
				}
			`;

			block.builders.hydrate.addLine(deindent`
				${last} = ${value}
				${updater}
			`);
		} else if (propertyName) {
			block.builders.hydrate.addLine(
				`${state.parentNode}.${propertyName} = ${last} = ${value};`
			);
			updater = `${state.parentNode}.${propertyName} = ${last};`;
		} else {
			block.builders.hydrate.addLine(
				`${method}( ${state.parentNode}, '${name}', ${last} = ${value} );`
			);
			updater = `${method}( ${state.parentNode}, '${name}', ${last} );`;
		}

		block.builders.update.addBlock(deindent`
			if ( ${last} !== ( ${last} = ${value} ) ) {
				${updater}
			}
		`);
	} else {
		const value = attribute.value === true
			? 'true'
			: attribute.value.length === 0
				? `''`
				: stringify(attribute.value[0].data);

		const statement = propertyName
			? `${state.parentNode}.${propertyName} = ${value};`
			: `${method}( ${state.parentNode}, '${name}', ${value} );`;

		block.builders.hydrate.addLine(statement);

		// special case – autofocus. has to be handled in a bit of a weird way
		if (attribute.value === true && name === 'autofocus') {
			block.autofocus = state.parentNode;
		}

		// special case — xmlns
		if (name === 'xmlns') {
			// TODO this attribute must be static – enforce at compile time
			state.namespace = attribute.value[0].data;
		}
	}

	if (isIndirectlyBoundValue) {
		const updateValue = `${state.parentNode}.value = ${state.parentNode}.__value;`;

		block.builders.hydrate.addLine(updateValue);
		if (isDynamic) block.builders.update.addLine(updateValue);
	}
}
