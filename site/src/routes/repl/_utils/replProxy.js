export default class ReplProxy {
    constructor(iframe) {
        this.iframe = iframe;
        this.cmdId = 1;
        this.pendingCmds = new Map();
        this.onPropUpdate = null;
        this.onFetchProgress = null;
        this.handle_event = (ev) => this.handleReplMessage(ev);
        window.addEventListener("message", this.handle_event, false);
    }

    destroy() {
        window.removeEventListener("message", this.handle_event);
    }
  
    iframeCommand(command, args) {
        return new Promise( (resolve, reject) => {
            this.cmdId = this.cmdId + 1; 
            this.pendingCmds.set(this.cmdId, { resolve: resolve, reject: reject });
            this.iframe.contentWindow.postMessage({
                action: command,
                cmdId: this.cmdId,
                args: args
            }, '*')
        });
    }

    handleCommandMessage(cmdData) {
        let action = cmdData.action;
        let id = cmdData.cmdId;
        let handler = this.pendingCmds.get(id);
        if (handler) {
           
            this.pendingCmds.delete(id);
            if (action == "cmdError") {
                let { message, stack } = cmdData;
                let e = new Error(message);
                e.stack = stack;
                console.log("repl cmd fail");
                handler.reject(e)
            }

            if (action == "cmdOk") {
                handler.resolve(cmdData.args)
            }
        } else {
            console.error("command not found", id, cmdData, [...this.pendingCmds.keys()]);
        } 
    }

    handleReplMessage(ev) {
        
        let action = ev.data.action;
        if ( action == "cmdError" || action == "cmdOk" ) {
           this.handleCommandMessage(ev.data);
        }

        if (action == "prop_update") {
            let { prop, value } = ev.data.args;
            if (this.onPropUpdate)
                this.onPropUpdate(prop, value)
        }
        
        if (action == "fetch_progress") {
            if (this.onFetchProgress) 
                this.onFetchProgress(ev.data.args.remaining)
        }
    }

    eval(script) {
        return this.iframeCommand("eval", { script: script });
    }

    setProp(prop, value) {
        return this.iframeCommand("set_prop", {prop, value})
    }

    bindProps(props) {
        return this.iframeCommand("bind_props", { props: props })
    }

    handleLinks() {
        return this.iframeCommand("catch_clicks", {});
    }

    fetchImports(bundle) {
       return this.iframeCommand("fetch_imports", { bundle })
    }

}