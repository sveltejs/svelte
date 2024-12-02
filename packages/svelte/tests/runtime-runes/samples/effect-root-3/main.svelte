<script>
	import { with_root } from './root.svelte.js';
	let x = $state(0);
	let y = $state(0);

	const cleanup = with_root(() => x)
</script>

<button onclick={() => x++}>{x}</button>
<button onclick={() => y++}>{y}</button>
<button onclick={cleanup}>cleanup</button>
