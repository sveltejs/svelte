/**
 * The renderer the components in `components/` are compiled with: the fake platform, plus
 * `embed` and `host` so that components can be combined with DOM components
 */

import { createTreeRenderer } from '../src/index.js';
import { create_element, create_platform, create_root, type Platform } from './platform.js';

export const calls: string[] = [];

/** Connections to the DOM that are currently open */
export const connections = { open: 0 };

export default createTreeRenderer<Platform>({
	...create_platform(calls),

	// tree content inside the DOM: rendered into a platform root, shown as `<tree-root>`
	embed({ host }) {
		if (host !== null) throw new Error('only the DOM is combined with this renderer');
		const container = create_root('container');
		const node = document.createElement('tree-root');
		(node as any).platform = container;
		connections.open += 1;
		return { node, container, destroy: () => void (connections.open -= 1) };
	},

	// DOM content inside the tree: rendered into a `<div>`, held by a `<dom-host>` element
	host({ guest }) {
		if (guest !== null) throw new Error('only the DOM is combined with this renderer');
		const node = create_element('dom-host');
		const container = document.createElement('div');
		node.dom = container;
		connections.open += 1;
		return { node, container, destroy: () => void (connections.open -= 1) };
	}
});
