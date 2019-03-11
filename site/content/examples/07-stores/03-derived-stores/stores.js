import { readable, derive } from 'svelte/store';

export const time = readable(function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
}, new Date());

const start = new Date();

export const elapsed = derive(
	time,
	$time => Math.round(($time - start) / 1000)
);