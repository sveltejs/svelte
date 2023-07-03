<section>
	<div>Nom</div>
	<slot name="name" />
	{#if $$slots.email}
		<div>e-mail</div>
		<slot name="email" />
	{/if}
	{#if $$slots.phone}
		<div>Téléphone</div>
		<slot name="phone" />
	{/if}
</section>

<style>
	section {
		width: 200px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 16px;
		box-shadow: 2px 2px 4px #dedede;
		border: 1px solid #888;
		margin-bottom: 16px;
	}
</style>
