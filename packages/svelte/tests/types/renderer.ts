import {
	createRenderer,
	type NodeType,
	type Renderer,
	type RendererConnection,
	type RendererNodes
} from 'svelte/renderer';

type MyFragment = { kind: 'fragment' };
type MyElement = { kind: 'element' };
type MyText = { kind: 'text' };
type MyComment = { kind: 'comment' };

type MyNodes = RendererNodes<MyFragment, MyElement, MyText, MyComment>;

const renderer = createRenderer<MyNodes>(null as any);

// the result of `createRenderer` can be annotated with the public `Renderer` type
const annotated: Renderer<MyFragment, MyElement, MyText, MyComment> = renderer;

// ...and generic code can accept any renderer
function wrap<R extends Renderer<any, any, any, any>>(renderer: R): R {
	return renderer;
}

wrap(renderer);

const type: NodeType = 'element';
// @ts-expect-error not a node type
const not_a_type: NodeType = 'document';

// a hook implementation can be typed in isolation
const connection: RendererConnection<MyElement, MyFragment> = {
	node: { kind: 'element' },
	container: { kind: 'fragment' },
	destroy() {}
};

const missing_container: RendererConnection<MyElement, MyFragment> = {
	// @ts-expect-error the container must belong to the guest renderer
	container: { kind: 'element' }
};

annotated.embed = () => ({ container: { kind: 'fragment' } });
