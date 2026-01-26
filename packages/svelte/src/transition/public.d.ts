export type EasingFunction = (t: number) => number;
export type Easing = EasingFunction | string;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: Easing;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: Easing;
	amount?: number | string;
	opacity?: number;
}

export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: Easing;
}

export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: Easing;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: Easing;
	axis?: 'x' | 'y';
}

export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: Easing;
	start?: number;
	opacity?: number;
}

export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: Easing;
}

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: Easing;
}

export * from './index.js';
