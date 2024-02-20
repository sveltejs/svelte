<script>
	import { global } from './state.svelte.js';

	global.a = { b: 0 };
</script>

<button onclick={() => global.a.b += 1}>
	clicks: {global.a.b}
</button>
