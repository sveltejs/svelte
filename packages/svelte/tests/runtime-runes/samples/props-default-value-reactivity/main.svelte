<script>
	import Sub from './sub.svelte';
	import { set_translation } from './translations.svelte.js';
</script>

<Sub />

<button onclick={() => set_translation('Hola')}>
	Change Language
</button>