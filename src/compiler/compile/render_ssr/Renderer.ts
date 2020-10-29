import AwaitBlock from './handlers/AwaitBlock';
import Comment from './handlers/Comment';
import DebugTag from './handlers/DebugTag';
import EachBlock from './handlers/EachBlock';
import Element from './handlers/Element';
import Head from './handlers/Head';
import HtmlTag from './handlers/HtmlTag';
import IfBlock from './handlers/IfBlock';
import InlineComponent from './handlers/InlineComponent';
import KeyBlock from './handlers/KeyBlock';
import Slot from './handlers/Slot';
import Tag from './handlers/Tag';
import Text from './handlers/Text';
import Title from './handlers/Title';
import { AppendTarget, CompileOptions } from '../../interfaces';
import { INode } from '../nodes/interfaces';
import { Expression, TemplateLiteral, Identifier } from 'estree';
import { escape_template } from '../utils/stringify';

type Handler = (node: any, renderer: Renderer, options: CompileOptions) => void;

function noop() {}

const handlers: Record<string, Handler> = {
	AwaitBlock,
	Body: noop,
	Comment,
	DebugTag,
	EachBlock,
	Element,
	Head,
	IfBlock,
	InlineComponent,
	KeyBlock,
	MustacheTag: Tag, // TODO MustacheTag is an anachronism
	Options: noop,
	RawMustacheTag: HtmlTag,
	Slot,
	Text,
	Title,
	Window: noop
};

export interface RenderOptions extends CompileOptions{
	locate: (c: number) => { line: number; column: number };
	head_id?: string;
}

export default class Renderer {
	has_bindings = false;

	name: Identifier;

	stack: Array<{ current: { value: string }; literal: TemplateLiteral }> = [];
	current: { value: string }; // TODO can it just be `current: string`?
	literal: TemplateLiteral;

	targets: AppendTarget[] = [];

	constructor({ name }) {
		this.name = name;
		this.push();
	}

	add_string(str: string) {
		this.current.value += escape_template(str);
	}

	add_expression(node: Expression) {
		this.literal.quasis.push({
			type: 'TemplateElement',
			value: { raw: this.current.value, cooked: null },
			tail: false
		});

		this.literal.expressions.push(node);
		this.current.value = '';
	}

	push() {
		const current = this.current = { value: '' };

		const literal = this.literal = {
			type: 'TemplateLiteral',
			expressions: [],
			quasis: []
		};

		this.stack.push({ current, literal });
	}

	pop() {
		this.literal.quasis.push({
			type: 'TemplateElement',
			value: { raw: this.current.value, cooked: null },
			tail: true
		});

		const popped = this.stack.pop();
		const last = this.stack[this.stack.length - 1];

		if (last) {
			this.literal = last.literal;
			this.current = last.current;
		}

		return popped.literal;
	}

	render(nodes: INode[], options: RenderOptions) {
		nodes.forEach(node => {
			const handler = handlers[node.type];

			if (!handler) {
				throw new Error(`No handler for '${node.type}' nodes`);
			}

			handler(node, this, options);
		});
	}
}
