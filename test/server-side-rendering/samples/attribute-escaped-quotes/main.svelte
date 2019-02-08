<script>
	export let foo = '"></div><script>alert(42)</' + 'script>';
</script>

<div foo={foo}></div>