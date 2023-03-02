<script>
	import { fly } from 'svelte/transition';

	let number = 0;
</script>

<div>
	The number is:
	<span style="display: inline-block" in:fly={{ y: -20 }}>
		{number}
	</span>
</div>
<br />
<button
	on:click={() => {
		number += 1;
	}}>
	Increment
</button>
