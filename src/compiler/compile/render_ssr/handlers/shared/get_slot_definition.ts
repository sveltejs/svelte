import Let from '../../../nodes/Let';
import { TemplateLiteral } from 'estree';
import { x } from 'code-red';
import { get_slot_scope } from './get_slot_scope';

export function get_slot_definition(
	lets: Let[],
	output_template: TemplateLiteral
) {
	return new SlotDefinition(lets, output_template);
}

export class SlotDefinition {
	lets: Let[];
	lets_set: Set<string>;
	output_template: TemplateLiteral;

	constructor(lets: Let[], output_template: TemplateLiteral) {
		this.lets = lets;
		this.output_template = output_template;
		this.lets_set = new Set(this.lets.map(l => l.name.name));
	}

	add(lets: Let[], output_template: TemplateLiteral) {
		for (const l of lets) {
			if (!this.lets_set.has(l.name.name)) {
				this.lets_set.add(l.name.name);
				this.lets.push(l);
			}
		}
		this.output_template = merge_template_literal(
			this.output_template,
			output_template
		);
	}

	render() {
    return x`(${get_slot_scope(this.lets)}) => ${this.output_template}`;
  }
}

function merge_template_literal(a: TemplateLiteral, b: TemplateLiteral): TemplateLiteral {
	const quasis = [...a.quasis];
	quasis[quasis.length - 1] = {
		type: 'TemplateElement',
		value: {
			raw: quasis[quasis.length - 1].value.raw + b.quasis[0].value.raw,
			cooked: quasis[quasis.length - 1].value.cooked + b.quasis[0].value.cooked,
		},
		tail: false,
	};
	quasis.push(...b.quasis.slice(1));

	return {
		type: 'TemplateLiteral',
		quasis,
		expressions: [...a.expressions, ...b.expressions],
	};
}
