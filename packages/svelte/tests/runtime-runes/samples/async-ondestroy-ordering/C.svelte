<script lang="ts">
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';
	onDestroy(() => destroyed.push('C'));
</script>