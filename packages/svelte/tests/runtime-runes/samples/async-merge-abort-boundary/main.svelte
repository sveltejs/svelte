<script>
	import Child from './Child.svelte';
	let visible = $state(false);
	let x = $state(0);
	let gate = $state(false);
	const queue = new Map();

	function push(label, value, signal) {
		const d = Promise.withResolvers();
		queue.set(`${label} ${value}`, d);
		return d.promise;
	}

	export function show() {
		visible = true;
		x = 1;
	}
	export function update() {
		x = 2;
		gate = true;
	}
	export function resolve(label, value) {
		queue.get(`${label} ${value}`)?.resolve(value);
	}
</script>

{#if gate || visible}
	<svelte:boundary>
		<Child {x} {push} label="value" />
		{#snippet pending()}<i>pending</i>{/snippet}
	</svelte:boundary>
{/if}

{#if gate}
	<span>{await push('gate', x)}</span>
{/if}
