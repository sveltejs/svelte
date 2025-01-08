## lifecycle_function_unavailable

> `%name%(...)` is not available on the server

Certain methods such as `mount` cannot be invoked while running in a server context. Avoid calling them eagerly, i.e. not during render.
