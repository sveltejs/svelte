import { noop } from './utils';
import { AnimationConfig } from '../animate';
import { run_transition } from './transitions';

//todo: documentation says it is DOMRect, but in IE it would be ClientRect
type PositionRect = DOMRect | ClientRect;

type AnimationFn = (
	node: Element,
	{ from, to }: { from: PositionRect; to: PositionRect },
	params: any
) => AnimationConfig;

export function run_animation(node: HTMLElement, from: PositionRect, fn: AnimationFn, params) {
	if (!from) return noop;
	const to = node.getBoundingClientRect();
	if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;
	return run_transition(node, (node, params) => fn(node, { from, to }, params), true, params);
}

export function fix_position(node: HTMLElement) {
	const style = getComputedStyle(node);

	if (style.position !== 'absolute' && style.position !== 'fixed') {
		const { width, height } = style;
		const a = node.getBoundingClientRect();
		const { position: og_position, width: og_width, height: og_height } = node.style;
		node.style.position = 'absolute';
		node.style.width = width;
		node.style.height = height;
		add_transform(node, a);
		return () => {
			node.style.position = og_position;
			node.style.width = og_width;
			node.style.height = og_height;
			node.style.transform = '';
		};
	}
}

export function add_transform(node: HTMLElement, a: PositionRect) {
	const b = node.getBoundingClientRect();

	if (a.left !== b.left || a.top !== b.top) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
	}
}
