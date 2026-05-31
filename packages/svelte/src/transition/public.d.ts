/** A function that maps a value between 0 and 1 to an eased value. */
export type EasingFunction = (t: number) => number;

/** Configuration object returned by transition functions. */
export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

/** Parameters for the `blur` transition. */
export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number | string;
	opacity?: number;
}

/** Parameters for the `fade` transition. */
export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

/** Parameters for the `fly` transition. */
export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

/** Parameters for the `slide` transition. */
export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

/** Parameters for the `scale` transition. */
export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

/** Parameters for the `draw` transition (SVG path animation). */
export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

/** Parameters for the `crossfade` transition. */
export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export * from './index.js';
