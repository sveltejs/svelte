<script>
	import { fork } from "svelte";
	
	let state = $state(0);

	let count = $derived(state);

	$effect.pre(() => {
		console.log(count);
	});

	let forked;
</script>

<button onclick={()=>{
	forked?.discard?.();
	forked = fork(()=>{
		state++;
	});
}}>
	fork 1
</button>

<button onclick={()=>{
	forked?.discard?.();
	forked = fork(()=>{
		state++;
	})
}}>
	fork 2
</button>

<button onclick={()=>{
	forked?.commit();
}}>commit</button>

<p>{count}</p>
