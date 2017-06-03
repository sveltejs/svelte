import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitAttribute(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute,
	local
) {
	if (attribute.value === true) {
		// attributes without values, e.g. <textarea readonly>
		local.staticAttributes.push({
			name: attribute.name,
			value: true,
		});
	} else if (attribute.value.length === 0) {
		local.staticAttributes.push({
			name: attribute.name,
			value: `''`,
		});
	} else if (attribute.value.length === 1) {
		const value = attribute.value[0];

		if (value.type === 'Text') {
			// static attributes
			const result = isNaN(value.data)
				? JSON.stringify(value.data)
				: value.data;
			local.staticAttributes.push({
				name: attribute.name,
				value: result,
			});
		} else {
			// simple dynamic attributes
			const { dependencies, snippet } = block.contextualise(value.expression);

			// TODO only update attributes that have changed
			local.dynamicAttributes.push({
				name: attribute.name,
				value: snippet,
				dependencies,
			});
		}
	} else {
		// complex dynamic attributes
		const allDependencies = [];

		const value =
			(attribute.value[0].type === 'Text' ? '' : `"" + `) +
			attribute.value
				.map(chunk => {
					if (chunk.type === 'Text') {
						return JSON.stringify(chunk.data);
					} else {
						const { dependencies, snippet } = block.contextualise(
							chunk.expression
						);
						dependencies.forEach(dependency => {
							if (!~allDependencies.indexOf(dependency))
								allDependencies.push(dependency);
						});

						return `( ${snippet} )`;
					}
				})
				.join(' + ');

		local.dynamicAttributes.push({
			name: attribute.name,
			value,
			dependencies: allDependencies,
		});
	}
}
