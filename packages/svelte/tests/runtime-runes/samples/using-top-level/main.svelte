<script>
	import Child from './Child.svelte';

	let message = $state('hello');
</script>

<button onclick={() => message = message ? null : 'hello'}>
	toggle
</button>

{#if message}
	<Child {message} />
{/if}
