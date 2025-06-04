<script>
	import { flushSync } from 'svelte';

	let flag = $state(true);
	let boolElText = $state(true);

	async function handleClick() {
		flushSync(() => {
			boolElText = !boolElText;
		});

		flag = !flag;
	}
</script>

<button onclick={handleClick}>switch</button>

<div>flag : {flag}</div>

{#if !flag}
	<div>boolElText : {boolElText}</div>
{/if}
