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

export const run_animation = Function.prototype.call.bind(function run_animation(
	this: HTMLElement,
	from: DOMRect,
	fn: AnimationFn,
	params = {}
) {
	if (!from) return noop;
	return run_transition(
		this,
		(_, params) => {
			const to = this.getBoundingClientRect();
			if (from.left !== to.left || from.right !== to.right || from.top !== to.top || from.bottom !== to.bottom) {
				return fn(this, { from, to }, params);
			} else return null;
		},
		9,
		params
	);
});

export const fix_position = Function.prototype.call.bind(function fix_position(
	this: HTMLElement,
	{ left, top }: DOMRect
) {
	const { position, width, height, transform } = getComputedStyle(this);
	if (position === 'absolute' || position === 'fixed') return noop;
	const { position: og_position, width: og_width, height: og_height } = this.style;
	this.style.position = 'absolute';
	this.style.width = width;
	this.style.height = height;
	const b = this.getBoundingClientRect();
	this.style.transform = `${transform === 'none' ? '' : transform} translate(${left - b.left}px, ${top - b.top}px)`;
	return () => {
		this.style.position = og_position;
		this.style.width = og_width;
		this.style.height = og_height;
		this.style.transform = ''; // unsafe
	};
});
