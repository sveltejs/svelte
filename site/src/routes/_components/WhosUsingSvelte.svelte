<!--
	Instructions for adding new logos:

	* Fork this repo, and clone your fork
	* Create a branch called e.g. `add-myorganisation-logo`
	* Add the logo to the `static/organisations` directory (preferably SVG)
	* Add a new <a> tag in this component, in alphabetical order
	* Create a pull request. Thanks!
-->

<style>
	.logos {
		margin: 1em 0 0 0;
		display: flex;
		flex-wrap: wrap;
	}

	a {
		height: 40px;
		margin: 0 0.5em 0.5em 0;
		border: 2px solid var(--second);
		padding: 5px 10px;
		border-radius: 20px;
	}

	.add-yourself {
		display: flex;
		align-items: center;
		border: 2px solid var(--second);
	}

	img {
		height: 100%;
	}

	@media (min-width: 540px) {
		a {
			height: 60px;
			padding: 10px 20px;
			border-radius: 30px;
		}
	}
</style>

<div class="logos">
	<a target="_blank" rel="noopener" href="https://beyonk.com"><img src="organisations/beyonk.svg" alt="Beyonk logo"></a>
	<a target="_blank" rel="noopener" href="https://chess.com" style="background-color: rgb(49,46,43);"><img src="organisations/chess.svg" alt="Chess.com logo"></a>
	<a target="_blank" rel="noopener" href="https://datawrapper.de"><img src="organisations/datawrapper.svg" alt="Datawrapper logo"></a>
	<a target="_blank" rel="noopener" href="https://db.nomics.world" style="background-color: rgb(15,39,47);"><img src="organisations/dbnomics.png" alt="DBNomics logo"></a>
	<a target="_blank" rel="noopener" href="https://from-now-on.com"><img src="organisations/from-now-on.png" alt="From-Now-On logo"></a>
	<a target="_blank" rel="noopener" href="https://itslearning.com"><img src="organisations/itslearning.svg" alt="itslearning logo"></a>
	<a target="_blank" rel="noopener" href="http://mustlab.ru"><img src="organisations/mustlab.png" alt="Mustlab logo"></a>
	<a target="_blank" rel="noopener" href="https://www.nesta.org.uk"><img src="organisations/nesta.svg" alt="Nesta logo"></a>
	<a target="_blank" rel="noopener" href="https://nytimes.com"><img src="organisations/nyt.svg" alt="The New York Times logo"></a>
	<a target="_blank" rel="noopener" href="https://openstate.eu"><img src="organisations/open-state-foundation.svg" alt="Open State Foundation logo"></a>
	<a target="_blank" rel="noopener" href="https://razorpay.com"><img src="organisations/razorpay.svg" alt="Razorpay logo"></a>
	<a target="_blank" rel="noopener" href="https://sp.nl"><img src="organisations/socialist-party.svg" alt="Socialist Party logo"></a>
	<a target="_blank" rel="noopener" href="https://www.stone.co"><img src="organisations/stone.svg" alt="Stone Payments logo"></a>
	<a target="_blank" rel="noopener" href="https://thunderdome.dev"><img src="organisations/thunderdome.svg" alt="Thunderdome logo"></a>
	<a target="_blank" rel="noopener" href="https://m.tokopedia.com"><img src="organisations/tokopedia.png" alt="Tokopedia logo"></a>
	<a target="_blank" rel="noopener" href="https://github.com/sveltejs/svelte/blob/master/site/src/routes/_components/WhosUsingSvelte.svelte" class="add-yourself"><span>+ your company?</span></a>
</div>
