type EasingFunction = (t: number) => number;

interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number | string;
	opacity?: number;
}

interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export {
	EasingFunction,
	TransitionConfig,
	BlurParams,
	FadeParams,
	FlyParams,
	SlideParams,
	ScaleParams,
	DrawParams,
	CrossfadeParams
};

export * from './index.js';
