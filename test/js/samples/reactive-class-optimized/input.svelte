<script context="module">
	let nonReactiveModuleVar = Math.random();
	let reactiveModuleVar = Math.random();
</script>

<script>
	nonReactiveGlobal = Math.random();
	const reactiveConst = {x: Math.random()};

	reactiveModuleVar += 1;
	if (Math.random()) {
		reactiveConst.x += 1;
	}
</script>

<!--These should all get updaters because they have at least one reactive dependency-->
<div class:update1={reactiveModuleVar}></div>
<div class:update2={reactiveConst.x}></div>
<div class:update3={nonReactiveGlobal && reactiveConst.x}></div>

<!--These shouldn't get updates because they're purely non-reactive-->
<div class:static1={nonReactiveModuleVar}></div>
<div class:static1={nonReactiveGlobal}></div>
<div class:static1={nonReactiveModuleVar && nonReactiveGlobal}></div>
