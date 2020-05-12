import { noop } from './utils';
import { run_transition } from './transitions';

export interface AnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u?: number) => string;
	tick?: (t: number, u?: number) => void;
}

type AnimationFn = (node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params: any) => AnimationConfig;

export function run_animation(node: HTMLElement, from: DOMRect, fn: AnimationFn, params) {
	if (!from) return noop;
	return run_transition(
		node,
		(node, params) => fn(node, { from, to: node.getBoundingClientRect() }, params),
		true,
		params
	);
}

export function fix_position(node: HTMLElement, { left, top }: DOMRect) {
	const { position, width, height, transform } = getComputedStyle(node);
	if (position === 'absolute' || position === 'fixed') return noop;
	const { position: og_position, width: og_width, height: og_height } = node.style;
	node.style.position = 'absolute';
	node.style.width = width;
	node.style.height = height;
	const b = node.getBoundingClientRect();
	node.style.transform = `${transform === 'none' ? '' : transform} translate(${left - b.left}px, ${top - b.top}px)`;
	return () => {
		node.style.position = og_position;
		node.style.width = og_width;
		node.style.height = og_height;
		node.style.transform = ''; // unsafe
	};
}

export function add_transform(node: HTMLElement, a: DOMRect) {
	const b = node.getBoundingClientRect();
	if (a.left !== b.left || a.top !== b.top) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
	}
}
