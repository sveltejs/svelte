<script lang="ts">
	import { on } from 'svelte/events';

	let propagation = $state<HTMLElement>();
	let immediate = $state<HTMLElement>();
	let descendant = $state<HTMLElement>();
	let descendant_immediate = $state<HTMLElement>();
	let native = $state<HTMLElement>();
	let native_child = $state<HTMLButtonElement>();
	let capture = $state<HTMLElement>();
	let calls = $state<string[]>([]);

	$effect(() => {
		if (
			!propagation ||
			!immediate ||
			!descendant ||
			!descendant_immediate ||
			!native ||
			!native_child ||
			!capture
		) return;

		const native_handler = (event: Event) => {
			calls.push('native');
			event.stopPropagation();
		};

		native.addEventListener('click', native_handler);

		const cleanups = [
			on(propagation, 'click', (event) => {
				calls.push('first');
				event.stopPropagation();
			}),
			on(propagation, 'click', () => calls.push('second')),
			on(immediate, 'click', (event) => {
				calls.push('first');
				event.stopImmediatePropagation();
			}),
			on(immediate, 'click', () => calls.push('second')),
			on(descendant, 'click', () => calls.push('parent first')),
			on(descendant, 'click', () => calls.push('parent second')),
			on(descendant_immediate, 'click', () => calls.push('parent first')),
			on(descendant_immediate, 'click', () => calls.push('parent second')),
			on(native_child, 'click', () => calls.push('child')),
			on(native, 'click', () => calls.push('parent')),
			on(
				capture,
				'click',
				(event) => {
					calls.push('capture first');
					event.stopPropagation();
				},
				{ capture: true }
			),
			on(capture, 'click', () => calls.push('capture second'), { capture: true })
		];

		return () => {
			native.removeEventListener('click', native_handler);
			for (const cleanup of cleanups) cleanup();
		};
	});
</script>

<section bind:this={propagation}>
	<button onclick={() => calls.push('delegated')}>stop propagation</button>
</section>
<section bind:this={immediate}>
	<button onclick={() => calls.push('delegated')}>stop immediate propagation</button>
</section>
<section bind:this={descendant}>
	<button
		onclick={(event) => {
			calls.push('descendant');
			event.stopPropagation();
		}}>stop in descendant</button
	>
</section>
<section bind:this={descendant_immediate}>
	<button
		onclick={(event) => {
			calls.push('descendant immediate');
			event.stopImmediatePropagation();
		}}>stop immediately in descendant</button
	>
</section>
<section bind:this={native}>
	<button bind:this={native_child}>native listener</button>
</section>
<section bind:this={capture}>
	<button onclick={() => calls.push('target')}>capture listeners</button>
</section>
<button
	onclick={(event) => {
		calls.push('root descendant');
		event.stopPropagation();
	}}>stop before root listeners</button
>
<button
	onclick={(event) => {
		calls = [];
		event.stopPropagation();
	}}>reset</button
>
<output>{calls.join(', ')}</output>
