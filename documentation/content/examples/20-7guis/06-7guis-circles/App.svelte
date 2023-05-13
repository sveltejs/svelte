<!--
https://eugenkiss.github.io/7guis/tasks#circle

Click on the canvas to draw a circle. Click on a circle
to select it. Right-click on the canvas to adjust the
radius of the selected circle.
-->

<script>
	let i = 0;
	let undoStack = [[]];
	let circles = [];
	let selected;
	let adjusting = false;
	let adjusted = false;

	function handleClick(event) {
		if (adjusting) {
			adjusting = false;

			// if circle was adjusted,
			// push to the stack
			if (adjusted) push();
			return;
		}

		const circle = {
			cx: event.clientX,
			cy: event.clientY,
			r: 50
		};

		circles = circles.concat(circle);
		selected = circle;

		push();
	}

	function adjust(event) {
		selected.r = +event.target.value;
		circles = circles;
		adjusted = true;
	}

	function select(circle, event) {
		if (!adjusting) {
			event.stopPropagation();
			selected = circle;
		}
	}

	function push() {
		const newUndoStack = undoStack.slice(0, ++i);
		newUndoStack.push(clone(circles));
		undoStack = newUndoStack;
	}

	function travel(d) {
		circles = clone(undoStack[i += d]);
		adjusting = false;
	}

	function clone(circles) {
		return circles.map(({ cx, cy, r }) => ({ cx, cy, r }));
	}
</script>

<div class="controls">
	<button on:click="{() => travel(-1)}" disabled="{i === 0}">undo</button>
	<button on:click="{() => travel(+1)}" disabled="{i === undoStack.length -1}">redo</button>
</div>

<svg on:click={handleClick} >
	{#each circles as circle}
		<circle cx={circle.cx} cy={circle.cy} r={circle.r}
			on:click="{event => select(circle, event)}"
			on:contextmenu|stopPropagation|preventDefault="{() => {
				adjusting = !adjusting;
				if (adjusting) selected = circle;
			}}"
			fill="{circle === selected ? '#ccc': 'white'}"
		/>
	{/each}
</svg>

{#if adjusting}
	<div class="adjuster">
		<p>adjust diameter of circle at {selected.cx}, {selected.cy}</p>
		<input type="range" value={selected.r} on:input={adjust}>
	</div>
{/if}

<style>
	.controls {
		position: absolute;
		width: 100%;
		text-align: center;
	}

	svg {
		background-color: #eee;
		width: 100%;
		height: 100%;
	}

	circle {
		stroke: black;
	}

	.adjuster {
		position: absolute;
		width: 80%;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		padding: 1em;
		text-align: center;
		background-color: rgba(255,255,255,0.7);
		border-radius: 4px;
	}

	input[type='range'] {
		width: 100%;
	}
</style>