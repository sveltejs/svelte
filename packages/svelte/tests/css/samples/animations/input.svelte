<h1>test</h1>

<style>
	@keyframes a {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(2);
		}
	}

	@keyframes animation {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(2);
		}
	}

	h1 {
		animation: 1s linear infinite a;
		animation: a 1s linear infinite;
		animation: 1s linear infinite a,animation 1s linear infinite;
	}
</style>
