// todo: same as Transition, should it be shared?
export interface AnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface FlipParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: (t: number) => number;
}

export * from './index.js';
