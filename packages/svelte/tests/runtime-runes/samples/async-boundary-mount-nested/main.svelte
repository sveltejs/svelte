<script>
	import Child from './Child.svelte';
	let generation = $state(0);
	let resolvers = {};

	function push(name) {
		return new Promise((resolve) => resolvers[name] = resolve);
	}

	export function get_resolvers() {
		return { ...resolvers };
	}
</script>

<button onclick={() => resolvers.inner('inner')}>inner</button>
<button onclick={() => resolvers.outer('outer')}>outer</button>
<button onclick={() => generation++}>reset</button>

{#key generation}
	<svelte:boundary>
		<svelte:boundary>
			<svelte:boundary>
				<Child name={await push('inner')} />
			</svelte:boundary>

			{#snippet pending()}
				<Child name="inner pending" />
			{/snippet}
		</svelte:boundary>

		<p>{await push('outer')}</p>

		{#snippet pending()}
			<Child name="outer pending" />
		{/snippet}
	</svelte:boundary>
{/key}
