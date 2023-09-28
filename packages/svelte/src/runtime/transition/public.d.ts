export type EasingFunction = (t: number) => number;
export type ConditionFunction = () => boolean;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
	condition?: ConditionFunction;
}

export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	condition?: ConditionFunction;
	amount?: number | string;
	opacity?: number;
}

export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	condition?: ConditionFunction;
}

export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	condition?: ConditionFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	condition?: ConditionFunction;
	axis?: 'x' | 'y';
}

export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	condition?: ConditionFunction;
	start?: number;
	opacity?: number;
}

export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
	condition?: ConditionFunction;
}

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
	condition?: ConditionFunction;
}

export * from './index.js';
