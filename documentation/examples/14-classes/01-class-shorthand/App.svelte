<script>
	let big = false;
</script>

<label>
	<input type="checkbox" bind:checked={big} />
	grand
</label>

<div class:big>
	un texte de {big ? 'grande' : 'petite'} taille
</div>

<style>
	.big {
		font-size: 4em;
	}
</style>
