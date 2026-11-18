<script lang="ts">
	import { createRawSnippet } from 'svelte';

	const raw = createRawSnippet(() => ({
		render: () => '<section><span>raw</span></section>'
	}));
	const snippets = { raw };
</script>

<h1>before</h1>
<output>
	{@render raw()}
	<p>after direct</p>
	{@render snippets.raw()}
	<strong>after dynamic</strong>
</output>
