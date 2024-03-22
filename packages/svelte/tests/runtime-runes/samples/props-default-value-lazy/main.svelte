<script>
	import Sub from "./sub.svelte";

	let p0 = $state(0);
	let p1 = $state(0);
	let p2 = $state(0);
	let p3 = $state(0);
	let p4 = $state();
	let p5 = $state();
	let p6 = $state();
	let p7 = $state();
</script>

<Sub {p0} {p1} {p2} {p3} {p4} {p5} {p6} {p7} />

<button onclick={() => {
  p0 = undefined;
  p1 = undefined;
  p2 = undefined;
  p3 = undefined;
  p4 = undefined;
  p5 = undefined;
  p6 = undefined;
  p7 = undefined;
}}>Set all to undefined</button>
