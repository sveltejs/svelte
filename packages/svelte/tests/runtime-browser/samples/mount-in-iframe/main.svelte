<script>
	import App from './App.svelte';

	let count = $state(0);
</script>

<button onclick={() => (count += 1)}>remount</button>

{#key count}
	<App {count} />
{/key}
