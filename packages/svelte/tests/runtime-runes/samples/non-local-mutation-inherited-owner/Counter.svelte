<script>
	import { global } from './state.svelte.js';
</script>

<button onclick={() => global.object.count += 1}>
	clicks: {global.object.count}
</button>
