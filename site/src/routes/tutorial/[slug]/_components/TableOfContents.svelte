<script>
	import { goto } from '@sapper/app';
	import Icon from '../../../../components/Icon.svelte';

	export let sections;
	export let slug;
	export let selected;

	function navigate(e) {
		goto(`tutorial/${e.target.value}`);
	}
</script>

<style>
	nav {
		display: grid;
		grid-template-columns: 2.5em 1fr 2.5em;
		border-bottom: 1px solid #eee;
	}

	div {
		position: relative;
		padding: 1em 0.5em;
		font-weight: 300;
		font-size: var(--h6);
		color: var(--text);
		cursor: pointer;
	}

	a {
		display: block;
		padding: 0.7em 0;
		text-align: center;
	}

	a.disabled, a.disabled:hover, a.disabled:active {
		color: var(--second);
	}

	span {
		white-space: nowrap;
		color: var(--prime);
	}

	strong {
		color: var(--heading);
	}

	select {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0.0001;
	}
</style>

<nav>
	<a rel="prefetch" href="tutorial/{(selected.prev || selected).slug}" class:disabled={!selected.prev}>
		<Icon name="arrow-left" />
	</a>

	<div>
		<span><strong>{selected.section.title} /</strong> {selected.chapter.title}</span>

		<select value={slug} on:change={navigate}>
			{#each sections as section, i}
				<optgroup label="{i + 1}. {section.title}">
					{#each section.chapters as chapter, i}
						<option value={chapter.slug}>{String.fromCharCode(i + 97)}. {chapter.title}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
	</div>

	<a rel="prefetch" href="tutorial/{(selected.next || selected).slug}" class:disabled={!selected.next}>
		<Icon name="arrow-right" />
	</a>
</nav>