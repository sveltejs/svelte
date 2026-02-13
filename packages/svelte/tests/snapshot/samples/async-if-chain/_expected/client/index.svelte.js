import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Async_if_chain($$anchor) {
	function complex1() {
		return 1;
	}

	let foo = true;
	var blocking;
	var $$promises = $.run([async () => blocking = await $.async_derived(() => foo)]);
	var fragment = root();
	var node = $.first_child(fragment);

	$.async(node, [$$promises[0]], void 0, (node) => {
		var consequent = ($$anchor) => {
			var text = $.text('foo');

			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('bar');

			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text('else');

			$.append($$anchor, text_2);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent); else if (bar) $$render(consequent_1, 1); else $$render(alternate, false);
		});
	});

	var node_1 = $.sibling(node, 2);

	$.async(node_1, [$$promises[0]], [() => foo], (node_1, $$condition) => {
		var consequent_2 = ($$anchor) => {
			var text_3 = $.text('foo');

			$.append($$anchor, text_3);
		};

		var consequent_3 = ($$anchor) => {
			var text_4 = $.text('bar');

			$.append($$anchor, text_4);
		};

		var alternate_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.async(node_2, [], [() => baz], (node_2, $$condition) => {
				var consequent_4 = ($$anchor) => {
					var text_5 = $.text('baz');

					$.append($$anchor, text_5);
				};

				var alternate_1 = ($$anchor) => {
					var text_6 = $.text('else');

					$.append($$anchor, text_6);
				};

				$.if(
					node_2,
					($$render) => {
						if ($.get($$condition)) $$render(consequent_4); else $$render(alternate_1, false);
					},
					true
				);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get($$condition)) $$render(consequent_2); else if (bar) $$render(consequent_3, 1); else $$render(alternate_2, false);
		});
	});

	var node_3 = $.sibling(node_1, 2);

	$.async(node_3, [$$promises[0]], [async () => (await $.save(foo))() > 10], (node_3, $$condition) => {
		var consequent_5 = ($$anchor) => {
			var text_7 = $.text('foo');

			$.append($$anchor, text_7);
		};

		var consequent_6 = ($$anchor) => {
			var text_8 = $.text('bar');

			$.append($$anchor, text_8);
		};

		var alternate_4 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.async(node_4, [$$promises[0]], [async () => (await $.save(foo))() > 5], (node_4, $$condition) => {
				var consequent_7 = ($$anchor) => {
					var text_9 = $.text('baz');

					$.append($$anchor, text_9);
				};

				var alternate_3 = ($$anchor) => {
					var text_10 = $.text('else');

					$.append($$anchor, text_10);
				};

				$.if(
					node_4,
					($$render) => {
						if ($.get($$condition)) $$render(consequent_7); else $$render(alternate_3, false);
					},
					true
				);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if ($.get($$condition)) $$render(consequent_5); else if (bar) $$render(consequent_6, 1); else $$render(alternate_4, false);
		});
	});

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_8 = ($$anchor) => {
			var text_11 = $.text('foo');

			$.append($$anchor, text_11);
		};

		var consequent_9 = ($$anchor) => {
			var text_12 = $.text('bar');

			$.append($$anchor, text_12);
		};

		var consequent_10 = ($$anchor) => {
			var text_13 = $.text('baz');

			$.append($$anchor, text_13);
		};

		var d = $.derived(() => complex1() * complex2 > 100);

		var alternate_5 = ($$anchor) => {
			var text_14 = $.text('else');

			$.append($$anchor, text_14);
		};

		$.if(node_5, ($$render) => {
			if (simple1) $$render(consequent_8); else if (simple2 > 10) $$render(consequent_9, 1); else if ($.get(d)) $$render(consequent_10, 2); else $$render(alternate_5, false);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	$.async(node_6, [$$promises[0]], void 0, (node_6) => {
		var consequent_11 = ($$anchor) => {
			var text_15 = $.text('foo');

			$.append($$anchor, text_15);
		};

		var consequent_12 = ($$anchor) => {
			var text_16 = $.text('bar');

			$.append($$anchor, text_16);
		};

		var alternate_6 = ($$anchor) => {
			var text_17 = $.text('else');

			$.append($$anchor, text_17);
		};

		$.if(node_6, ($$render) => {
			if ($.get(blocking) > 10) $$render(consequent_11); else if ($.get(blocking) > 5) $$render(consequent_12, 1); else $$render(alternate_6, false);
		});
	});

	$.append($$anchor, fragment);
}