import {
	type TweenedOptions,
	type SpringOpts,
	type SpringUpdateOpts,
	type Updater
} from 'svelte/motion';

let tweenOptions: TweenedOptions<number> = {
	delay: 100,
	duration: 400
};

let springOptions: SpringOpts = {
	stiffness: 0.1,
	damping: 0.5
};

let springUpdateOptions: SpringUpdateOpts = {
	instant: true
};

let updater: Updater<number> = (target, value) => target + value;
