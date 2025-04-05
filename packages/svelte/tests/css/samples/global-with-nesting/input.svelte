<style>
	div {
		&:global(.class){
			color: green;
		}
	}
	:global(*) {
		&:hover .class {
			color: green;
		}
	}
</style>

<div>
</div>

<div class="class">
	foo
</div>