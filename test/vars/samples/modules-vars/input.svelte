<script context='module'>
	let a = {};
	let b = {};
	let c = {};
	let d = {};
</script>
<script>
	let c = {};

	a = 1;
	b.x = 1;

	function foo() {
		let d = {};
		c = 1;
		d.x = 1;
	}
</script>