<script>
	import { handler, log_a, log_b } from './event.svelte.js';
</script>

<button onclick={handler.value}>click</button>
<button onclick={() => (handler.value = log_b)}>change</button>
<button onclick={() => (handler.value = log_a)}>change back</button>
