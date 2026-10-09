<script lang="ts">
	import { Warp } from 'svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, Promise<any>>('app');

	function delay<T>(value: T) {
		return new Promise<T>((fulfil) => setTimeout(() => fulfil(value), 10));
	}
</script>

<svelte:boundary>
	{@const user = await warp.getOrInsertComputed('user', () => delay({ id: 1, environment }))}
	{@const posts = await warp.getOrInsertComputed(`posts:${user.id}`, () => delay(`posts from ${environment}`))}

	<p>{user.environment}: {posts}</p>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
