<script>
	let foo = $state({ bar: 1 }, {
		onchange(){
			console.log("foo");
		}
	});
	let baz = $state(foo, {
		onchange(){
			console.log("baz");
		}
	})
</script>

<button onclick={()=> foo.bar++}>foo</button>
<button onclick={()=> baz.bar++}>baz</button>
