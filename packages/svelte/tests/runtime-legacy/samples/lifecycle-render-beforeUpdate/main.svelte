<script>
	import { beforeUpdate } from 'svelte';
	import Child from './Child.svelte';

	export let log = [];
	
	let name = 'rich';
	let allowed = false;

	beforeUpdate(() => {
		// if your name's not dan, you're not coming in
		allowed = name === 'dan';
	});
</script>

<input bind:value={name} />

{#if allowed}
	<Child name={name} log={log} />
{/if}
