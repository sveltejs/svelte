<script lang="ts">
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';
	import C from './C.svelte';
	onDestroy(() => destroyed.push('A'));
</script>

<div>A</div>
<C/>