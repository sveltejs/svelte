<script>
	import { spring } from 'svelte/motion';
	import { SplitPane } from '@rich_harris/svelte-split-pane';

	const UNIT_REGEX = /(\d+)(?:(px|rem|%|em))/i;

	/** @type {string} */
	export let panel;

	/** @type {Exclude<import('@rich_harris/svelte-split-pane/dist/SplitPane.svelte').SplitPaneProps['max'], undefined>} */
	export let pos = '90%';

	$: previous_pos = Math.min(+pos.replace(UNIT_REGEX, '$1'), 70);

	/** @type {Exclude<import('@rich_harris/svelte-split-pane/dist/SplitPane.svelte').SplitPaneProps['max'], undefined>} */
	let max = '90%';

	// we can't bind to the spring itself, but we
	// can still use the spring to drive `pos`
	const driver = spring(+pos.replace(UNIT_REGEX, '$1'), {
		stiffness: 0.2,
		damping: 0.5
	});

	// @ts-ignore
	$: pos = $driver + '%';

	const toggle = () => {
		const numeric_pos = +pos.replace(UNIT_REGEX, '$1');

		driver.set(numeric_pos, { hard: true });

		if (numeric_pos > 80) {
			driver.set(previous_pos);
		} else {
			previous_pos = numeric_pos;
			driver.set(+max.replace(UNIT_REGEX, '$1'));
		}
	};
</script>

<SplitPane {max} min="10%" type="vertical" bind:pos priority="max">
	<section slot="a">
		<slot name="main" />
	</section>

	<section slot="b">
		<div class="panel-header">
			<button class="panel-heading" on:click={toggle}>{panel}</button>
			<slot name="panel-header" />
		</div>

		<div class="panel-body">
			<slot name="panel-body" />
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

	.panel-body {
		overflow: auto;
	}

	.panel-heading {
		font: 700 12px/1.5 var(--sk-font);
		color: var(--sk-text-1, #333);
		flex: 1;
		text-align: left;
	}

	section {
		overflow: hidden;
	}
</style>
