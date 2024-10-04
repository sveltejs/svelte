<script>
	import { run } from 'svelte/legacy';

	let count = $state(0);
	let double = $derived(count * 2);
	
	
	let quadruple = $state();
	run(() => {
		quadruple = count * 4;
		console.log("i have a side effect")
	});

	let eight_times = $state();
	run(() => {
		// updated
		eight_times = count * 8;
	});

	let sixteen_times = $state();
	run(() => {
		// reassigned outside labeled statement
		sixteen_times = count * 16;
	});

	let alot_times = $state();
	run(() => {
		// reassigned in multiple labeled
		alot_times = count * 32;
	});
	run(() => {
		// reassigned in multiple labeled
		alot_times = count * 32;
	});

	let evenmore = $state();
	let evenmore_doubled = $state();
	run(() => {
		// multiple stuff in label
		evenmore = count * 64;
		evenmore_doubled = evenmore * 2;
	});

	let almost_infinity = $derived(count * 128);
	

	let should_be_state = $state(42);
	
	let should_be_state_too = $state(42);
	
</script>

<button onclick={()=>{
	count++;
	eight_times++;
	sixteen_times += 1;
	should_be_state_too++;
}}>click</button>