<script>
	import { on } from 'svelte/events';

	let onclick = $state.raw({
		handleEvent(ev) {
			console.log(this === ev.currentTarget);
		}
	});

	function click2() {
		console.log("mutated");
	}

	function click3() {
		console.log("assigned");
	}

	let btn;
	let step = 1;
	$effect(() => {
		return on(btn, 'click', () => {
			switch (step) {
				case 1: {
					onclick.handleEvent = click2;
					step = 2;
					break;
				}
				case 2: {
					onclick = { handleEvent: click3 };
				}
			}
		});
	});
</script>

<button {onclick}>a</button>
<button {...{onclick}}>b</button>
<button bind:this={btn}>next</button>
