const state = $state(0);

const derived = $derived(state + 2);

let effect = {};
let inspect = {};

$effect.root(() => {
	$inspect(state);

	$effect(() => {
		console.log(state);
	});
});
