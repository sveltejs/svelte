<script>
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';

	export let segment;

	let open = false;
	let visible = true;

	// TODO remove this post-https://github.com/sveltejs/svelte/issues/1914
	let ul;
	onMount(() => {
		function handler(event) {
			if (!open) {
				event.preventDefault();
				event.stopPropagation();
				open = true;
			}
		}

		ul.addEventListener('touchstart', handler, {
			capture: true
		});

		return () => {
			ul.removeEventListener('touchstart', handler, {
				capture: true
			});
		};
	});

	let last_scroll = 0;
	function handle_scroll() {
		const scroll = window.pageYOffset;
		visible = (scroll < 50 || scroll < last_scroll);

		last_scroll = scroll;
	}
</script>

<style>
	header {
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100vw;
		height: var(--nav-h);
		padding: 0 var(--side-nav);
		margin: 0 auto;
		background-color: white;
		box-shadow: 0 -0.4rem 0.9rem 0.2rem rgba(0,0,0,.5);
		font-family: var(--font);
		z-index: 10;
		user-select: none;
		transform: translate(0,calc(-100% - 1rem));
		transition: transform 0.2s;
	}

	header.visible {
		transform: none;
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: var(--nav-h);
		padding: 0 var(--side-nav) 0 var(--side-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: transparent;
		transform: none;
		transition: none;
		box-shadow: none;
	}

	h2 {
		display: block;
		text-transform: uppercase;
		font-weight: 300;
		font-size: 2.8rem;
		letter-spacing: .12em;
		line-height: 1;
		margin: 0;
		top: .1rem;
	}

	.primary {
		list-style: none;
		font-family: var(--font);
		margin: 0;
		line-height: 1;
	}

	li {
		display: block;
		display: none;
	}

	li.active {
		display: block;
	}

	ul {
		position: relative;
		padding: 0 2em 0 0;
		background: url(/icons/chevron.svg) calc(100% - 1em) 0.05em no-repeat;
		background-size: 1em 1em;
	}

	ul::after {
		/* prevent clicks from registering if nav is closed */
		position: absolute;
		content: '';
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	ul.open {
		padding: 0 2em 1em 2em;
		background: white;
		border-left: 1px solid #eee;
		border-right: 1px solid #eee;
		border-bottom: 1px solid #eee;
		border-radius: 0 0 var(--border-r) var(--border-r);
		align-self: start;
	}

	ul.open li {
		display: block;
		text-align: right
	}

	ul.open::after {
		display: none;
	}

	ul li a {
		font-size: var(--h6);
		padding: 0 .8rem;
	}

	ul.open li a {
		padding: 2.3rem .7rem 0 .8rem;
		display: block;
	}

	.primary :global(svg) {
		width: 2rem;
		height: 2rem;
	}

	.menu-link {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
	}

	.logo {
		position: relative;
		top: .3rem;
		width: 18rem;
		color: var(--second);
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		z-index: 11;
		padding: 0.5em 0;
	}

	.home {
		position: relative;
		top: 0;
		width: 18rem;
		color: var(--second);
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		z-index: 11;
		padding: 0.5rem 0 0.3rem 4.2rem;
		background: url(/logo.svg) 0 50% no-repeat;
		background-size: auto 100%;
	}

	.active {
		color: var(--prime)
	}

	@media (min-width: 768px) {
		ul {
			padding: 0;
			background: none;
		}

		ul.open {
			padding: 0;
			background: white;
			border: none;
			align-self: initial;
		}

		ul.open li {
			display: inline;
			text-align: left;
		}

		ul.open li a {
			font-size: var(--h6);
			padding: 0 .8rem;
			display: inline;
		}

		ul::after {
			display: none;
		}

		li {
			display: inline !important;
		}

		.hide-if-desktop {
			display: none !important;
		}
	}
</style>

<svelte:window on:click="{() => open = false}" on:scroll={handle_scroll}/>

<header class:visible="{visible || open}">
	<nav>
		<a rel="prefetch" href='.' class="home" title='Homepage'>
			<h2>Svelte</h2>
		</a>

		<ul
			bind:this={ul}
			class="primary"
			class:open
			on:mouseenter="{() => open = true}"
			on:mouseleave="{() => open = false}"
		>
			<li class="hide-if-desktop" class:active="{!segment}"><a rel="prefetch" href=".">Home</a></li>
			<li class:active="{segment === 'guide'}"><a rel="prefetch" href="guide">Guide</a></li>
			<li class:active="{segment === 'repl'}"><a rel="prefetch" href="repl">REPL</a></li>
			<li class:active="{segment === 'blog'}"><a rel="prefetch" href="blog">Blog</a></li>
			<li><a href="https://sapper.svelte.technology">Sapper</a></li>

			<li>
				<a href="https://discord.gg/yy75DKs" title="Discord Chat">
					<Icon name="message-square" />
				</a>
			</li>

			<li>
				<a href="https://github.com/sveltejs/svelte" title="Github Repo">
					<Icon name="github" />
				</a>
			</li>
		</ul>
	</nav>
</header>