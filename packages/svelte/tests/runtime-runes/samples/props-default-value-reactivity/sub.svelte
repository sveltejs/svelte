<script>
	import { get_translation } from './translations.svelte.js';

	const {
		p0 = get_translation()
	} = $props();
</script>

<p>greeting: {p0}</p>