export type EasingFunction = (t: number) => number;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number | string;
	opacity?: number;
}

export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export * from './index.js';
