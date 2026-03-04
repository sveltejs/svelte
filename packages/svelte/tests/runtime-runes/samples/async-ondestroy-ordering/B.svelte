<script lang="ts">
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';

	onDestroy(() => destroyed.push('B'));
  onDestroy(() => destroyed.push('B*'))
</script>

<div>B</div>