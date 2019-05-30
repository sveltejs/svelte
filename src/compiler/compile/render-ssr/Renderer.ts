import AwaitBlock from './handlers/AwaitBlock';
import Comment from './handlers/Comment';
import DebugTag from './handlers/DebugTag';
import EachBlock from './handlers/EachBlock';
import Element from './handlers/Element';
import Head from './handlers/Head';
import HtmlTag from './handlers/HtmlTag';
import IfBlock from './handlers/IfBlock';
import InlineComponent from './handlers/InlineComponent';
import Slot from './handlers/Slot';
import Tag from './handlers/Tag';
import Text from './handlers/Text';
import Title from './handlers/Title';
import { AppendTarget, CompileOptions } from '../../interfaces';
import { INode } from '../nodes/interfaces';

type Handler = (node: any, renderer: Renderer, options: CompileOptions) => void;

function noop(){}

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
	MustacheTag: Tag, // TODO MustacheTag is an anachronism
	Options: noop,
	RawMustacheTag: HtmlTag,
	Slot,
	Text,
	Title,
	Window: noop
};

export interface RenderOptions extends CompileOptions{
	locate: (c: number) => { line: number; column: number; };
};

export default class Renderer {
	has_bindings = false;
	code = '';
	targets: AppendTarget[] = [];

	append(code: string) {
		if (this.targets.length) {
			const target = this.targets[this.targets.length - 1];
			const slot_name = target.slot_stack[target.slot_stack.length - 1];
			target.slots[slot_name] += code;
		} else {
			this.code += code;
		}
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
