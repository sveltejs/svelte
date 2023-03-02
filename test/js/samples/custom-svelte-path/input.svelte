<script>
	import { onMount } from 'svelte';
	let name = '';
  onMount(() => {
    name = 'world';
  })
</script>

<h1>Hello {name}!</h1>