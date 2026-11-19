import {
	createRenderer,
	type NodeType,
	type Renderer,
	type RendererConnection
} from 'svelte/renderer';

type MyFragment = { kind: 'fragment' };
type MyElement = { kind: 'element'; name: string };
type MyText = { kind: 'text'; value: string };
type MyComment = { kind: 'comment' };

// the same record describes the nodes for both `createRenderer` and `Renderer`
type MyNodes = { fragment: MyFragment; element: MyElement; text: MyText; comment: MyComment };

const rest = {
	nodeType: () => 'element' as const,
	getNodeValue: () => null,
	setAttribute() {},
	removeAttribute() {},
	hasAttribute: () => false,
	getFirstChild: () => null,
	getLastChild: () => null,
	getNextSibling: () => null,
	insert() {},
	remove() {},
	getParent: () => null,
	addEventListener() {},
	removeEventListener() {}
};

// with the node types, the methods' parameters are typed...
const renderer = createRenderer<MyNodes>({
	...rest,
	createFragment: () => ({ kind: 'fragment' }),
	createElement: (name) => ({ kind: 'element', name }),
	createTextNode: (value) => ({ kind: 'text', value }),
	createComment: () => ({ kind: 'comment' }),
	getAttribute: () => null,
	setText(node, text) {
		const typed: MyElement | MyText | MyComment = node;
		// @ts-expect-error fragments can't be passed to `setText`
		const fragment: MyFragment = node;
	}
});

// ...and mistakes are caught
createRenderer<MyNodes>({
	...rest,
	createFragment: () => ({ kind: 'fragment' }),
	createElement: (name) => ({ kind: 'element', name }),
	// @ts-expect-error `value` must be a string
	createTextNode: (value) => ({ kind: 'text', value: 1 }),
	createComment: () => ({ kind: 'comment' }),
	getAttribute: () => null,
	setText() {}
});

// the result can be annotated with the public `Renderer` type, using the same record
const annotated: Renderer<MyNodes> = renderer;

// ...and generic code can accept any renderer
function wrap<R extends Renderer<any>>(renderer: R): R {
	return renderer;
}

wrap(renderer);

// without the node types, they are inferred from the `create*` methods (which must come first)...
const inferred = createRenderer({
	createFragment: (): MyFragment => ({ kind: 'fragment' }),
	createElement: (name): MyElement => ({ kind: 'element', name }),
	createTextNode: (value): MyText => ({ kind: 'text', value }),
	createComment: (): MyComment => ({ kind: 'comment' }),
	...rest,
	setText(node, text) {
		const typed: MyElement | MyText | MyComment = node;
		// @ts-expect-error fragments can't be passed to `setText`
		const fragment: MyFragment = node;
	},
	getAttribute(element, name) {
		const typed: MyElement = element;
		// @ts-expect-error `element` is inferred from `createElement`
		const text: MyText = element;
		return null;
	}
});

// ...including when the `create*` methods' return types aren't annotated...
createRenderer({
	createFragment: () => ({ kind: 'fragment' as const }),
	createElement: (name) => ({ kind: 'element' as const, name }),
	createTextNode: (value) => ({ kind: 'text' as const, value }),
	createComment: () => ({ kind: 'comment' as const }),
	...rest,
	setText() {},
	getAttribute(element) {
		const name: string = element.name;
		return null;
	}
});

// ...and the result has the same type as one created with explicit node types
const inferred_as_public: Renderer<MyNodes> = inferred;
const element: MyElement = inferred.createElement('div');

const type: NodeType = 'element';
// @ts-expect-error not a node type
const not_a_type: NodeType = 'document';

// a hook implementation can be typed in isolation
const connection: RendererConnection<MyElement, MyFragment> = {
	node: { kind: 'element', name: 'host' },
	container: { kind: 'fragment' },
	destroy() {}
};

const missing_container: RendererConnection<MyElement, MyFragment> = {
	// @ts-expect-error the container must belong to the guest renderer
	container: { kind: 'element', name: 'wrong' }
};

annotated.embed = () => ({ container: { kind: 'fragment' } });
