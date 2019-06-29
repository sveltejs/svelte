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
		display: flex;
		align-items: center;
		border: 2px solid var(--second);
		padding: 5px 10px;
		border-radius: 20px;
		color: var(--text);
	}

	.add-yourself {
		color: var(--prime);
	}

	picture,
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
	<a target="_blank" rel="noopener" href="https://beyonk.com"><img src="organisations/beyonk.svg" alt="Beyonk logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://chess.com" style="background-color: rgb(49,46,43);"><img src="organisations/chess.svg" alt="Chess.com logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://datawrapper.de"><img src="organisations/datawrapper.svg" alt="Datawrapper logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://db.nomics.world" style="background-color: rgb(15,39,47);"><picture><source type="image/webp" srcset="organisations/dbnomics.webp"><img src="organisations/dbnomics.jpg" alt="DBNomics logo" loading="lazy"></picture></a>
	<a target="_blank" rel="noopener" href="https://from-now-on.com"><img src="organisations/from-now-on.png" alt="From-Now-On logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://itslearning.com"><img src="organisations/itslearning.svg" alt="itslearning logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="http://mustlab.ru"><img src="organisations/mustlab.png" alt="Mustlab logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://www.nesta.org.uk"><img src="organisations/nesta.svg" alt="Nesta logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://www.nonkositelecoms.com"><img src="organisations/nonkosi.svg" alt="Nonkosi Telecoms logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://www.nzz.ch"><img src="organisations/nzz.svg" alt="Neue Zürcher Zeitung logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://nytimes.com"><img src="organisations/nyt.svg" alt="The New York Times logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://openstate.eu"><img src="organisations/open-state-foundation.svg" alt="Open State Foundation logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://razorpay.com"><img src="organisations/razorpay.svg" alt="Razorpay logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://sp.nl"><img src="organisations/socialist-party.svg" alt="Socialist Party logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://www.stone.co"><img src="organisations/stone.svg" alt="Stone Payments logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://www.strixengine.com"><img src="organisations/strixcloud.svg" alt="Strix Cloud logo" loading="lazy"><span>Strix Cloud</span></a>
	<a target="_blank" rel="noopener" href="https://thunderdome.dev"><img src="organisations/thunderdome.svg" alt="Thunderdome logo" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://m.tokopedia.com"><img src="organisations/tokopedia.png" alt="Tokopedia logo" srcset="organisations/tokopedia.2x.png 2x, organisations/tokopedia.3x.png 3x" loading="lazy"></a>
	<a target="_blank" rel="noopener" href="https://github.com/sveltejs/svelte/blob/master/site/src/routes/_components/WhosUsingSvelte.svelte" class="add-yourself"><span>+ your company?</span></a>
</div>
