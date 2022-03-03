<script>
	export let foo = '"></div>\\<script>alert(42)</' + 'script>';
	export let bar = { toString: () => '"></div>\\<script>alert(42)<\/script>' };
</script>

<div foo={foo} bar={bar}></div>
