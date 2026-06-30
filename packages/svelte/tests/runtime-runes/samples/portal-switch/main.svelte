<script module>
	import { createContext } from 'svelte';

	const [getPortalKey, setPortalKey] = createContext();
	export { getPortalKey };
</script>

<script>
	import PageA from './PageA.svelte';
	import PageB from './PageB.svelte';

	const portalKey = Symbol('portal');
	setPortalKey(portalKey);

	let Page = $state(PageA);
</script>

<div>
	{@portal portalKey}
</div>

<button onclick={() => Page = Page === PageA ? PageB : PageA}>switch page</button>

<Page />
