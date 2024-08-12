<script>
	/** @import { Snippet } from 'svelte' */
	import { spring } from 'svelte/motion';
	import { SplitPane } from '@rich_harris/svelte-split-pane';

	/** @type {{ title: string; pos: number, main?: Snippet, header?: Snippet, body?: Snippet }} */
	let { title, pos, main, header, body } = $props();

	let expanded_pos = Math.min(pos, 70);

	const max = 90;

	const driver = spring(pos, {
		stiffness: 0.2,
		damping: 0.5
	});

	const expanded = $derived(pos < 80);

	const toggle = () => {
		// The spring might be out of date, so snap it before animating the toggle

		if (expanded) {
			expanded_pos = pos;
			driver.set(max);
			pos = max;
		} else {
			driver.set(expanded_pos);
			pos = expanded_pos;
		}
	};
</script>

<SplitPane
	max="{max}%"
	min="10%"
	type="vertical"
	pos="{$driver}%"
	priority="max"
	on:change={(ev) => {
		pos = Number(ev.detail.substring(0, ev.detail.length - 1));
	}}
>
	<section slot="a">
		{@render main?.()}
	</section>

	<section slot="b">
		<div class="panel-header">
			<button class="panel-heading" onclick={toggle}>
				<svg viewBox="0 0 20 20" fill="currentColor" class="chevron" class:expanded>
					<path
						fill-rule="evenodd"
						d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
						clip-rule="evenodd"
					/>
				</svg>

				{title}
			</button>
			{@render header?.()}
		</div>

		<div class="panel-body">
			{@render body?.()}
		</div>
	</section>
</SplitPane>

<style>
	.panel-header {
		height: 42px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0.5em;
		cursor: pointer;
	}

	.chevron {
		transition: transform 0.2s ease-in-out;
	}
	.chevron.expanded {
		transform: rotate(180deg);
	}

	.panel-body {
		overflow: auto;
	}

	.panel-heading {
		font: 700 12px/1.5 var(--sk-font);
		color: var(--sk-text-1, #333);
		flex: 1;
		text-align: left;
		display: flex;
		align-items: center;
	}

	section {
		overflow: hidden;
	}
</style>
