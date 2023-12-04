<script>
	import { SearchResults } from '@sveltejs/site-kit/search';

	export let data;
</script>

<svelte:head>
	<title>Search • Svelte</title>
</svelte:head>

<main>
	<h1>Search</h1>
	<form>
		<input
			name="q"
			value={data.query}
			type="search"
			aria-label="Search"
			placeholder="Search"
			spellcheck="false"
		/>
	</form>

	<SearchResults results={data.results} query={data.query} />
</main>

<style>
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 8rem 1rem;
	}

	form {
		--size: 4rem;
		position: relative;
		width: 100%;
		height: var(--size);
		margin: 0 0 2em 0;
	}

	input {
		display: block;
		width: 100%;
		height: 100%;
		font-family: inherit;
		font-size: inherit;
		border: 1px solid var(--sk-back-5);
		border-radius: var(--sk-border-radius);
		padding-left: var(--size);
		border-radius: var(--size);
		background: no-repeat 1rem 50% / 2rem 2rem url(/icons/search.svg);
		color: var(--sk-text-1);
	}
</style>
