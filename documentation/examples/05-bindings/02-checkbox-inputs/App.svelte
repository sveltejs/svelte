<script>
	let yes = false;
</script>

<label>
	<input type="checkbox" bind:checked={yes} />
	Oui ! Envoyez-moi du courrier indésirable
</label>

{#if yes}
	<p>Merci. Nous allons bombarder votre boite mail et vendre vos données personnelles.</p>
{:else}
	<p>Vous devez accepter pour continuer. Si vous ne payez pas, vous êtes le produit.</p>
{/if}

<button disabled={!yes}> S'abonner </button>
