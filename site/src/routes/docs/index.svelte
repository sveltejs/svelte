<script context="module">
	const title_replacements = {
		'1_export_creates_a_component_prop': 'props',
		'2_Assignments_are_reactive': 'reactive assignments',
		'3_$_marks_a_statement_as_reactive': 'reactive statements ($:)',
		'4_Prefix_stores_with_$_to_access_their_values': 'accessing stores ($)'
	};

	export async function preload() {
		const sections = await this.fetch(`docs.json`).then(r => r.json());
		for (const section of sections) {
			for (const subsection of section.subsections) {
				const { slug } = subsection;
				// show abbreviated title in the table of contents
				if (slug in title_replacements) {
					subsection.title = title_replacements[slug];
				}
			}
		}

		return { sections };
	}
</script>

<script>
	import { Docs } from '@sveltejs/site-kit';

	export let sections;
</script>

<svelte:head>
	<title>API Docs • Svelte</title>

	<meta name="twitter:title" content="Svelte API docs">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Cybernetically enhanced web apps">
</svelte:head>

<h1 class="visually-hidden">API Docs</h1>
<Docs {sections}/>
