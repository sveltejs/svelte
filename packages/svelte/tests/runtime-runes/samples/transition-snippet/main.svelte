<script>
	import { fade } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import Container from './Container.svelte';
</script>

<Container>
	<p style="opacity: 1" transition:fade={{ duration: 100, easing: linear }}>hello</p>
</Container>
