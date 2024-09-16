<script>
	import { stuff } from './stuff.svelte.js';
</script>

<button onclick={() => Object.assign(stuff, { x: 1 })}>1</button>
<button onclick={() => Object.assign(stuff, { x: 2 })}>2</button>
<p>{Object.values(stuff)}</p>
