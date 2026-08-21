<script>
	import Component from "./Component.svelte";

	let message = $state('hello');
	let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>
<button onclick={() => message = message === 'hello' ? 'goodbye' : 'hello'}>{message}</button>

{#if count < 2 && message === 'hello'}
	<Component {count} {message} />
{/if}
