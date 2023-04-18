<section>
	<div class="inner"><slot /></div>
</section>

<style>
	section {
		padding: 10rem 0;
		background: var(--background, var(--sk-back-2));
	}

	.inner {
		max-width: 120rem;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
	}
</style>
