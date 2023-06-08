import { onMount } from '$runtime/index';

// sync and no return
onMount(() => {
	console.log('mounted');
});

// sync and return value
onMount(() => {
	return 'done';
});

// sync and return sync
onMount(() => {
	return () => {
		return 'done';
	};
});

// sync and return async
onMount(() => {
	return async () => {
		const res = await fetch('');
		return res;
	};
});

// async and no return
onMount(async () => {
	await fetch('');
});

// async and return value
onMount(async () => {
	const res = await fetch('');
	return res;
});

// @ts-expect-error async and return sync
onMount(async () => {
	return () => {
		return 'done';
	};
});

// @ts-expect-error async and return async
onMount(async () => {
	return async () => {
		const res = await fetch('');
		return res;
	};
});

// async and return any
onMount(async () => {
	const a: any = null as any;
	return a;
});

// async and return function casted to any
// can't really catch this without also catching above
onMount(async () => {
	const a: any = (() => {}) as any;
	return a;
});
