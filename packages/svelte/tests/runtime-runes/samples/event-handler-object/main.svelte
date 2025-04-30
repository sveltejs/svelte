<script>
	import { on } from 'svelte/events';

	let count = $state(0);

	let onclick = $state.raw({
		handleEvent() {
			count += +this.dataset.step;
			console.log(count);
		}
	});

	function click2() {
		count++;
		console.log(count);
	}

	function click3() {
		count += 2;
		console.log(count);
	}

	let btn;
	$effect(() => {
		return on(btn, 'click', () => {
			if (onclick.handleEvent !== click2) {
				onclick.handleEvent = click2;
			} else {
				onclick = { handleEvent: click3 };
			}
		});
	});
</script>

<button data-step="2" {onclick}>
	clicks: {count}
</button>
<button data-step="3" {...{onclick}}>inc</button>
<button bind:this={btn}>next</button>
