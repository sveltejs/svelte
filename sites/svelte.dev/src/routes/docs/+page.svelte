<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	function getURlToRedirectTo() {
		const section = data.sections.find((val) =>
			$page.url.hash.replace('#', '').startsWith(val.path.split('/').at(-1))
		);

		if (!section) goto('/docs/introduction');

		// Remove the section name from hash, then redirect to that
		const hash = $page.url.hash.replace(`#${section.path.split('/').at(-1)}-`, '');

		goto(`${section.path}#${hash}`);
	}

	onMount(() => {
		getURlToRedirectTo();
	});
</script>
