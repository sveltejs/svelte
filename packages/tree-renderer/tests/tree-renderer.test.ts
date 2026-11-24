// @vitest-environment node
import { assert, describe, it } from 'vitest';
import { createTreeRenderer } from '../src/index.js';
import type { TreeRendererConfig } from '../src/public.js';
import { create_element, create_platform, create_root, type Platform } from './platform.js';

function setup(overrides: Partial<TreeRendererConfig<Platform>> = {}) {
	const calls: string[] = [];
	const renderer = createTreeRenderer<Platform>({
		...create_platform(calls),
		...overrides
	});
	const platform_root = create_root();
	const root = renderer.createRoot(platform_root);

	return { calls, renderer, root, platform_root };
}

describe('insert', () => {
	it('passes the platform the anchor and the index of the new node', () => {
		const { calls, renderer, root } = setup();
		const a = renderer.createElement('a');
		const b = renderer.createElement('b');
		const c = renderer.createElement('c');

		renderer.insert(root, a, null);
		renderer.insert(root, c, null);
		renderer.insert(root, b, c);

		assert.deepEqual(calls, [
			'insert <a> into root at 0 before end',
			'insert <c> into root at 1 before end',
			'insert <b> into root at 1 before <c>'
		]);
	});

	it('never passes comments to the platform, and leaves them out of anchors and indices', () => {
		const { calls, renderer, root } = setup();
		const a = renderer.createElement('a');
		const anchor = renderer.createComment('');
		const c = renderer.createElement('c');

		renderer.insert(root, a, null);
		renderer.insert(root, anchor, null);
		renderer.insert(root, c, null);

		// Svelte inserts before the comment, the platform before the next node it knows about
		const b = renderer.createElement('b');
		renderer.insert(root, b, anchor);
		renderer.remove(anchor);

		assert.deepEqual(calls, [
			'insert <a> into root at 0 before end',
			'insert <c> into root at 1 before end',
			'insert <b> into root at 1 before <c>'
		]);
	});

	it('inserts the children of a fragment, which never reaches the platform', () => {
		const { calls, renderer, root, platform_root } = setup();
		const fragment = renderer.createFragment();
		const p = renderer.createElement('p');
		const comment = renderer.createComment('');

		renderer.insert(fragment, p, null);
		renderer.insert(fragment, comment, null);
		renderer.insert(fragment, renderer.createText('after'), null);
		assert.deepEqual(calls, [], 'building a template fragment');

		renderer.insert(root, fragment, null);
		assert.deepEqual(calls, [
			'insert <p> into root at 0 before end',
			'insert "after" into root at 1 before end'
		]);
		assert.deepEqual(fragment.children, []);
		assert.equal(root.children[1], comment);
		assert.deepEqual(
			platform_root.children.map((node) => node.kind),
			['element', 'text']
		);
	});

	it('passes inserts into elements to the platform even before the element is attached', () => {
		const { calls, renderer } = setup();
		const p = renderer.createElement('p');

		renderer.insert(p, renderer.createText('hi'), null);

		assert.deepEqual(calls, ['insert "hi" into <p> at 0 before end']);
	});

	it('passes a move as remove followed by insert', () => {
		const { calls, renderer, root } = setup();
		const a = renderer.createElement('a');
		const b = renderer.createElement('b');
		renderer.insert(root, a, null);
		renderer.insert(root, b, null);
		calls.length = 0;

		renderer.insert(root, b, a);

		assert.deepEqual(calls, ['remove <b> from root', 'insert <b> into root at 0 before <a>']);
		assert.deepEqual(root.children, [b, a]);
	});

	it('throws if the anchor is not a child of the parent', () => {
		const { renderer, root } = setup();

		assert.throws(
			() => renderer.insert(root, renderer.createElement('a'), renderer.createComment('')),
			'anchor is not a child of the given parent'
		);
	});
});

describe('remove', () => {
	it('passes the platform the parent the node was removed from', () => {
		const { calls, renderer, root, platform_root } = setup();
		const p = renderer.createElement('p');
		renderer.insert(root, p, null);
		calls.length = 0;

		renderer.remove(p);

		assert.deepEqual(calls, ['remove <p> from root']);
		assert.equal(p.parent, null);
		assert.deepEqual(platform_root.children, []);
	});

	it('does nothing on the platform for nodes of template fragments, or comments', () => {
		const { calls, renderer, root } = setup();
		const fragment = renderer.createFragment();
		const p = renderer.createElement('p');
		const comment = renderer.createComment('');
		renderer.insert(fragment, p, null);
		renderer.insert(root, comment, null);

		renderer.remove(p);
		renderer.remove(comment);

		assert.deepEqual(calls, []);
	});
});

describe('attributes, text and events', () => {
	it('passes attribute values through as they are, and stores them for Svelte', () => {
		const { calls, renderer } = setup();
		const view = renderer.createElement('view');
		const position = [1, 2, 3];

		renderer.setAttribute(view, 'position', position);
		assert.equal(view.node.props.position, position);
		assert.equal(renderer.getAttribute(view, 'position') as unknown, position);
		assert.isTrue(renderer.hasAttribute(view, 'position'));

		renderer.removeAttribute(view, 'position');
		renderer.removeAttribute(view, 'position');
		assert.isFalse(renderer.hasAttribute(view, 'position'));
		assert.equal(renderer.getAttribute(view, 'position'), null);

		// removing an attribute that isn't there isn't passed on
		assert.deepEqual(calls, ['set <view> position', 'unset <view> position']);
	});

	it('updates text, and stores it for Svelte', () => {
		const { calls, renderer } = setup();
		const text = renderer.createText('a');

		renderer.setText(text, 'b');

		assert.equal(renderer.getText(text), 'b');
		assert.equal(text.node.text, 'b');
		assert.deepEqual(calls, ['text "a" -> "b"']);
	});

	it('passes event listeners through, with their options', () => {
		const { renderer } = setup();
		const view = renderer.createElement('view');
		const handler = () => {};

		renderer.addEventListener(view, 'press', handler, { once: true });
		assert.deepEqual(view.node.listeners.press, [{ handler, options: { once: true } }]);

		renderer.removeEventListener(view, 'press', handler);
		assert.deepEqual(view.node.listeners.press, []);
	});
});

describe('traversal', () => {
	it('lets Svelte walk its tree, comments included', () => {
		const { renderer, root } = setup();
		const a = renderer.createElement('a');
		const anchor = renderer.createComment('anchor');
		renderer.insert(root, a, null);
		renderer.insert(root, anchor, null);

		assert.equal(renderer.getFirstChild(root), a);
		assert.equal(renderer.getNextSibling(a), anchor);
		assert.equal(renderer.getNextSibling(anchor), null);
		assert.equal(renderer.getLastChild(root), anchor);
		assert.equal(renderer.getParent(anchor), root);
		assert.equal(renderer.getNodeType(anchor), 'comment');
		assert.equal(renderer.getText(anchor), 'anchor');
	});
});

describe('combining with other renderers', () => {
	it('only defines embed and host when they are provided', () => {
		const { renderer } = setup();

		// that's what makes Svelte throw `renderer_cannot_cross`, like with `createRenderer`
		assert.isUndefined(renderer.embed);
		assert.isUndefined(renderer.host);
	});

	it('embed: turns the container into a root', () => {
		const container = create_root('container');
		const host_node = {};
		const destroy = () => {};
		let received: unknown;

		const { calls, renderer } = setup({
			embed(context) {
				received = context;
				return { node: host_node, container, destroy };
			}
		});

		const context = { host: null, parent: {}, anchor: {} };
		const connection = renderer.embed!(context);

		assert.equal(received, context);
		assert.equal(connection.node, host_node);
		assert.equal(connection.destroy, destroy);
		assert.equal(connection.container.type, 'fragment');
		assert.equal(connection.container.node, container);

		// what is rendered into it reaches the platform
		renderer.insert(connection.container, renderer.createElement('p'), null);
		assert.deepEqual(calls, ['insert <p> into container at 0 before end']);
	});

	it("host: turns the node into an element, and passes the platform's parent", () => {
		const host_view = create_element('dom-host');
		const parents: unknown[] = [];

		const { calls, renderer, root, platform_root } = setup({
			host({ parent }) {
				parents.push(parent);
				return { node: host_view, container: {} };
			}
		});

		const connection = renderer.host!({
			guest: null,
			parent: root,
			anchor: renderer.createComment('')
		});
		const node = connection.node;
		assert.equal(node?.type, 'element');
		if (node?.type !== 'element') return;
		assert.equal(node.node, host_view);
		assert.equal(node.name, '');

		// Svelte inserts it like any other node
		renderer.insert(root, node, null);
		assert.deepEqual(calls, ['insert <dom-host> into root at 0 before end']);

		// a template fragment has no platform parent
		renderer.host!({
			guest: null,
			parent: renderer.createFragment(),
			anchor: renderer.createComment('')
		});
		assert.deepEqual(parents, [platform_root, null]);
	});
});
