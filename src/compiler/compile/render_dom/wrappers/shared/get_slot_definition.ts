import Let from '../../../nodes/Let';
import { x, p } from 'code-red';
import Block from '../../Block';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import { BinaryExpression } from 'estree';

export function get_slot_definition(
	block: Block,
	scope: TemplateScope,
	lets: Let[]
) {
	return new SlotDefinition(block, scope, lets);
}

export class SlotDefinition {
	block: Block;
	scope: TemplateScope;
	lets: Let[];
	lets_set: Set<string>;

	constructor(block: Block, scope: TemplateScope, lets: Let[]) {
		this.block = block;
		this.scope = scope;
		this.lets = lets;
		this.lets_set = new Set(this.lets.map(l => l.name.name));
	}

	add_let_binding(lets: Let[]) {
		for (const l of lets) {
			if (!this.lets_set.has(l.name.name)) {
				this.lets_set.add(l.name.name);
				this.lets.push(l);
			}
		}
	}

	render() {
		if (this.lets.length === 0) {
			return x`[${this.block.name}, null, null]`;
		}

		const input = {
			type: 'ObjectPattern',
			properties: this.lets.map(l => ({
				type: 'Property',
				kind: 'init',
				key: l.name,
				value: l.value || l.name,
			})),
		};

		const names: Set<string> = new Set();
		this.lets.forEach(l => {
			l.names.forEach(name => {
				names.add(name);
			});
		});

		const context = {
			type: 'ObjectExpression',
			properties: Array.from(names).map(
				name =>
					p`${this.block.renderer.context_lookup.get(name).index}: ${name}`
			),
		};

		const { context_lookup } = this.block.renderer;
		const { renderer } = this.block;

		// i am well aware that this code is gross
		// TODO make it less gross
		const changes = {
			type: 'ParenthesizedExpression',
			get expression() {
				if (renderer.context_overflow) {
					const grouped = [];
					Array.from(names).forEach(name => {
						const i = context_lookup.get(name).index.value as number;
						const g = Math.floor(i / 31);

						if (!grouped[g]) grouped[g] = [];
						grouped[g].push({ name, n: i % 31 });
					});

					const elements = [];

					for (let g = 0; g < grouped.length; g += 1) {
						elements[g] = grouped[g]
							? grouped[g]
									.map(({ name, n }) => x`${name} ? ${1 << n} : 0`)
									.reduce((lhs, rhs) => x`${lhs} | ${rhs}`)
							: x`0`;
					}

					return {
						type: 'ArrayExpression',
						elements,
					};
				}

				return Array.from(names)
					.map(name => {
						const i = context_lookup.get(name).index.value as number;
						return x`${name} ? ${1 << i} : 0`;
					})
					.reduce((lhs, rhs) => x`${lhs} | ${rhs}`) as BinaryExpression;
			},
		};

		const get_context = x`${input} => ${context}`;
		const get_changes = x`${input} => ${changes}`;

		return x`[${this.block.name}, ${get_context}, ${get_changes}]`;
	}
}
