<script>
	import Child from './Child.svelte';

	let n = $state(0);
	let waiting = $state(false);
	let show = $state(false);
	let x = $state(0);
	const gate = Promise.withResolvers();
	const answers = new Map();

	function load(value) {
		console.log(value);
		return new Promise((resolve) => answers.set(value, resolve));
	}

	export function start() { n++; waiting = true; }
	export function open() { n++; x = 1; show = true; }
	export function update() { n++; x = 2; }
	export function hide() { n++; show = false; }
	export function reveal() { n++; show = true; }
	export function resolve() { answers.get(2)(2); }
	export function finish() { gate.resolve(1); }
</script>

<p>{n}</p><p>{waiting ? await gate.promise : 0}</p>
{#if n && show}<Child {x} {load} />{/if}
