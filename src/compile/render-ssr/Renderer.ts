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
import { CompileOptions } from '../../interfaces';

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
	Meta: noop,
	MustacheTag: Tag, // TODO MustacheTag is an anachronism
	RawMustacheTag: HtmlTag,
	Slot,
	Text,
	Title,
	Window: noop
};

type AppendTarget = any; // TODO

export default class Renderer {
	has_bindings = false;
	code = '';
	targets: AppendTarget[] = [];

	append(code: string) {
		if (this.targets.length) {
			const target = this.targets[this.targets.length - 1];
			const slotName = target.slotStack[target.slotStack.length - 1];
			target.slots[slotName] += code;
		} else {
			this.code += code;
		}
	}

	render(nodes, options) {
		nodes.forEach(node => {
			const handler = handlers[node.type];

			if (!handler) {
				throw new Error(`No handler for '${node.type}' nodes`);
			}

			handler(node, this, options);
		});
	}
}
