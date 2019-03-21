let uid = 1;

export default class ReplProxy {
	constructor(iframe, handlers) {
		this.iframe = iframe;
		this.handlers = handlers;

		this.pending_cmds = new Map();

		this.handle_event = e => this.handle_repl_message(e);
		window.addEventListener('message', this.handle_event, false);
	}

	destroy() {
		window.removeEventListener('message', this.handle_event);
	}

	iframe_command(action, args) {
		return new Promise((resolve, reject) => {
			const cmd_id = uid++;

			this.pending_cmds.set(cmd_id, { resolve, reject });

			this.iframe.contentWindow.postMessage({ action, cmd_id, args }, '*');
		});
	}

	handle_command_message(cmd_data) {
		let action = cmd_data.action;
		let id = cmd_data.cmd_id;
		let handler = this.pending_cmds.get(id);

		if (handler) {
			this.pending_cmds.delete(id);
			if (action === 'cmd_error') {
				let { message, stack } = cmd_data;
				let e = new Error(message);
				e.stack = stack;
				handler.reject(e)
			}

			if (action === 'cmd_ok') {
				handler.resolve(cmd_data.args)
			}
		} else {
			console.error('command not found', id, cmd_data, [...this.pending_cmds.keys()]);
		}
	}

	handle_repl_message(event) {
		if (event.source !== this.iframe.contentWindow) return;

		const { action, args } = event.data;

		if (action === 'cmd_error' || action === 'cmd_ok') {
			this.handle_command_message(event.data);
		}

		if (action === 'fetch_progress') {
			this.handlers.on_fetch_progress(args.remaining)
		}
	}

	eval(script) {
		return this.iframe_command('eval', { script });
	}

	handle_links() {
		return this.iframe_command('catch_clicks', {});
	}

	fetch_imports(imports, import_map) {
		return this.iframe_command('fetch_imports', { imports, import_map })
	}
}