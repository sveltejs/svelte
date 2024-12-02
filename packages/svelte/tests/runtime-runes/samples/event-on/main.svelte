<script>
	import { on } from 'svelte/events';

	let count = $state(0);

	function increment(e) {
		e.stopPropagation();
		count += 1;
	}

	let sectionEl
	$effect(() => {
		return on(sectionEl, 'click', () => {
			console.log('logged from addEventListener');
		});
	});
</script>

<section bind:this={sectionEl} onclick={() => console.log('logged from onclick')}>
	<button onclick={increment}>
		clicks: {count}
	</button>
</section>
