import { stringify } from '../../../utils/stringify';
import getExpressionPrecedence from '../../../utils/getExpressionPrecedence';
import Node from './Node';
import Attribute from '../Attribute';
import Block from '../../dom/Block';

export default function mungeAttribute(attribute: Node, block: Block): Attribute {
	if (attribute.value === true) {
		// attributes without values, e.g. <textarea readonly>
		return {
			name: attribute.name,
			value: true,
			dynamic: false
		};
	}

	if (attribute.value.length === 0) {
		return {
			name: attribute.name,
			value: `''`,
			dynamic: false
		};
	}

	if (attribute.value.length === 1) {
		const value = attribute.value[0];

		if (value.type === 'Text') {
			// static attributes
			return {
				name: attribute.name,
				value: isNaN(value.data) ? stringify(value.data) : value.data,
				dynamic: false
			};
		}

		// simple dynamic attributes
		block.contextualise(value.expression); // TODO remove
		const { dependencies, snippet } = value.metadata;

		// TODO only update attributes that have changed
		return {
			name: attribute.name,
			value: snippet,
			dependencies,
			dynamic: true
		};
	}

	// otherwise we're dealing with a complex dynamic attribute
	const allDependencies = new Set();

	const value =
		(attribute.value[0].type === 'Text' ? '' : `"" + `) +
		attribute.value
			.map((chunk: Node) => {
				if (chunk.type === 'Text') {
					return stringify(chunk.data);
				} else {
					block.contextualise(chunk.expression); // TODO remove
					const { dependencies, snippet } = chunk.metadata;

					dependencies.forEach((dependency: string) => {
						allDependencies.add(dependency);
					});

					return getExpressionPrecedence(chunk.expression) <= 13 ? `(${snippet})` : snippet;
				}
			})
			.join(' + ');

	return {
		name: attribute.name,
		value,
		dependencies: Array.from(allDependencies),
		dynamic: true
	};
}