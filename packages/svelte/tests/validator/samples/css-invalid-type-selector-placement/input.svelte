<style>
	:global(.foo):foo {
		color: red;
	}
	:global(.foo)::foo {
		color: red;
	}
	:global(.foo).bar {
		color: red;
	}
	:global(.foo)#baz {
		color: red;
	}
	:global(.foo)[id] {
		color: red;
	}
	:global(.foo)h1 {
		color: red;
	}
</style>

<div>
	<h1 class="bar" id="baz">hello world</h1>
</div>
