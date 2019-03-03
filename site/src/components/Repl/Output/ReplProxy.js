export default class ReplProxy {
	constructor(iframe, handlers) {
		this.iframe = iframe;
		this.handlers = handlers;

		this.cmdId = 1;
		this.pendingCmds = new Map();

		this.handle_event = e => this.handleReplMessage(e);
		window.addEventListener('message', this.handle_event, false);
	}

	destroy() {
		window.removeEventListener('message', this.handle_event);
	}

	iframeCommand(command, args) {
		return new Promise( (resolve, reject) => {
			this.cmdId += 1;
			this.pendingCmds.set(this.cmdId, { resolve, reject });

			this.iframe.contentWindow.postMessage({
				action: command,
				cmdId: this.cmdId,
				args
			}, '*')
		});
	}

	handleCommandMessage(cmdData) {
		let action = cmdData.action;
		let id = cmdData.cmdId;
		let handler = this.pendingCmds.get(id);

		if (handler) {
			this.pendingCmds.delete(id);
			if (action === 'cmdError') {
				let { message, stack } = cmdData;
				let e = new Error(message);
				e.stack = stack;
				console.log('repl cmd fail');
				handler.reject(e)
			}

			if (action === 'cmdOk') {
				handler.resolve(cmdData.args)
			}
		} else {
			console.error('command not found', id, cmdData, [...this.pendingCmds.keys()]);
		}
	}

	handleReplMessage(event) {
		const { action, args } = event.data;

		if (action === 'cmdError' || action === 'cmdOk') {
			this.handleCommandMessage(event.data);
		}

		if (action === 'prop_update') {
			const { prop, value } = args;
			this.handlers.onPropUpdate(prop, value)
		}

		if (action === 'fetch_progress') {
			this.handlers.onFetchProgress(args.remaining)
		}
	}

	eval(script) {
		return this.iframeCommand('eval', { script });
	}

	setProp(prop, value) {
		return this.iframeCommand('set_prop', {prop, value})
	}

	bindProps(props) {
		return this.iframeCommand('bind_props', { props })
	}

	handleLinks() {
		return this.iframeCommand('catch_clicks', {});
	}

	fetchImports(imports, import_map) {
		return this.iframeCommand('fetch_imports', { imports, import_map })
	}
}