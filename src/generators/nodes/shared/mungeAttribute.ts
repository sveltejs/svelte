import { stringify } from '../../../utils/stringify';
import getExpressionPrecedence from '../../../utils/getExpressionPrecedence';
import Node from './Node';
import Attribute from '../Attribute';
import Block from '../../dom/Block';

type MungedAttribute = {
	spread: boolean;
	name: string;
	value: string | true;
	dependencies: string[];
	dynamic: boolean;
}

export default function mungeAttribute(attribute: Node, block: Block): MungedAttribute {
	if (attribute.type === 'Spread') {
		block.contextualise(attribute.expression); // TODO remove
		const { dependencies, snippet } = attribute.metadata;

		return {
			spread: true,
			name: null,
			value: snippet,
			dynamic: dependencies.length > 0,
			dependencies
		};
	}

	if (attribute.value === true) {
		// attributes without values, e.g. <textarea readonly>
		return {
			spread: false,
			name: attribute.name,
			value: true,
			dynamic: false,
			dependencies: []
		};
	}

	if (attribute.value.length === 0) {
		return {
			spread: false,
			name: attribute.name,
			value: `''`,
			dynamic: false,
			dependencies: []
		};
	}

	if (attribute.value.length === 1) {
		const value = attribute.value[0];

		if (value.type === 'Text') {
			// static attributes
			return {
				spread: false,
				name: attribute.name,
				value: isNaN(value.data) ? stringify(value.data) : value.data,
				dynamic: false,
				dependencies: []
			};
		}

		// simple dynamic attributes
		block.contextualise(value.expression); // TODO remove
		const { dependencies, snippet } = value.metadata;

		// TODO only update attributes that have changed
		return {
			spread: false,
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
		spread: false,
		name: attribute.name,
		value,
		dependencies: Array.from(allDependencies),
		dynamic: true
	};
}