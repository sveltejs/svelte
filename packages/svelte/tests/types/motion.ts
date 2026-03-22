import {
	type TweenOptions,
	type SpringOptions,
	type SpringUpdateOptions,
	type Updater
} from 'svelte/motion';

let tweenOptions: TweenOptions<number> = {
	delay: 100,
	duration: 400
};

let springOptions: SpringOptions = {
	stiffness: 0.1,
	damping: 0.5
};

let springUpdateOptions: SpringUpdateOptions = {
	instant: true
};

let updater: Updater<number> = (target, value) => target + value;
