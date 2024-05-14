<script>
	import { page } from '$app/stores';
	import { DocsContents } from '@sveltejs/site-kit/docs';
	import { goto } from '$app/navigation';

	export let data;
	$: param_version = $page.params.version ?? 'latest';
	$: version = param_version;
	$: if (version !== param_version)
		goto(`/docs/${version === 'latest' ? '' : version + '/'}introduction`);
	$: version_groups = data.version_groups
		.slice()
		.reverse()
		.map((group) => ({
			title: group.title,
			versions: Object.keys(group.versions).reverse()
		}));

	$: pageData = $page.data.page;

	$: title = pageData?.title;
	$: category = pageData?.category;
</script>

<div class="container">
	<div class="toc-container" style="order: 1">
		<div class="toc-version-picker">
			Version:
			<select bind:value={version}>
				<option value="latest">Latest</option>
				{#each version_groups as group}
					<optgroup label={group.title}>
						{#each group.versions as version}
							<option value={'v-' + version}>{version}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>
		<DocsContents contents={data.sections} />
	</div>

	<div class="page content">
		{#if category}
			<p class="category">{category}</p>
		{/if}
		{#if title}
			<h1>{title}</h1>
		{/if}

		<slot />
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);
		--ts-toggle-height: 4.2rem;

		display: flex;
		flex-direction: column;
	}

	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);

		min-width: 0 !important;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	.category {
		font: 700 var(--sk-text-s) var(--sk-font);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 0.5em;
		color: var(--sk-text-3);
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-container {
		background: var(--sk-back-3);
		display: none;
	}

	@media (min-width: 832px) {
		.toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-bottom-height));
			position: fixed;
			left: 0;
			top: var(--sk-nav-height);
			overflow-x: hidden;
			overflow-y: auto;
		}

		.toc-container::before {
			content: '';
			position: fixed;
			width: 0;
			height: 100%;
			top: 0;
			left: calc(var(--sidebar-width) - 1px);
			border-right: 1px solid var(--sk-back-5);
		}

		.page {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-version-picker {
		display: flex;
		gap: 1rem;
		margin: 2rem 0 -6rem 18.4rem;
		position: relative;
		z-index: 5;
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(28rem, 23vw);
			flex-direction: row;
		}

		.page {
			--on-this-page-display: block;
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			max-width: var(--sk-line-max-width);
			box-sizing: content-box;
		}
	}
</style>
