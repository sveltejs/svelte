<script>
	import Child from './child.svelte';
	import { global } from './state.svelte.js';
	global.value.count = 0;
</script>

<!-- binding shouldn't accidentally narrow ownership when it's already global -->
<Child bind:a={global.value} />

<button onclick={() => global.value.count++}>
	clicks: {global.value.count}
</button>
