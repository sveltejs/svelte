<script lang="ts">
	import { writable } from 'svelte/store';
	const page = writable(1);
	const { value = $page } = $props();
</script>

{value}
