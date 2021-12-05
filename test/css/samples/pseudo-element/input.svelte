<span></span>

<style>
	span::after {
		content: 'i am a pseudo-element';
	}

	span:first-child {
		color: red;
	}

	span:last-child::after {
		color: blue;
	}
</style>