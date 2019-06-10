
(function() {
	const import_cache = {};

	function fetch_import(id) {
		return new Promise((fulfil, reject) => {
			curl([`https://bundle.run/${id}`]).then(module => {
				import_cache[id] = module;
				fulfil(module);
			}, err => {
				console.error(err.stack);
				reject(new Error(`Error loading ${id} from bundle.run`));
			});
		});
	}

	function fetch_imports(imports, progress_func) {
		const missing_imports = imports.filter(x => !import_cache[x]);
		let pending_imports = missing_imports.length;

		if (missing_imports.length) {
			const promise = Promise.all(
				missing_imports.map(id => fetch_import(id).then(() => {
					pending_imports -= 1;
					if (progress_func) progress_func(pending_imports);
				}))
			);

			return promise;
		} else {
			return Promise.resolve();
		}
	}

	function handle_message(ev) {
		const { action, cmd_id } = ev.data;
		const send_message = (payload) => parent.postMessage( { ...payload }, ev.origin);
		const send_reply = (payload) => send_message({ ...payload, cmd_id });
		const send_ok = () => send_reply({ action: 'cmd_ok' });
		const send_error = (message, stack) => send_reply({ action: 'cmd_error', message, stack });

		if (action === 'eval') {
			try {
				const { script } = ev.data.args;
				eval(script);
				send_ok();
			} catch (e) {
				send_error(e.message, e.stack);
			}
		}

		if (action === 'catch_clicks') {
			try {
				const top_origin = ev.origin;
				document.body.addEventListener('click', event => {
					if (event.which !== 1) return;
					if (event.metaKey || event.ctrlKey || event.shiftKey) return;
					if (event.defaultPrevented) return;

					// ensure target is a link
					let el = event.target;
					while (el && el.nodeName !== 'A') el = el.parentNode;
					if (!el || el.nodeName !== 'A') return;

					if (el.hasAttribute('download') || el.getAttribute('rel') === 'external' || el.target) return;

					event.preventDefault();

					if (el.href.startsWith(top_origin)) {
						const url = new URL(el.href);
						if (url.hash[0] === '#') {
							window.location.hash = url.hash;
							return;
						}
					}

					window.open(el.href, '_blank');
				});
				send_ok();
			} catch (e) {
				send_error(e.message, e.stack);
			}
		}

		if (action === 'fetch_imports') {
			const { imports, import_map } = ev.data.args;
			fetch_imports(imports, (remaining) => {
				send_message({action: 'fetch_progress', args: { remaining }});
			})
				.then(() => {
					imports.forEach(x => {
						const module = import_cache[x];
						const name = import_map.get(x);
						window[name] = module;
					});
					send_ok();
				})
				.catch(e => {
					send_error(e.message, e.stack);
				});
		}
	}

	window.addEventListener('message', handle_message, false);
})();
