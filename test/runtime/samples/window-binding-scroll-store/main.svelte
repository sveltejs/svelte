<script>
	import { writable, derived } from 'svelte/store';
	const y = writable(0);
	const y_squared = derived(y, $y => $y * $y);
</script>

<svelte:window bind:scrollY={$y}/>

<p style="position: fixed; top: 1em; left: 1em;">
	scroll y is {$y}. {$y} * {$y} = {$y_squared}
</p>

<div style="height: 9999px">
	
</div>