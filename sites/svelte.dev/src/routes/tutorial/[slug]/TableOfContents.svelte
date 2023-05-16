<script>
	import { goto } from '$app/navigation';
	import { Icon } from '@sveltejs/site-kit/components';

	/** @type {import('$lib/server/tutorial/types').TutorialsList} */
	export let sections;
	export let slug;
	export let selected;

	let select_focused = false;

	function navigate(e) {
		goto(`/tutorial/${e.target.value}`);
	}
</script>

<nav>
	<a
		aria-label="Previous tutorial step"
		class="no-underline"
		href="/tutorial/{(selected.prev || selected).slug}"
		class:disabled={!selected.prev}
	>
		<Icon name="arrow-left" />
	</a>

	<div style:box-shadow={select_focused ? 'var(--sk-focus-outline)' : null}>
		<span>
			<strong>
				<span style="position: relative; top: -0.1em; margin: 0 0.5em 0 0"
					><Icon name="menu" /></span
				>
				{selected.section.title} /
			</strong>
			{selected.chapter.title}
		</span>

		<select
			aria-label="Tutorial Chapter"
			value={slug}
			on:change={navigate}
			on:focus={() => (select_focused = true)}
			on:blur={() => (select_focused = false)}
		>
			{#each sections as section, i}
				<optgroup label="{i + 1}. {section.title}">
					{#each section.tutorials as chapter, i}
						<option value={chapter.slug}>{String.fromCharCode(i + 97)}. {chapter.title}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
	</div>

	<a
		aria-label="Next tutorial step"
		class="no-underline"
		href="/tutorial/{(selected.next || selected).slug}"
		class:disabled={!selected.next}
	>
		<Icon name="arrow-right" />
	</a>
</nav>

<style>
	nav {
		display: grid;
		align-items: center;
		grid-template-columns: 2.5em 1fr 2.5em;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	div {
		position: relative;
		padding: 1em 0.5em;
		font-weight: 300;
		font-size: var(--sk-text-xs);
		color: var(--sk-text-2);
	}

	a {
		display: block;
		padding: 0.7em 0;
		text-align: center;
		opacity: 0.75;
		color: var(--sk-text-2);
	}

	a:hover {
		opacity: 1;
	}

	a.disabled,
	a.disabled:hover,
	a.disabled:active {
		color: white;
		opacity: 0.3;
	}

	span {
		white-space: nowrap;
		position: relative;
		top: 0.1em;
	}

	strong {
		opacity: 0.7;
	}

	select {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0.0001;
		cursor: pointer;
		appearance: none;
	}
</style>
