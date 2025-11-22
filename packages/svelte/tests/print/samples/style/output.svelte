

<style>
	.foo {
		color: red;
	}

	.foo.bar {
		color: blue;
	}

	@media (max-width: 600px) {
		.box {
			display: none;
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@font-face {
		font-family: "MyFont";

		src: url("/fonts/MyFont.woff2") format("woff2");
	}

	.container .item {
		color: red;
	}

	nav > ul.menu {
		display: flex;
	}

	h2 + p.note {
		margin-top: 0;
	}

	li:nth-child(2n + 1) {
		color: red;
	}

	.button:hover {
		opacity: 0.5;
	}

	.card::before {
		content: "";

		display: block;
	}
</style>
