<script>
	import './Mini.svelte';

	const config = { title: 'hello' };
	const items = ['a', 'b'];
	const tag = () => 'x-mini-ssr';
</script>

<x-mini-ssr config={{ title: 'hello' }} items={['a', 'b']}></x-mini-ssr>

<x-mini-ssr {...{ config, items }}></x-mini-ssr>
<svelte:element this={tag()} {config} {items} />
<svelte:element this={tag()} {...{ config, items }} />
