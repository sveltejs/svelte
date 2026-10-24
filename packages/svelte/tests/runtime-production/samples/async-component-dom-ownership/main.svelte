<script>
	import Home from './Home.svelte';
	import ExpressionHome from './ExpressionHome.svelte';
	import Awaiting from './Awaiting.svelte';
	import Normal from './Normal.svelte';
	let page = $state('home');
	const Layout = $derived(page === 'next' ? Awaiting : Normal);
</script>

<button onclick={() => page = 'home'}>home</button>
<button onclick={() => page = 'other'}>other</button>
<button onclick={() => page = 'next'}>next</button>

<Layout>
	{#if page === 'next'}
		<p>next</p>
	{:else if page === 'home'}
		<Home />
	{:else}
		<p>other</p>
	{/if}
</Layout>

<Layout>
	{#if page === 'next'}
		<p>next expression</p>
	{:else if page === 'home'}
		<ExpressionHome />
	{:else}
		<p>other expression</p>
	{/if}
</Layout>
