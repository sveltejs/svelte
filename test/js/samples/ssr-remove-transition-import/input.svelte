<script>
	import { fly } from 'svelte/transition';
	let name = 'world';
</script>

<h1 transition:fly={{duration: 150, y: 50}}>Hello {name}!</h1>