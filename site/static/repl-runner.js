
(function (){
const importCache = {};

function fetchImport(id) {
    return new Promise((fulfil, reject) => {
        curl([`https://bundle.run/${id}`]).then(module => {
            importCache[id] = module;
            fulfil(module);
        }, err => {
            console.error(err.stack);
            reject(new Error(`Error loading ${id} from bundle.run`));
        });
    });
}

function fetchImports(bundle, progressFunc) {
    const missingImports = bundle.imports.filter(x => !importCache[x]);
    let pendingImports = missingImports.length;

    if (missingImports.length) {
        let promise = Promise.all(
            missingImports.map(id => fetchImport(id).then(() => {
                pendingImports -= 1;
                if (progressFunc) progressFunc(pendingImports);
            }))
        );

        return promise
    } else {
        return Promise.resolve();
    }
}

function handleMessage(ev) {
    let { action, cmdId } = ev.data;
    const sendMessage = (payload) => parent.postMessage( { ...payload }, ev.origin);
    const sendReply = (payload) => sendMessage({ ...payload, cmdId })
    const sendOk = () => sendReply({ action: "cmdOk" });
    const sendError = (message, stack) => sendReply({ action: "cmdError", message, stack })
    
    
    if (action == "eval") {
        let { script } = ev.data.args;
        try {
            eval(script);
            sendOk();
        } catch (e) {
            sendError(e.message, e.stack);
        }
    }

    if (action == "bind_props") {
        let { props } = ev.data.args
        
        if (!window.component) {
            // TODO can this happen?
            console.warn('no component to bind to');
            sendOk();
            return;
        }

        try {
            props.forEach(prop => {
                // TODO should there be a public API for binding?
                // e.g. `component.$watch(prop, handler)`?
                // (answer: probably)
                window.component.$$.bound[prop] = value => {
                    sendMessage({ action:"prop_update", args: { prop, value } })
                };
            });
            sendOk();
        } catch (e) {
            
            sendError(e.message, e.stack);
        }
    }

    if (action == "set_prop") {
        try {
            if (!window.component) {
                return;
            }
            let { prop, value } = ev.data.args;
            component[prop] = value;
            sendOk();
        } catch (e) {
            sendError(e.message, e.stack);
        }
    }
    
    if (action == "catch_clicks") {
        try {
            let topOrigin = ev.origin;
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
            
                if (el.href.startsWith(topOrigin)) {
                    const url = new URL(el.href);
                    if (url.hash[0] === '#') {
                        window.location.hash = url.hash;
                        return;
                    }
                }
            
                window.open(el.href, '_blank');
            });
            sendOk();
        } catch(e) {
            sendError(e.message, e.stack);
        }
    }


    if (action == "fetch_imports") {
        let { bundle } = ev.data.args;
        fetchImports(bundle, (remaining) => {
            sendMessage({action: "fetch_progress", args: { remaining }});
        })
        .then(() => {
            bundle.imports.forEach(x=> {
                const module = importCache[x];
                const name = bundle.importMap.get(x);
                window[name] = module;
            });
            sendOk();
        })
        .catch(e => {
           sendError(e.message, e.stack);
        })
    }
}

window.addEventListener("message", handleMessage, false)

console.log("repl-runner initialized");

})();
