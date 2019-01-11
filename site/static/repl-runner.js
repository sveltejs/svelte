


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
        return P.resolve();
    }
}



function handleMessage(ev) {
    if (ev.data.action == "eval") {
        let { script, evalId } = ev.data.args;
        try {
            eval(script);
            parent.postMessage({
                action: "evalOk",
                args: {
                    evalId: evalId
                }
            }, ev.origin);
        } catch (e) {
            parent.postMessage({
                action: "evalError",
                args: {
                    evalId: evalId,
                    stack: e.stack,
                    message: e.message
                }
            }, ev.origin);
        }
    }

    if (ev.data.action == "bind_props") {
        let { props } = ev.data.args
        
        if (!window.component) {
            // TODO can this happen?
            console.error(`no component to bind to`);
            return;
        }

        props.forEach(prop => {
            // TODO should there be a public API for binding?
            // e.g. `component.$watch(prop, handler)`?
            // (answer: probably)
            window.component.$$.bound[prop] = value => {
                parent.postMessage({
                    action: "propUpdate",
                    args: {
                        prop: prop,
                        value: value
                    }
                }, ev.origin);
            };
        });
    }

    if (ev.data.action == "set_prop") {
        if (!window.component) {
            return;
        }
        let { prop, value } = ev.data.args;
        component[prop] = value;
    }

    if (ev.data.action == "fetch_imports") {
        let { bundle, fetchId } = ev.data.args;
        fetchImports(bundle, (remaining) => {
            parent.postMessage({
                action: "fetch_progress",
                args: {
                    fetchId: fetchId,
                    remaining: remaining
                }
            }, ev.origin);
        })
        .then(() => {
            bundle.imports.forEach(x=> {
                const module = importCache[x];
                const name = bundle.importMap.get(x);
                window[name] = module;
            });

            parent.postMessage({
                action: "fetch_complete",
                args: {
                    fetchId: fetchId
                }
            }, ev.origin);
        })
        .catch(e => {
            parent.postMessage({
                action: "fetch_error",
                args: {
                    fetchId: fetchId,
                    message: e.message
                }
            }, ev.origin);
        })
    }
}

window.addEventListener("message", handleMessage, false)

console.log("repl-runner initialized");

