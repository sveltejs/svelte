<script>
	import { fly } from 'svelte/transition';

	let number = 0;
</script>

<div>
	The number is:
	{#key number}
		<span style="display: inline-block" in:fly={{ y: -20 }}>
			{number}
		</span>
	{/key}
</div>
<br />
<button
	on:click={() => {
		number += 1;
	}}
>
	Increment
</button>
