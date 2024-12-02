<script>
	import { SvelteURL } from 'svelte/reactivity';

	let url = new SvelteURL('https://svelte.dev/repl/hello-world?version=5.0');
</script>

<div>href: {url.href}</div>
<div>host: {url.host}</div>
<div>pathname: {url.pathname}</div>
<div>search: {url.search}</div>
<div>version: {url.searchParams.get('version')}</div>
<div>t: {url.searchParams.get('t')}</div>

<button onclick={() => {
	url.hostname = 'kit.svelte.dev';
}}>update hostname</button>
<button onclick={() => {
	url.pathname = 'docs/introduction';
}}>update pathname</button>
<button onclick={() => {
	url.search = '?t=123';
}}>update search</button>
<button onclick={() => {
	url.href = 'https://google.com/search?version=3';
}}>update href</button>
