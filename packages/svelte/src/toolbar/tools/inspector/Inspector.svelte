<script>
	// do not use TS here so that this component works in non-ts projects too
	import { onMount } from 'svelte';

	import options from 'virtual:svelte-inspector-options';
	const toggle_combo = options.toggleKeyCombo?.toLowerCase().split('-');
	const escape_keys = options.escapeKeys?.map((key) => key?.toLowerCase());
	const nav_keys = Object.values(options.navKeys).map((k) => k.toLowerCase());
	let enabled = false;
	let has_opened = false;

	const icon = `data:image/svg+xml;base64,${btoa(
		`
<svg xmlns="http://www.w3.org/2000/svg" width="21" height="25" viewBox="0 0 107 128">
  <title>svelte-inspector-logo</title>
  <path d="M94.1566,22.8189c-10.4-14.8851-30.94-19.2971-45.7914-9.8348L22.2825,29.6078A29.9234,29.9234,0,0,0,8.7639,49.6506a31.5136,31.5136,0,0,0,3.1076,20.2318A30.0061,30.0061,0,0,0,7.3953,81.0653a31.8886,31.8886,0,0,0,5.4473,24.1157c10.4022,14.8865,30.9423,19.2966,45.7914,9.8348L84.7167,98.3921A29.9177,29.9177,0,0,0,98.2353,78.3493,31.5263,31.5263,0,0,0,95.13,58.117a30,30,0,0,0,4.4743-11.1824,31.88,31.88,0,0,0-5.4473-24.1157" style="fill:#ff3e00"/><path d="M45.8171,106.5815A20.7182,20.7182,0,0,1,23.58,98.3389a19.1739,19.1739,0,0,1-3.2766-14.5025,18.1886,18.1886,0,0,1,.6233-2.4357l.4912-1.4978,1.3363.9815a33.6443,33.6443,0,0,0,10.203,5.0978l.9694.2941-.0893.9675a5.8474,5.8474,0,0,0,1.052,3.8781,6.2389,6.2389,0,0,0,6.6952,2.485,5.7449,5.7449,0,0,0,1.6021-.7041L69.27,76.281a5.4306,5.4306,0,0,0,2.4506-3.631,5.7948,5.7948,0,0,0-.9875-4.3712,6.2436,6.2436,0,0,0-6.6978-2.4864,5.7427,5.7427,0,0,0-1.6.7036l-9.9532,6.3449a19.0329,19.0329,0,0,1-5.2965,2.3259,20.7181,20.7181,0,0,1-22.2368-8.2427,19.1725,19.1725,0,0,1-3.2766-14.5024,17.9885,17.9885,0,0,1,8.13-12.0513L55.8833,23.7472a19.0038,19.0038,0,0,1,5.3-2.3287A20.7182,20.7182,0,0,1,83.42,29.6611a19.1739,19.1739,0,0,1,3.2766,14.5025,18.4,18.4,0,0,1-.6233,2.4357l-.4912,1.4978-1.3356-.98a33.6175,33.6175,0,0,0-10.2037-5.1l-.9694-.2942.0893-.9675a5.8588,5.8588,0,0,0-1.052-3.878,6.2389,6.2389,0,0,0-6.6952-2.485,5.7449,5.7449,0,0,0-1.6021.7041L37.73,51.719a5.4218,5.4218,0,0,0-2.4487,3.63,5.7862,5.7862,0,0,0,.9856,4.3717,6.2437,6.2437,0,0,0,6.6978,2.4864,5.7652,5.7652,0,0,0,1.602-.7041l9.9519-6.3425a18.978,18.978,0,0,1,5.2959-2.3278,20.7181,20.7181,0,0,1,22.2368,8.2427,19.1725,19.1725,0,0,1,3.2766,14.5024,17.9977,17.9977,0,0,1-8.13,12.0532L51.1167,104.2528a19.0038,19.0038,0,0,1-5.3,2.3287" style="fill:#fff"/>
  <polygon points="0,0 15,40 40,20" stroke="#ff3e00" fill="#ff3e00"></polygon>
</svg>
`
			.replace(/[\n\r\t\s]+/g, ' ')
			.trim()
	)}`;

	// location of code in file
	let file_loc;
	// cursor pos and width for file_loc overlay positioning
	let x, y, w;

	let active_el;

	let hold_start_ts;

	$: show_toggle =
		options.showToggleButton === 'always' || (options.showToggleButton === 'active' && enabled);

	function mousemove(event) {
		x = event.x;
		y = event.y;
	}

	function find_selectable_parent(el, include_self = false) {
		if (!include_self) {
			el = el.parentNode;
		}
		while (el) {
			if (is_selectable(el)) {
				return el;
			}
			el = el.parentNode;
		}
	}

	function find_selectable_child(el) {
		return [...el.querySelectorAll('*')].find(is_selectable);
	}

	function find_selectable_sibling(el, prev = false) {
		do {
			el = prev ? el.previousElementSibling : el.nextElementSibling;
			if (is_selectable(el)) {
				return el;
			}
		} while (el);
	}

	function find_selectable_for_nav(key) {
		const el = active_el;
		if (!el) {
			return find_selectable_child(document?.body);
		}
		switch (key) {
			case options.navKeys.parent:
				return find_selectable_parent(el);
			case options.navKeys.child:
				return find_selectable_child(el);
			case options.navKeys.next:
				return find_selectable_sibling(el) || find_selectable_parent(el);
			case options.navKeys.prev:
				return find_selectable_sibling(el, true) || find_selectable_parent(el);
			default:
				return;
		}
	}

	function is_selectable(el) {
		const file = el?.__svelte_meta?.loc?.file;
		if (!file || file.includes('node_modules/')) {
			return false; // no file or 3rd party
		}
		const id = el.getAttribute('id');
		if (id === 'svelte-announcer' || id?.startsWith('svelte-inspector-')) {
			return false; // ignore some elements by id that would be selectable from keyboard nav otherwise
		}
		return true;
	}

	function mouseover({ target }) {
		const el = find_selectable_parent(target, true);
		activate(el, false);
	}

	function activate(el, set_bubble_pos = true) {
		if (options.customStyles && el !== active_el) {
			if (active_el) {
				active_el.classList.remove('svelte-inspector-active-target');
			}
			if (el) {
				el.classList.add('svelte-inspector-active-target');
			}
		}
		if (el) {
			const { file, line, column } = el.__svelte_meta.loc;
			file_loc = `${file}:${line + 1}:${column + 1}`;
		} else {
			file_loc = null;
		}
		active_el = el;
		if (set_bubble_pos) {
			const pos = el.getBoundingClientRect();
			x = Math.ceil(pos.left);
			y = Math.ceil(pos.bottom - 20);
		}
	}

	function open_editor(event) {
		if (file_loc) {
			stop(event);
			fetch(`${options.__internal.base}/__open-in-editor?file=${encodeURIComponent(file_loc)}`);
			has_opened = true;
			if (options.holdMode && is_holding()) {
				disable();
			}
		}
	}

	function is_key_active(key, event) {
		switch (key) {
			case 'shift':
			case 'control':
			case 'alt':
			case 'meta':
				return event.getModifierState(key.charAt(0).toUpperCase() + key.slice(1));
			default:
				return key === event.key.toLowerCase();
		}
	}

	function is_combo(event) {
		return is_toggle(event) && toggle_combo?.every((key) => is_key_active(key, event));
	}

	function is_escape(event) {
		return escape_keys?.includes(event.key.toLowerCase());
	}

	function is_toggle(event) {
		return toggle_combo?.includes(event.key.toLowerCase());
	}

	function is_nav(event) {
		return nav_keys?.some((key) => is_key_active(key, event));
	}

	function is_open(event) {
		return options.openKey && options.openKey.toLowerCase() === event.key.toLowerCase();
	}

	function is_holding() {
		return hold_start_ts && Date.now() - hold_start_ts > 250;
	}

	function stop(event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	function keydown(event) {
		if (event.repeat || event.key == null || (!enabled && !is_toggle(event))) {
			return;
		}
		if (is_combo(event)) {
			toggle();
			if (options.holdMode && enabled) {
				hold_start_ts = Date.now();
			}
		} else if (enabled) {
			if (is_nav(event)) {
				const el = find_selectable_for_nav(event.key);
				if (el) {
					activate(el);
					stop(event);
				}
			} else if (is_open(event)) {
				open_editor(event);
			} else if (is_holding() || is_escape(event)) {
				// is_holding() checks for unhandled additional key pressed
				// while holding the toggle keys, which is possibly another
				// shortcut (e.g. 'meta-shift-x'), so disable again.

				disable();
			}
		}
	}

	function keyup(event) {
		if (event.repeat || event.key == null || !enabled) {
			return;
		}
		if (is_toggle(event)) {
			if (is_holding()) {
				disable();
			} else {
				hold_start_ts = null;
			}
		}
	}

	function toggle() {
		if (enabled) {
			disable();
		} else {
			enable();
		}
	}

	function listeners(body, enabled) {
		const l = enabled ? body.addEventListener : body.removeEventListener;
		l('mousemove', mousemove);
		l('mouseover', mouseover);
		l('click', open_editor, true);
	}

	function enable() {
		enabled = true;
		const b = document.body;
		if (options.customStyles) {
			b.classList.add('svelte-inspector-enabled');
		}
		listeners(b, enabled);
		activate_initial_el();
	}

	function activate_initial_el() {
		const hov = innermost_hover_el();
		let el = find_selectable_parent(hov, true);
		if (!el) {
			const act = document.activeElement;
			el = find_selectable_parent(act, true);
		}
		if (!el) {
			el = find_selectable_child(document.body);
		}
		if (el) {
			activate(el);
		}
	}

	function innermost_hover_el() {
		let e = document.body.querySelector(':hover');
		let result;
		while (e) {
			result = e;
			e = e.querySelector(':hover');
		}
		return result;
	}

	function disable() {
		enabled = false;
		has_opened = false;
		hold_start_ts = null;
		const b = document.body;
		listeners(b, enabled);
		if (options.customStyles) {
			b.classList.remove('svelte-inspector-enabled');
			active_el?.classList.remove('svelte-inspector-active-target');
		}
		active_el = null;
	}

	function visibilityChange() {
		if (document.visibilityState === 'hidden') {
			onLeave();
		}
	}

	function onLeave() {
		// disable if a file has been opened or combo is held
		if (enabled && (has_opened || hold_start_ts)) {
			disable();
		}
	}

	onMount(() => {
		const s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		s.setAttribute('id', 'svelte-inspector-style');
		s.textContent = `:root { --svelte-inspector-icon: url(${icon})};`;
		document.head.append(s);
		if (toggle_combo) {
			document.body.addEventListener('keydown', keydown);
			if (options.holdMode) {
				document.body.addEventListener('keyup', keyup);
			}
		}
		document.addEventListener('visibilitychange', visibilityChange);
		document.documentElement.addEventListener('mouseleave', onLeave);
		return () => {
			// make sure we get rid of everything
			disable();
			const s = document.head.querySelector('#svelte-inspector-style');
			if (s) {
				document.head.removeChild(s);
			}
			if (toggle_combo) {
				document.body.removeEventListener('keydown', keydown);
				if (options.holdMode) {
					document.body.removeEventListener('keyup', keyup);
				}
			}
			document.removeEventListener('visibilitychange', visibilityChange);
			document.documentElement.removeEventListener('mouseleave', onLeave);
		};
	});
</script>

{#if show_toggle}
	<button
		id="svelte-inspector-toggle"
		class:enabled
		style={`background-image: var(--svelte-inspector-icon);${options.toggleButtonPos
			.split('-')
			.map((p) => `${p}: 8px;`)
			.join('')}`}
		onclick={() => toggle()}
		aria-label={`${enabled ? 'disable' : 'enable'} svelte-inspector`}
	></button>
{/if}
{#if enabled && active_el && file_loc}
	{@const loc = active_el.__svelte_meta.loc}
	<div
		id="svelte-inspector-overlay"
		style:left="{Math.min(x + 3, document.documentElement.clientWidth - w - 10)}px"
		style:top="{document.documentElement.clientHeight < y + 50 ? y - 30 : y + 30}px"
		bind:offsetWidth={w}
	>
		&lt;{active_el.tagName.toLowerCase()}&gt;&nbsp;{file_loc}
	</div>
	<div id="svelte-inspector-announcer" aria-live="assertive" aria-atomic="true">
		{active_el.tagName.toLowerCase()} in file {loc.file} on line {loc.line} column {loc.column}
	</div>
{/if}

<style>
	:global(body.svelte-inspector-enabled *) {
		cursor: var(--svelte-inspector-icon), crosshair !important;
	}
	:global(.svelte-inspector-active-target) {
		outline: 2px dashed #ff3e00 !important;
	}

	#svelte-inspector-overlay {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.8);
		color: #fff;
		padding: 2px 4px;
		border-radius: 5px;
		z-index: 999999;
		pointer-events: none;
	}

	#svelte-inspector-toggle {
		all: unset;
		border: 1px solid #ff3e00;
		border-radius: 8px;
		position: fixed;
		height: 32px;
		width: 32px;
		background-color: white;
		background-position: center;
		background-repeat: no-repeat;
		cursor: pointer;
	}

	#svelte-inspector-announcer {
		position: absolute;
		left: 0px;
		top: 0px;
		clip: rect(0px, 0px, 0px, 0px);
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
		width: 1px;
		height: 1px;
	}

	#svelte-inspector-toggle:not(.enabled) {
		filter: grayscale(1);
	}
	#svelte-inspector-toggle:hover {
		background-color: #facece;
	}
</style>
