<script>
	import { goto } from '@sapper/app';
	import { Icon } from '@sveltejs/site-kit';
	import OutClick from 'svelte-outclick';

	export let sections;
	export let selected;

	let isMenuOpen = false;
	let menuToggle;

	// Locate scrollbar at first direct url navigation to make the active menu item visible.
	let selectedMenuItem;
	const toggleMenu =_=> {
		isMenuOpen = !isMenuOpen;
		// Menu position autocorrects to show the selected tutorial item at the top.
		if (isMenuOpen) selectedMenuItem.scrollIntoView();
	}
</script>

<style>
	nav {
    display: grid;
    grid-template-columns: 54px 1fr 54px;
    height: 54px;
    border-bottom: 1px solid rgb(255, 255, 255, .1);
		user-select: none;
		-webkit-user-drag: none;
	}

	.nav-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    color: white;
		opacity: .75;
	}

	.nav-handle:hover,
	.nav-handle:focus {
		opacity: 1;
	}

	.nav-handle.disabled {
		color: white !important;
		opacity: 0.3 !important;
		cursor: default;
	}

	.nav-middle {
    position: relative;
    height: 100%;
    font-size: 14px;
    color: white;
	}

	.menu-toggle {
    display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		height: 100%;
		outline: none;
		cursor: pointer;
	}

	.menu-toggle:hover .nav-menu-icon {
		opacity: 1;
	}

	.nav-menu-icon {
    width: 30px;
    min-width: 30px;
    height: 29px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgb(255, 255, 255, .2);
    border-radius: 99px;
		opacity: .75;
    color: white;
		transition: 200ms ease-in;
	}

	.nav-title {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
    overflow: hidden;
		white-space: nowrap;
	}

	.nav-section-title {
		opacity: .75;
	}

	.nav-title-divider {
		opacity: .3;
		font-size: 10px;
	}

	.nav-chapter-title {
		font-weight: 600;
	}

	.menu {
    position: absolute;
    top: calc(100% + 1px);
		left: 0;
    right: 0;
		height: 0;
    max-height: 50vh;
		padding: 0;
		overflow: hidden;
    z-index: 1;
		border-radius: 0 0 2px 6px;
    background: var(--second);
    box-shadow: 4px 16px 32px rgb(80, 80, 94);
		transition: 100ms cubic-bezier(0, 0, 0.2, 1);
	}

	/* TODO */
	.menu--open,
	.menu:focus-within {
    height: 300px !important;
		padding-top: 8px !important;
		padding-bottom: 8px !important;
    overflow-y: auto !important;
	}

	.menu::-webkit-scrollbar,
	.menu::-webkit-scrollbar-track,
	.menu::-webkit-scrollbar-thumb {
		border-radius: 4px;
	}
	.menu::-webkit-scrollbar {
		width: 4px;
	}
	.menu::-webkit-scrollbar-track {
		background: rgb(255, 255, 255, .2);
	}
	.menu::-webkit-scrollbar-thumb {
		background: rgb(255, 255, 255, .4);
	}
	.menu::-webkit-scrollbar-thumb:hover {
		background: rgb(255, 255, 255, .6);
	}

	.menu a {
		display: block;
		padding: 12px 16px !important;
		border: unset !important;
		color: white;
		font-weight: 600;
		outline: none;
	}

	.menu a:hover,
	.menu a:focus {
		background: rgb(255, 255, 255, .1);
	}

	.menu a.selected {
		position: relative;
		color: white !important;
		background: rgb(255, 255, 255, .1);
		border-left: 2px solid rgb(255, 255, 255, .75) !important;
	}

	.menu ul a {
		padding-left: 32px !important;
		font-weight: 400;
		color: rgb(255, 255, 255, .75);
	}
</style>

<nav>
	<a class="nav-handle no-underline" class:disabled={!selected.prev} sapper:prefetch aria-label="Previous tutorial step" href="tutorial/{(selected.prev || selected).slug}">
		<Icon name="arrow-left" />
	</a>

	<div class="nav-middle">
		<!-- I didn't use <button> because we don't want its extra focus. Users can directly focus on the first menu item and it will open the menu because of the :focus-within. -->
		<div class="menu-toggle" on:click={toggleMenu} bind:this={menuToggle} role="button">
			<div class="nav-menu-icon">
				<Icon name="menu" size="16" />
			</div>
	
			<div class="nav-title">
				<span class="nav-section-title">{selected.section.title}</span>
				<span class="nav-title-divider">:</span>
				<span class="nav-chapter-title">{selected.chapter.title}</span>
			</div>
		</div>

		<OutClick on:outclick={_=> isMenuOpen = false} exclude={[menuToggle]} includeSelf={true}>
			<ul class="menu" class:menu--open={isMenuOpen}>
				{#each sections as section, i}
					<li>
						<a href="tutorial/{section.chapters[0].slug}">{section.title}</a>
						<ul>
							{#each section.chapters as chapter, i}
								{#if selected.slug === chapter.slug}
									<li><a class="selected" bind:this={selectedMenuItem} href="tutorial/{chapter.slug}">
										{chapter.title}
									</a></li>
								{:else}
									<li><a href="tutorial/{chapter.slug}">
										{chapter.title}
									</a></li>
								{/if}
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</OutClick>
	</div>

	<a class="nav-handle no-underline" class:disabled={!selected.next} sapper:prefetch aria-label="Next tutorial step" href="tutorial/{(selected.next || selected).slug}">
		<Icon name="arrow-right" />
	</a>
</nav>
