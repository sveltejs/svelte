<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let visible = $state(true);
	let message = $state('hello');

	export function toggle() {
		visible = !visible;
	}

	export function set_message(value) {
		message = value;
	}
</script>

<div>
	<p>before</p>
	{#if visible}
		<Child {message}></Child>
	{/if}
	<p>after</p>
</div>
