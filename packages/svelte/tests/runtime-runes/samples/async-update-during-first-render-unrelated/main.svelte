<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(0);
	const answer = Promise.withResolvers<string>();
</script>

<button onclick={() => count++}>bump</button>
<button onclick={() => answer.resolve('ready')}>resolve</button>

<!-- Keep the controls available while the child's first render is pending. -->
<output>
	<svelte:boundary>
		<Child {count} answer={answer.promise} />
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</output>
