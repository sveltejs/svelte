<script>
	// import { Contents, Main, Section } from '@sveltejs/site-kit/docs';

	/** @type {import('./$types').PageData} */
	export let data;

	let path;

	$: contents = data.sections.map((section) => ({
		path: `/docs#${section.slug}`,
		title: section.title,
		sections: section.sections.map((subsection) => ({
			path: `/docs#${subsection.slug}`,
			title: subsection.title,
			sections: subsection.sections.map((subsection) => ({
				path: `/docs#${subsection.slug}`,
				title: subsection.title,
			})),
		})),
	}));
</script>

<svelte:head>
	<title>Docs • Svelte</title>

	<meta name="twitter:title" content="Svelte docs" />
	<meta name="twitter:description" content="Complete documentation for Svelte" />
	<meta name="Description" content="Complete documentation for Svelte" />
</svelte:head>

<!-- <Main bind:path>
	<h1>Documentation</h1>

	{#each data.sections as section}
		<Section
			{section}
			edit="https://github.com/sveltejs/svelte/edit/master/site/content/docs/{section.file}"
			base="/docs"
		/>
	{/each}
</Main>

<Contents {contents} {path} /> -->
