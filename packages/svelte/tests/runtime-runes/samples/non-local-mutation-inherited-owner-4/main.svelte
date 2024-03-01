<script>
	import { global } from './state.svelte.js';
	import Sub from './sub.svelte';
</script>

<Sub />
<!-- it's important _NOT_ to read global.a.b in the template,
     else the proxy would set up the structure with its own component context already -->
<button onclick={() => global.increment_a_b()}>
	click me
</button>
