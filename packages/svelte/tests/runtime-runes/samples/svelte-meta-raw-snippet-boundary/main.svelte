<script lang="ts">
	import { createRawSnippet } from 'svelte';

	const pending = createRawSnippet(() => ({
		render: () => '<section>loading</section>'
	}));
</script>

<output>
	<svelte:boundary {pending}>
		{await new Promise(() => {})}
	</svelte:boundary>
	<p>after</p>
</output>
