
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintInOut(t) {
        if ((t *= 2) < 1)
            return 0.5 * t * t * t * t * t;
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    /* src/Sections/Footer.svelte generated by Svelte v3.46.4 */

    const file$f = "src/Sections/Footer.svelte";

    function create_fragment$f(ctx) {
    	let footer;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "Questions?";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Feedback";
    			attr_dev(div0, "class", "left svelte-1d5m1kc");
    			add_location(div0, file$f, 1, 2, 11);
    			attr_dev(div1, "class", "right svelte-1d5m1kc");
    			add_location(div1, file$f, 3, 2, 49);
    			attr_dev(footer, "class", "svelte-1d5m1kc");
    			add_location(footer, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(footer, t1);
    			append_dev(footer, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/Sections/Place.svelte generated by Svelte v3.46.4 */
    const file$e = "src/Sections/Place.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (30:6) {#each updateData as update (update.id)}
    function create_each_block$7(key_1, ctx) {
    	let div4;
    	let div0;
    	let t0_value = /*update*/ ctx[1].text + "";
    	let t0;
    	let t1;
    	let div3;
    	let div1;
    	let t2_value = /*update*/ ctx[1].author + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*update*/ ctx[1].category + "";
    	let t4;
    	let t5;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(div0, "class", "updateText svelte-qmj9uv");
    			add_location(div0, file$e, 31, 10, 958);
    			attr_dev(div1, "class", "updateAuthor svelte-qmj9uv");
    			add_location(div1, file$e, 35, 12, 1076);
    			attr_dev(div2, "class", "updateCategory svelte-qmj9uv");
    			add_location(div2, file$e, 38, 12, 1164);
    			attr_dev(div3, "class", "updateDetails svelte-qmj9uv");
    			add_location(div3, file$e, 34, 10, 1036);
    			attr_dev(div4, "class", "updateWrapper svelte-qmj9uv");
    			add_location(div4, file$e, 30, 8, 920);
    			this.first = div4;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(30:6) {#each updateData as update (update.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_intro;
    	let each_value = /*updateData*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*update*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Updates";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-qmj9uv");
    			add_location(h3, file$e, 27, 4, 822);
    			attr_dev(div0, "class", "updates svelte-qmj9uv");
    			add_location(div0, file$e, 28, 4, 843);
    			attr_dev(div1, "class", "updatesWrapper svelte-qmj9uv");
    			add_location(div1, file$e, 26, 2, 755);
    			attr_dev(div2, "class", "updatesContainer svelte-qmj9uv");
    			add_location(div2, file$e, 25, 0, 722);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*updateData*/ 1) {
    				each_value = /*updateData*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$7, null, get_each_context$7);
    			}
    		},
    		i: function intro(local) {
    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, slide, { easing: quintInOut });
    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Place', slots, []);

    	let updateData = [
    		{
    			id: 1,
    			text: "This is some sample update content Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    			author: "Chami Perera",
    			category: "Announcement"
    		},
    		{
    			id: 2,
    			text: "Sed non iaculis lacus, vitae faucibus turpis. Cras sed urna laoreet, egestas sem laoreet, egestas sem.",
    			author: "Jim Reuter",
    			category: "Update"
    		},
    		{
    			id: 3,
    			text: "This is some sample update content Sed non iaculis lacus, vitae faucibus turpis laoreet.",
    			author: "Chami Perera",
    			category: "Action"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Place> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, slide, quintInOut, updateData });

    	$$self.$inject_state = $$props => {
    		if ('updateData' in $$props) $$invalidate(0, updateData = $$props.updateData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [updateData];
    }

    class Place extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Place",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/Sections/Updates.svelte generated by Svelte v3.46.4 */
    const file$d = "src/Sections/Updates.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (30:6) {#each updateData as update (update.id)}
    function create_each_block$6(key_1, ctx) {
    	let div4;
    	let div0;
    	let t0_value = /*update*/ ctx[1].text + "";
    	let t0;
    	let t1;
    	let div3;
    	let div1;
    	let t2_value = /*update*/ ctx[1].author + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*update*/ ctx[1].category + "";
    	let t4;
    	let t5;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(div0, "class", "updateText svelte-1mhxaml");
    			add_location(div0, file$d, 31, 10, 958);
    			attr_dev(div1, "class", "updateAuthor svelte-1mhxaml");
    			add_location(div1, file$d, 35, 12, 1076);
    			attr_dev(div2, "class", "updateCategory svelte-1mhxaml");
    			toggle_class(div2, "action", /*update*/ ctx[1].category === "Action");
    			toggle_class(div2, "update", /*update*/ ctx[1].category === "Update");
    			toggle_class(div2, "announcement", /*update*/ ctx[1].category === "Announcement");
    			add_location(div2, file$d, 38, 12, 1164);
    			attr_dev(div3, "class", "updateDetails svelte-1mhxaml");
    			add_location(div3, file$d, 34, 10, 1036);
    			attr_dev(div4, "class", "updateWrapper svelte-1mhxaml");
    			add_location(div4, file$d, 30, 8, 920);
    			this.first = div4;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div4, t5);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(30:6) {#each updateData as update (update.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_intro;
    	let each_value = /*updateData*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*update*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Updates";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-1mhxaml");
    			add_location(h3, file$d, 27, 4, 822);
    			attr_dev(div0, "class", "updates svelte-1mhxaml");
    			add_location(div0, file$d, 28, 4, 843);
    			attr_dev(div1, "class", "updatesWrapper svelte-1mhxaml");
    			add_location(div1, file$d, 26, 2, 755);
    			attr_dev(div2, "class", "updatesContainer svelte-1mhxaml");
    			add_location(div2, file$d, 25, 0, 722);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*updateData*/ 1) {
    				each_value = /*updateData*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$6, null, get_each_context$6);
    			}
    		},
    		i: function intro(local) {
    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, slide, { easing: quintInOut });
    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Updates', slots, []);

    	let updateData = [
    		{
    			id: 1,
    			text: "This is some sample update content Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    			author: "Chami Perera",
    			category: "Announcement"
    		},
    		{
    			id: 2,
    			text: "Sed non iaculis lacus, vitae faucibus turpis. Cras sed urna laoreet, egestas sem laoreet, egestas sem.",
    			author: "Jim Reuter",
    			category: "Update"
    		},
    		{
    			id: 3,
    			text: "This is some sample update content Sed non iaculis lacus, vitae faucibus turpis laoreet.",
    			author: "Chami Perera",
    			category: "Action"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Updates> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, slide, quintInOut, updateData });

    	$$self.$inject_state = $$props => {
    		if ('updateData' in $$props) $$invalidate(0, updateData = $$props.updateData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [updateData];
    }

    class Updates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Updates",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Sections/Resources.svelte generated by Svelte v3.46.4 */
    const file$c = "src/Sections/Resources.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (131:10) {#each resourceSection.contents as resource}
    function create_each_block_1$4(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let p;
    	let t1_value = /*resource*/ ctx[5].title + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "resourceThumbnailImg svelte-66stk0");
    			add_location(div0, file$c, 132, 45, 3170);
    			attr_dev(div1, "class", "resourceThumbnail svelte-66stk0");
    			add_location(div1, file$c, 132, 14, 3139);
    			add_location(p, file$c, 135, 16, 3272);
    			attr_dev(div2, "class", "resourceTitle svelte-66stk0");
    			add_location(div2, file$c, 134, 14, 3228);
    			attr_dev(div3, "class", "resourceWrapper svelte-66stk0");
    			add_location(div3, file$c, 131, 12, 3095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t1);
    			append_dev(div3, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(131:10) {#each resourceSection.contents as resource}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#each resourcesData.resources as resourceSection (resourceSection.id)}
    function create_each_block$5(key_1, ctx) {
    	let div3;
    	let div1;
    	let h2;
    	let t0_value = /*resourceSection*/ ctx[2].title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div2;
    	let t3;
    	let each_value_1 = /*resourceSection*/ ctx[2].contents;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			attr_dev(h2, "class", "svelte-66stk0");
    			add_location(h2, file$c, 126, 10, 2894);
    			attr_dev(div0, "class", "resourceSectionImage");
    			add_location(div0, file$c, 127, 10, 2937);
    			attr_dev(div1, "class", "resourceSectionTitleWrapper svelte-66stk0");
    			set_style(div1, "background-color", "var(" + /*greens*/ ctx[1][/*resourceSection*/ ctx[2].id - 1] + ")");
    			add_location(div1, file$c, 125, 8, 2778);
    			attr_dev(div2, "class", "resourcesWrapper svelte-66stk0");
    			add_location(div2, file$c, 129, 8, 2997);
    			attr_dev(div3, "class", "resourceSection svelte-66stk0");
    			add_location(div3, file$c, 124, 6, 2740);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div3, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*resourcesData*/ 1) {
    				each_value_1 = /*resourceSection*/ ctx[2].contents;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(124:4) {#each resourcesData.resources as resourceSection (resourceSection.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_intro;
    	let each_value = /*resourcesData*/ ctx[0].resources;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*resourceSection*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*resourcesData*/ ctx[0].title}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-66stk0");
    			add_location(h1, file$c, 121, 2, 2596);
    			attr_dev(div0, "class", "contentWrapper svelte-66stk0");
    			add_location(div0, file$c, 122, 2, 2629);
    			attr_dev(div1, "class", "container svelte-66stk0");
    			add_location(div1, file$c, 120, 0, 2550);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resourcesData, greens*/ 3) {
    				each_value = /*resourcesData*/ ctx[0].resources;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$5, null, get_each_context$5);
    			}
    		},
    		i: function intro(local) {
    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { y: -20 });
    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Resources', slots, []);

    	const resourcesData = {
    		title: "Resources",
    		resources: [
    			{
    				id: 1,
    				title: "Starting out on the right foot",
    				image: "",
    				contents: [
    					{
    						id: 1,
    						title: "Client management guide",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 2,
    						title: "“We heard you” email",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 3,
    						title: "Bring a point of view",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 4,
    						title: "Do your research",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 5,
    						title: "Competitive intel",
    						url: "",
    						thumbnail: ""
    					}
    				]
    			},
    			{
    				id: 2,
    				title: "Keeping the pace",
    				contents: [
    					{
    						id: 1,
    						title: "Submit proposal",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 2,
    						title: "Theme framework",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 3,
    						title: "Interactive preliminary risk assessment",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 4,
    						title: "Orals placemat templates",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 5,
    						title: "Fifth resource",
    						url: "",
    						thumbnail: ""
    					}
    				]
    			},
    			{
    				id: 3,
    				title: "Moving the finish line",
    				contents: [
    					{
    						id: 1,
    						title: "Follow up email template",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 2,
    						title: "Keep in touch guide",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 3,
    						title: "Win/loss debrief",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 4,
    						title: "Win the loss",
    						url: "",
    						thumbnail: ""
    					},
    					{
    						id: 5,
    						title: "Fifth resource",
    						url: "",
    						thumbnail: ""
    					}
    				]
    			}
    		]
    	};

    	let greens = ["--green1", "--green2", "--green3"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Resources> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide, fly, resourcesData, greens });

    	$$self.$inject_state = $$props => {
    		if ('greens' in $$props) $$invalidate(1, greens = $$props.greens);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resourcesData, greens];
    }

    class Resources extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resources",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/Sections/About.svelte generated by Svelte v3.46.4 */
    const file$b = "src/Sections/About.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (55:6) {#each aboutData.content as content (content.id)}
    function create_each_block$4(key_1, ctx) {
    	let div5;
    	let div2;
    	let div0;
    	let t0_value = /*content*/ ctx[4].do + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*content*/ ctx[4].icon + "";
    	let t2;
    	let t3;
    	let div4;
    	let div3;
    	let t4_value = /*content*/ ctx[4].value + "";
    	let t4;
    	let t5;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(div0, "class", "do svelte-1sil476");
    			add_location(div0, file$b, 58, 12, 1569);
    			attr_dev(div1, "class", "icon svelte-1sil476");
    			add_location(div1, file$b, 59, 12, 1616);
    			attr_dev(div2, "class", "dosWrapperTop svelte-1sil476");
    			add_location(div2, file$b, 57, 10, 1529);
    			attr_dev(div3, "class", "value svelte-1sil476");
    			add_location(div3, file$b, 65, 12, 1881);
    			attr_dev(div4, "class", "valueWrapper svelte-1sil476");
    			add_location(div4, file$b, 63, 10, 1792);
    			attr_dev(div5, "class", "dosWrapper svelte-1sil476");
    			add_location(div5, file$b, 56, 8, 1494);
    			this.first = div5;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, t4);
    			insert_dev(target, t5, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(55:6) {#each aboutData.content as content (content.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div2_intro;
    	let each_value = /*aboutData*/ ctx[0].content;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*content*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*aboutData*/ ctx[0].subtitle1}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1sil476");
    			add_location(h1, file$b, 52, 4, 1332);
    			attr_dev(div0, "class", "dosContainer svelte-1sil476");
    			add_location(div0, file$b, 53, 4, 1367);
    			attr_dev(div1, "class", "content svelte-1sil476");
    			add_location(div1, file$b, 51, 2, 1306);
    			attr_dev(div2, "class", "container svelte-1sil476");
    			add_location(div2, file$b, 50, 0, 1260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*aboutData*/ 1) {
    				each_value = /*aboutData*/ ctx[0].content;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$4, null, get_each_context$4);
    			}
    		},
    		i: function intro(local) {
    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, fly, { x: -20 });
    					div2_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);

    	const aboutData = {
    		title: "What we do",
    		subtitle1: "What we do",
    		subtitle2: "Value to you",
    		content: [
    			{
    				id: 1,
    				do: "High volume and efficient proposal creation",
    				value: "Time spent on client-based differentiating win themes, not document creation",
    				icon: "♜"
    			},
    			{
    				id: 2,
    				do: "First draft support for quick turns",
    				value: "Focus on client relationship building and responding to client needs",
    				icon: "⚙"
    			},
    			{
    				id: 3,
    				do: "Light touch support on orals deliverables",
    				value: "Best-in-class, leader-approved messaging in client-ready documents",
    				icon: "✿"
    			},
    			{
    				id: 4,
    				do: "Regular template updates and content refreshes",
    				value: "Confidence in working with the latest and best content  extend this sentence",
    				icon: "✇"
    			}
    		]
    	};

    	let colors = ["--blue1", "--blue2", "--blue3", "--blue4"];
    	let showWhatWeDo;
    	let showValues;

    	setTimeout(
    		() => {
    			showWhatWeDo = true;
    		},
    		0
    	);

    	setTimeout(
    		() => {
    			showValues = true;
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		slide,
    		fly,
    		quintInOut,
    		aboutData,
    		colors,
    		showWhatWeDo,
    		showValues
    	});

    	$$self.$inject_state = $$props => {
    		if ('colors' in $$props) colors = $$props.colors;
    		if ('showWhatWeDo' in $$props) showWhatWeDo = $$props.showWhatWeDo;
    		if ('showValues' in $$props) showValues = $$props.showValues;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [aboutData];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Elements/HeroImage.svelte generated by Svelte v3.46.4 */
    const file$a = "src/Elements/HeroImage.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".cls-1 {\n        fill: #02c0ba;\n      }\n      .cls-2 {\n        fill: #a7db25;\n      }\n      .cls-3 {\n        fill: #115935;\n      }\n    ");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			add_location(style, file$a, 6, 5, 146);
    			add_location(defs, file$a, 5, 3, 135);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M.36 50.32A56.82 56.82 0 0 1 27.06 8.4c0-.15 4.42-2.46 4.88-2.68-10.79 22.45-15.11 37.83-16.17 52a57.17 57.17 0 0 0 .09 10.59c-6.01-3.82-11.17-7-15.5-17.99Z");
    			add_location(path0, file$a, 19, 7, 396);
    			attr_dev(path1, "class", "cls-2");
    			attr_dev(path1, "d", "M28.31 105.94A56.78 56.78 0 0 1 0 57.07a62 62 0 0 0 15.26 19.08 21 21 0 0 1 5.79 7.91c2.45 5.67 6.19 15.06 7.26 21.88Z");
    			add_location(path1, file$a, 22, 8, 601);
    			attr_dev(path2, "class", "cls-3");
    			attr_dev(path2, "d", "M32.44 21.82c5.62 27.58 18.2 62.89 12.4 89.18-.1.43-.19.86-.29 1.29a57.94 57.94 0 0 1-7.1-2.06c-2.38-8-6.32-16.63-10.61-26.53-3.13-7.24-3.78-16-3-25.23.24-2.84.63-5.72 1.12-8.6a179.26 179.26 0 0 1 7.47-28Z");
    			add_location(path2, file$a, 25, 8, 768);
    			attr_dev(path3, "d", "M62.81 113.28a59.75 59.75 0 0 1-6 .31q-2.32 0-4.62-.18a58.71 58.71 0 0 0 1.4-8.48c1.77-25.55-11.08-63-19.4-88 1.2-3.27 2.36-6.27 3.4-8.89.62-1.56 1.4-3.43 2.29-5.49A57.07 57.07 0 0 1 76 3.34c1.8 20.67-2.41 36.74-9 58.1-5.67 18.71-8.14 34.06-4.19 51.84Z");
    			attr_dev(path3, "fill", "#1aa355");
    			add_location(path3, file$a, 28, 8, 1022);
    			attr_dev(path4, "class", "cls-2");
    			attr_dev(path4, "d", "M78.76 43.91q.76-3.67 1.31-7.29a125 125 0 0 0 .3-31.51 57 57 0 0 1 16.4 11.34c-.31.91-.65 1.78-1 2.62-4.27 9.85-8 13.64-14.74 21.86-.78 1-1.54 2-2.26 3Z");
    			add_location(path4, file$a, 31, 8, 1324);
    			attr_dev(path5, "class", "cls-1");
    			attr_dev(path5, "d", "M89.53 103.21A56.44 56.44 0 0 1 69 112.28 80.24 80.24 0 0 1 67.89 94c.59-8.93 2.86-18.37 5.35-27.9a13 13 0 0 0 1-3.07C76.67 54.6 78.77 50.71 85 44.48c6.76-6.83 13.09-13.1 17.39-21.62a56.88 56.88 0 0 1 7 12.35C98.85 49.72 87 67.71 85.77 82.14c-.42 4.86 1.46 13.43 3.76 21.07Z");
    			add_location(path5, file$a, 34, 8, 1525);
    			attr_dev(path6, "class", "cls-3");
    			attr_dev(path6, "d", "M113.59 56.8a56.62 56.62 0 0 1-18.28 41.73C94.59 95 94 91.47 93.58 87.85c-1.9-15.22 8.69-32.21 17.6-47.47a56.66 56.66 0 0 1 2.41 16.42Z");
    			add_location(path6, file$a, 37, 8, 1848);
    			attr_dev(g0, "id", "_ÎÓÈ_1");
    			attr_dev(g0, "data-name", "—ÎÓÈ_1");
    			add_location(g0, file$a, 18, 5, 355);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$a, 17, 3, 314);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 113.59 113.59");
    			attr_dev(svg, "class", "svelte-5bj8mz");
    			add_location(svg, file$a, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeroImage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeroImage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ draw });
    	return [];
    }

    class HeroImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroImage",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src/Sections/Home.svelte generated by Svelte v3.46.4 */
    const file$9 = "src/Sections/Home.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let button;
    	let div1_intro;
    	let t5;
    	let div3;
    	let div2;
    	let heroimage;
    	let div2_intro;
    	let div3_intro;
    	let t6;
    	let updates;
    	let t7;
    	let div5;
    	let about;
    	let t8;
    	let resources;
    	let current;
    	let mounted;
    	let dispose;
    	heroimage = new HeroImage({ $$inline: true });
    	updates = new Updates({ $$inline: true });
    	about = new About({ $$inline: true });
    	resources = new Resources({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Deloitte Private Pursuit Center";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Helping you win the race";
    			t3 = space();
    			button = element("button");
    			button.textContent = "Submit request";
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(heroimage.$$.fragment);
    			t6 = space();
    			create_component(updates.$$.fragment);
    			t7 = space();
    			div5 = element("div");
    			create_component(about.$$.fragment);
    			t8 = space();
    			create_component(resources.$$.fragment);
    			attr_dev(h1, "class", "svelte-17mnjcv");
    			add_location(h1, file$9, 19, 6, 596);
    			attr_dev(h2, "class", "svelte-17mnjcv");
    			add_location(h2, file$9, 20, 6, 643);
    			attr_dev(div0, "class", "titleWrapper");
    			add_location(div0, file$9, 18, 4, 563);
    			attr_dev(button, "class", "requestButton svelte-17mnjcv");
    			add_location(button, file$9, 22, 4, 692);
    			attr_dev(div1, "class", "left svelte-17mnjcv");
    			add_location(div1, file$9, 17, 2, 521);
    			attr_dev(div2, "class", "heroImage");
    			add_location(div2, file$9, 26, 4, 832);
    			attr_dev(div3, "class", "right svelte-17mnjcv");
    			add_location(div3, file$9, 25, 2, 789);
    			attr_dev(div4, "class", "container svelte-17mnjcv");
    			add_location(div4, file$9, 16, 0, 495);
    			attr_dev(div5, "class", "bottomWrapper svelte-17mnjcv");
    			add_location(div5, file$9, 36, 0, 982);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(div1, t3);
    			append_dev(div1, button);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(heroimage, div2, null);
    			append_dev(div4, t6);
    			mount_component(updates, div4, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(about, div5, null);
    			append_dev(div5, t8);
    			mount_component(resources, div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*dispatchFormSection*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { y: 30 });
    					div1_intro.start();
    				});
    			}

    			transition_in(heroimage.$$.fragment, local);

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, slide, {});
    					div2_intro.start();
    				});
    			}

    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, fly, { x: 30 });
    					div3_intro.start();
    				});
    			}

    			transition_in(updates.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(resources.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(heroimage.$$.fragment, local);
    			transition_out(updates.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(resources.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(heroimage);
    			destroy_component(updates);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div5);
    			destroy_component(about);
    			destroy_component(resources);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let dispatch = createEventDispatcher();

    	function dispatchFormSection() {
    		dispatch("form", {});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Place,
    		Updates,
    		Resources,
    		About,
    		HeroImage,
    		slide,
    		fly,
    		fade,
    		flip,
    		dispatchFormSection
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dispatchFormSection];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Sections/Team.svelte generated by Svelte v3.46.4 */
    const file$8 = "src/Sections/Team.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (294:14) {#each person.portfolio as portfolio}
    function create_each_block_1$3(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let t1_value = /*portfolio*/ ctx[8].name + "";
    	let t1;
    	let t2;
    	let div2_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			if (!src_url_equal(img.src, img_src_value = /*portfolio*/ ctx[8].thumbnail)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*portfolio*/ ctx[8].name);
    			attr_dev(img, "class", "svelte-nqbba8");
    			toggle_class(img, "portfolioItemHovered", /*person*/ ctx[5].hovered === true);
    			add_location(img, file$8, 296, 20, 9740);
    			attr_dev(div0, "class", "portfolioThumbnail svelte-nqbba8");
    			add_location(div0, file$8, 295, 18, 9687);
    			attr_dev(div1, "class", "portfolioName svelte-nqbba8");
    			add_location(div1, file$8, 302, 18, 9977);
    			attr_dev(div2, "class", "portfolioItem svelte-nqbba8");
    			attr_dev(div2, "href", div2_href_value = /*portfolio*/ ctx[8].url);
    			add_location(div2, file$8, 294, 16, 9620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div2, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamData*/ 1 && !src_url_equal(img.src, img_src_value = /*portfolio*/ ctx[8].thumbnail)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*teamData*/ 1 && img_alt_value !== (img_alt_value = /*portfolio*/ ctx[8].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*teamData*/ 1) {
    				toggle_class(img, "portfolioItemHovered", /*person*/ ctx[5].hovered === true);
    			}

    			if (dirty & /*teamData*/ 1 && t1_value !== (t1_value = /*portfolio*/ ctx[8].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*teamData*/ 1 && div2_href_value !== (div2_href_value = /*portfolio*/ ctx[8].url)) {
    				attr_dev(div2, "href", div2_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(294:14) {#each person.portfolio as portfolio}",
    		ctx
    	});

    	return block;
    }

    // (246:4) {#each teamData as person, idx (person.id)}
    function create_each_block$3(key_1, ctx) {
    	let div12;
    	let div6;
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*person*/ ctx[5].name + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*person*/ ctx[5].title + "";
    	let t3;
    	let t4;
    	let div5;
    	let div3;
    	let t5_value = /*person*/ ctx[5].phone + "";
    	let t5;
    	let t6;
    	let div4;
    	let a;
    	let t7_value = /*person*/ ctx[5].email + "";
    	let t7;
    	let t8;
    	let a_href_value;
    	let t9;
    	let div11;
    	let div7;
    	let t10_value = /*person*/ ctx[5].experience + "";
    	let t10;
    	let t11;
    	let div10;
    	let div8;
    	let t13;
    	let div9;
    	let t14;
    	let div12_intro;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*person*/ ctx[5].portfolio;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[1](/*person*/ ctx[5], /*each_value*/ ctx[6], /*idx*/ ctx[7]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[2](/*person*/ ctx[5], /*each_value*/ ctx[6], /*idx*/ ctx[7]);
    	}

    	function mouseout_handler() {
    		return /*mouseout_handler*/ ctx[3](/*person*/ ctx[5], /*each_value*/ ctx[6], /*idx*/ ctx[7]);
    	}

    	function blur_handler() {
    		return /*blur_handler*/ ctx[4](/*person*/ ctx[5], /*each_value*/ ctx[6], /*idx*/ ctx[7]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div12 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div4 = element("div");
    			a = element("a");
    			t7 = text(t7_value);
    			t8 = text("@deloitte.com");
    			t9 = space();
    			div11 = element("div");
    			div7 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div8.textContent = "Spotlight";
    			t13 = space();
    			div9 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			attr_dev(div0, "class", "pic svelte-nqbba8");
    			add_location(div0, file$8, 274, 10, 8862);
    			attr_dev(div1, "class", "name svelte-nqbba8");
    			add_location(div1, file$8, 275, 10, 8892);
    			attr_dev(div2, "class", "title svelte-nqbba8");
    			add_location(div2, file$8, 278, 10, 8964);
    			attr_dev(div3, "class", "phone svelte-nqbba8");
    			add_location(div3, file$8, 280, 12, 9052);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*person*/ ctx[5].email + "@deloitte.com");
    			attr_dev(a, "class", "svelte-nqbba8");
    			add_location(a, file$8, 281, 31, 9123);
    			attr_dev(div4, "class", "email svelte-nqbba8");
    			add_location(div4, file$8, 281, 12, 9104);
    			attr_dev(div5, "class", "contactInfo svelte-nqbba8");
    			add_location(div5, file$8, 279, 10, 9014);
    			attr_dev(div6, "class", "personInfo svelte-nqbba8");
    			add_location(div6, file$8, 273, 8, 8827);
    			attr_dev(div7, "class", "experience svelte-nqbba8");
    			add_location(div7, file$8, 286, 10, 9285);
    			attr_dev(div8, "class", "portfolioTitle svelte-nqbba8");
    			add_location(div8, file$8, 291, 12, 9464);
    			attr_dev(div9, "class", "portfoliosWrapper svelte-nqbba8");
    			add_location(div9, file$8, 292, 12, 9520);
    			attr_dev(div10, "class", "portfolioContainer svelte-nqbba8");
    			toggle_class(div10, "portfolioHovered", /*person*/ ctx[5].hovered === true);
    			add_location(div10, file$8, 290, 10, 9370);
    			attr_dev(div11, "class", "personDetails svelte-nqbba8");
    			add_location(div11, file$8, 285, 8, 9247);
    			attr_dev(div12, "class", "personWrapper svelte-nqbba8");
    			toggle_class(div12, "leader", /*person*/ ctx[5].title === "Deloitte Private Pursuits Leader");
    			toggle_class(div12, "personWrapperHovered", /*person*/ ctx[5].hovered === true);
    			toggle_class(div12, "dimmed", /*person*/ ctx[5].dimmed === true);
    			add_location(div12, file$8, 246, 6, 7918);
    			this.first = div12;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div1, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div2);
    			append_dev(div2, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, t7);
    			append_dev(a, t8);
    			append_dev(div12, t9);
    			append_dev(div12, div11);
    			append_dev(div11, div7);
    			append_dev(div7, t10);
    			append_dev(div11, t11);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t13);
    			append_dev(div10, div9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div9, null);
    			}

    			append_dev(div12, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div12, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div12, "focus", focus_handler, false, false, false),
    					listen_dev(div12, "mouseout", mouseout_handler, false, false, false),
    					listen_dev(div12, "blur", blur_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*teamData*/ 1 && t1_value !== (t1_value = /*person*/ ctx[5].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*teamData*/ 1 && t3_value !== (t3_value = /*person*/ ctx[5].title + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*teamData*/ 1 && t5_value !== (t5_value = /*person*/ ctx[5].phone + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*teamData*/ 1 && t7_value !== (t7_value = /*person*/ ctx[5].email + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*teamData*/ 1 && a_href_value !== (a_href_value = "mailto:" + /*person*/ ctx[5].email + "@deloitte.com")) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*teamData*/ 1 && t10_value !== (t10_value = /*person*/ ctx[5].experience + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*teamData*/ 1) {
    				each_value_1 = /*person*/ ctx[5].portfolio;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div9, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*teamData*/ 1) {
    				toggle_class(div10, "portfolioHovered", /*person*/ ctx[5].hovered === true);
    			}

    			if (dirty & /*teamData*/ 1) {
    				toggle_class(div12, "leader", /*person*/ ctx[5].title === "Deloitte Private Pursuits Leader");
    			}

    			if (dirty & /*teamData*/ 1) {
    				toggle_class(div12, "personWrapperHovered", /*person*/ ctx[5].hovered === true);
    			}

    			if (dirty & /*teamData*/ 1) {
    				toggle_class(div12, "dimmed", /*person*/ ctx[5].dimmed === true);
    			}
    		},
    		i: function intro(local) {
    			if (!div12_intro) {
    				add_render_callback(() => {
    					div12_intro = create_in_transition(div12, fly, {
    						y: -20,
    						delay: /*person*/ ctx[5].id * 100
    					});

    					div12_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(246:4) {#each teamData as person, idx (person.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*teamData*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*person*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Meet the team";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Intro text here donec finibus laoreet mollis.";
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-nqbba8");
    			add_location(h1, file$8, 241, 4, 7743);
    			attr_dev(p, "class", "svelte-nqbba8");
    			add_location(p, file$8, 242, 4, 7770);
    			attr_dev(div0, "class", "intro svelte-nqbba8");
    			add_location(div0, file$8, 240, 2, 7719);
    			attr_dev(div1, "class", "peopleContainer svelte-nqbba8");
    			add_location(div1, file$8, 244, 2, 7834);
    			attr_dev(section, "class", "svelte-nqbba8");
    			add_location(section, file$8, 239, 0, 7707);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(section, t3);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*teamData*/ 1) {
    				each_value = /*teamData*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block$3, null, get_each_context$3);
    			}
    		},
    		i: function intro(local) {
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);

    	let teamData = [
    		{
    			id: 1,
    			name: "Chami Perera",
    			email: "cperera",
    			title: "Deloitte Private Pursuits Leader",
    			phone: "+1 605 788 9389",
    			experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet facilisis justo, ac mattis elit. Nam quis venenatis libero, sit amet ultrices orci. Mauris at tortor erat. Pellentesque egestas lorem vitae dapibus lobortis. Nunc consectetur ornare quam vel lobortis.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/4.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/5.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/6.png"
    				}
    			]
    		},
    		{
    			id: 2,
    			name: "James Reuter",
    			email: "jreuter",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Donec finibus laoreet mollis. Fusce aliquam vel nulla sit amet congue. Proin sit amet lacus nunc. Etiam cursus orci vitae eros laoreet ullamcorper. Vestibulum ut lacinia nisi. Nunc blandit elementum felis placerat lacinia. Etiam venenatis quam dolor, molestie sollicitudin turpis pretium non.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/7.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/8.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/9.png"
    				}
    			]
    		},
    		{
    			id: 3,
    			name: "Kainaz Homji",
    			email: "khomji",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet facilisis justo, ac mattis elit. Nam quis venenatis libero, sit amet ultrices orci. Mauris at tortor erat. Pellentesque egestas lorem vitae dapibus lobortis. Nunc consectetur ornare quam vel lobortis.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/4.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/5.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/6.png"
    				}
    			]
    		},
    		{
    			id: 4,
    			name: "Erin Olinger",
    			email: "eolinger",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Donec finibus laoreet mollis. Fusce aliquam vel nulla sit amet congue. Proin sit amet lacus nunc. Etiam cursus orci vitae eros laoreet ullamcorper. Vestibulum ut lacinia nisi. Nunc blandit elementum felis placerat lacinia. Etiam venenatis quam dolor, molestie sollicitudin turpis pretium non.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/1.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/2.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/3.png"
    				}
    			]
    		},
    		{
    			id: 5,
    			name: "Sarah Schimmel",
    			email: "sschimmel",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet facilisis justo, ac mattis elit. Nam quis venenatis libero, sit amet ultrices orci. Mauris at tortor erat. Pellentesque egestas lorem vitae dapibus lobortis. Nunc consectetur ornare quam vel lobortis.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/2.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/9.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/5.png"
    				}
    			]
    		},
    		{
    			id: 6,
    			name: "Ahmed Muzzamil",
    			email: "amuzzamil",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Donec finibus laoreet mollis. Fusce aliquam vel nulla sit amet congue. Proin sit amet lacus nunc. Etiam cursus orci vitae eros laoreet ullamcorper. Vestibulum ut lacinia nisi. Nunc blandit elementum felis placerat lacinia. Etiam venenatis quam dolor, molestie sollicitudin turpis pretium non.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/4.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/5.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/6.png"
    				}
    			]
    		},
    		{
    			id: 7,
    			name: "Evan Sen",
    			email: "evsen",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			experience: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sit amet facilisis justo, ac mattis elit. Nam quis venenatis libero, sit amet ultrices orci. Mauris at tortor erat. Pellentesque egestas lorem vitae dapibus lobortis. Nunc consectetur ornare quam vel lobortis.",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/1.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/3.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/3.png"
    				}
    			]
    		},
    		{
    			id: 8,
    			name: "Poojita Annamraju",
    			email: "pannamraju",
    			title: "Pursuit Manager",
    			phone: "+1 605 788 9389",
    			portfolio: [
    				{
    					id: 1,
    					name: "First project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/3.png"
    				},
    				{
    					id: 2,
    					name: "Second Project name",
    					url: "#placeholder",
    					thumbnail: "testing/projects/6.png"
    				},
    				{
    					id: 3,
    					name: "Third Project name",
    					url: "#placeholder",
    					thumbnail: "./testing/projects/8.png"
    				}
    			],
    			experience: "Donec finibus laoreet mollis. Fusce aliquam vel nulla sit amet congue. Proin sit amet lacus nunc. Etiam cursus orci vitae eros laoreet ullamcorper. Vestibulum ut lacinia nisi. Nunc blandit elementum felis placerat lacinia. Etiam venenatis quam dolor, molestie sollicitudin turpis pretium non."
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = (person, each_value, idx) => {
    		$$invalidate(0, each_value[idx].hovered = true, teamData);

    		teamData.forEach(per => {
    			if (per.hovered !== true) per.dimmed = true;
    		});
    	};

    	const focus_handler = (person, each_value, idx) => {
    		$$invalidate(0, each_value[idx].hovered = true, teamData);

    		teamData.forEach(per => {
    			if (per.hovered !== true) per.dimmed = true;
    		});
    	};

    	const mouseout_handler = (person, each_value, idx) => {
    		$$invalidate(0, each_value[idx].hovered = false, teamData);
    		teamData.forEach(per => per.dimmed = false);
    	};

    	const blur_handler = (person, each_value, idx) => {
    		$$invalidate(0, each_value[idx].hovered = false, teamData);
    		teamData.forEach(per => per.dimmed = false);
    	};

    	$$self.$capture_state = () => ({ slide, fly, scale, teamData });

    	$$self.$inject_state = $$props => {
    		if ('teamData' in $$props) $$invalidate(0, teamData = $$props.teamData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [teamData, mouseover_handler, focus_handler, mouseout_handler, blur_handler];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Elements/SmallPlant.svelte generated by Svelte v3.46.4 */

    const file$7 = "src/Elements/SmallPlant.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".cls-1 {\n        fill: #313d56;\n      }\n      .cls-2 {\n        fill: #1a253a;\n      }\n      .cls-3 {\n        fill: #569986;\n      }\n      .cls-4 {\n        fill: #137058;\n      }\n      .cls-5 {\n        fill: #1c8c67;\n      }\n    ");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			add_location(style, file$7, 2, 5, 80);
    			add_location(defs, file$7, 1, 3, 69);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M25.05 41.61h-6.59c-1.56 0-3 0-4.36-.1-.38 0-.75 0-1.11-.05-3.91-.2-6.49-.59-6.66-1a2.43 2.43 0 0 0 0 .27l2.93 33.6h20.31l.5-5.74L32.5 40.8a1.34 1.34 0 0 0 0-.28c-.17.48-3.15.89-7.45 1.09Z");
    			add_location(path0, file$7, 21, 7, 422);
    			attr_dev(path1, "class", "cls-2");
    			attr_dev(path1, "d", "M32.51 40.48v.08a.05.05 0 0 0 0-.08ZM6.33 40.48a.43.43 0 0 0 0 .05v-.1a.43.43 0 0 1 0 .05ZM13 41.58c.36 0 .73 0 1.11.05 1.34.06 2.8.1 4.36.1h6.59c4.3-.2 7.28-.61 7.44-1.09v-.08c-.17-.45-2.76-.83-6.55-1h-1.36c-.95 0-2-.06-3-.08H18c-1.43 0-2.78.05-4 .1l-1.11.06c-3.79.2-6.3.59-6.49 1v.1c.11.26 2.69.64 6.6.84Z");
    			add_location(path1, file$7, 24, 8, 659);
    			attr_dev(path2, "class", "cls-1");
    			attr_dev(path2, "d", "M17.75 68.68a5.66 5.66 0 0 1-5.27-5.17c-.51-5.9-1.38-15.95-2-22.1-2.48-.22-4-.53-4.17-.88a2.26 2.26 0 0 0 0 .26l2.95 33.54h20.31l.5-5.74a73.89 73.89 0 0 1-12.32.09Z");
    			add_location(path2, file$7, 27, 8, 1015);
    			attr_dev(path3, "class", "cls-3");
    			attr_dev(path3, "d", "M21.85 16.35s6-8.78 3.37-12.56-5.08-5.79-5.81-.87S18 13.72 17.38 15s-2.17 5.38-1.59 7.85 1.59 5.67 1.59 5.67Z");
    			add_location(path3, file$7, 30, 8, 1228);
    			attr_dev(path4, "class", "cls-4");
    			attr_dev(path4, "d", "M17.38 22.11c0-.58-.14-11.48-5.22-12.65s-3.77 5-2.45 10.85 1.87 10.23 1.87 10.23l7.83 11.2Z");
    			add_location(path4, file$7, 33, 8, 1386);
    			attr_dev(path5, "class", "cls-4");
    			attr_dev(path5, "d", "M27 31c.44-.19 10-12.69 9.87-15.74s-2.8-5.8-4.97-3.76-8.57 8.43-10.16 10.9-4.36 6.11-4.36 6.11l2 13.23Z");
    			add_location(path5, file$7, 36, 8, 1526);
    			attr_dev(path6, "class", "cls-5");
    			attr_dev(path6, "d", "M13.75 41.74S-7.14 19.06 2.58 20.37s16.83 21.37 16.83 21.37ZM23.48 41.74c.58-.44 22.2-16.69 18-21.43s-16.4 9.51-18 12-4.07 9.45-4.07 9.45Z");
    			add_location(path6, file$7, 39, 8, 1678);
    			attr_dev(path7, "class", "cls-3");
    			attr_dev(path7, "d", "M20.6 28.39a32.19 32.19 0 0 0 8.87-11.31c1.61-3.48 2.72-7.26 1.25-9.21-3.18-4.22-9.13 9.3-10.14 10.9a53.91 53.91 0 0 0-2.84 6.76L17.38 31Z");
    			add_location(path7, file$7, 42, 8, 1865);
    			attr_dev(g0, "id", "_ÎÓÈ_1");
    			attr_dev(g0, "data-name", "—ÎÓÈ_1");
    			add_location(g0, file$7, 20, 5, 381);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$7, 19, 3, 340);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 42.02 74.33");
    			add_location(svg, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    			append_dev(g0, path7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SmallPlant', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SmallPlant> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SmallPlant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SmallPlant",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Elements/LargePlant.svelte generated by Svelte v3.46.4 */

    const file$6 = "src/Elements/LargePlant.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".cls-2 {\n        fill: #1a253a;\n      }\n      .cls-4 {\n        fill: #3a937a;\n      }\n      .cls-5 {\n        fill: #1a8066;\n      }\n    ");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			add_location(style, file$6, 2, 5, 80);
    			add_location(defs, file$6, 1, 3, 69);
    			attr_dev(path0, "d", "M23.41 96.7v24.23a8 8 0 0 0 .35 2.36 7.84 7.84 0 0 0 .43 1.14 8.29 8.29 0 0 0 4.42 4.18 6.81 6.81 0 0 0 1.26.39 7.88 7.88 0 0 0 1.82.21h11.1a8.07 8.07 0 0 0 2-.24 8.29 8.29 0 0 0 6.3-8V96.7Z");
    			attr_dev(path0, "fill", "#313d56");
    			add_location(path0, file$6, 16, 9, 353);
    			attr_dev(path1, "class", "cls-2");
    			attr_dev(path1, "d", "M35.21 129.21h1.91a36 36 0 0 0 8.66-10.74 78.53 78.53 0 0 0 4.32-9.59c.33-.85.66-1.71 1-2.56v-3.44c-.24.67-.45 1.35-.68 2-1.34 3.61-2.7 7.22-4.39 10.69-2.61 5.23-6.03 10.19-10.82 13.64ZM28.61 128.61a6.81 6.81 0 0 0 1.26.39c9.16-8.77 11.85-23.15 20.84-32.3h-1.6c-8.5 9.3-11.23 23.52-20.5 31.91ZM23.41 112.59v1.56a18.76 18.76 0 0 0 4.25-5.66c2-3.61 3.78-7.31 5.45-11.07a.6.6 0 0 0-.17-.72.52.52 0 0 0-.75 0 .64.64 0 0 0-.08.14c-1.52 3.42-3.15 6.78-4.92 10.07a23.34 23.34 0 0 1-3.78 5.68ZM23.41 102.2v2A35.1 35.1 0 0 0 27.6 97a.7.7 0 0 0 0-.31c0-.52-.81-.86-1.06-.28l-.12.28a33.89 33.89 0 0 1-3.01 5.51ZM44.77 129a8.34 8.34 0 0 0 1.63-.59c.63-1.21 1.16-2.48 1.76-3.68.89-1.77 1.92-3.45 2.91-5.16v-2.33c-1.17 2.18-2.54 4.26-3.68 6.46-.88 1.66-1.58 3.61-2.62 5.3ZM23.76 123.29a7.84 7.84 0 0 0 .43 1.14 30 30 0 0 0 8.24-11.5 48.69 48.69 0 0 1 4.27-8.43 35 35 0 0 0 4.22-7.27.49.49 0 0 0-.1-.53.65.65 0 0 0-.88 0 .55.55 0 0 0-.14.22c-1 2.72-2.78 5-4.38 7.4a42.19 42.19 0 0 0-3.64 7.19 31.17 31.17 0 0 1-8.02 11.78Z");
    			add_location(path1, file$6, 19, 10, 599);
    			attr_dev(path2, "class", "cls-2");
    			attr_dev(path2, "d", "M23.41 96.7c0 .48 2.79.89 7.06 1.1h1.17c1.41.06 3 .1 4.6.1h7.01c4.66-.2 7.88-.63 7.88-1.12s-2.79-.86-6.95-1.08H42.7c-1 0-2.07-.07-3.18-.08h-3.81c-1.52 0-2.94 0-4.25.1h-1.17c-4.17.1-6.88.51-6.88.98Z");
    			add_location(path2, file$6, 22, 10, 1661);
    			attr_dev(path3, "d", "M29.53 79.29S49.74 72 46.82 65.46c-1.48-3.33-10.72-.95-10.72-.95s18.34-6.61 10.14-14.16c-4.35-4-12.74 1.48-12 .87s13.59-12.06 4.57-18c-5.12-3.39-8.09 5.46-8.07 4.35S41.47 20.6 31.46 16c-5.16-2.37-7.93 8.7-8 7.84S29.63 13.05 22 10.37s-6 14.35-6 14.35-.1-11.18-7.19-9 3.09 16.24 3.09 16.24S-2.9 22.18.51 30.45a47.2 47.2 0 0 0 10.24 14.6S-2 37.52 2.65 47 12.8 59.18 12.8 59.18s-13.4-.67-7.2 5.57 10.72 6.59 10.72 6.59-9.53-.13-5 3.45 14.17 5.38 18.21 4.5Z");
    			attr_dev(path3, "fill", "#167c5f");
    			add_location(path3, file$6, 25, 10, 1913);
    			attr_dev(path4, "class", "cls-4");
    			attr_dev(path4, "d", "M18.05 26.39A129.35 129.35 0 0 1 22.88 44c3.57 17.38 4.43 35.18 7.41 52.65l.09.52c.09.55.19 1.1.29 1.65h1.18c-.09-.49-.18-1-.26-1.45-.05-.28-.1-.55-.14-.83q-.68-3.89-1.21-7.8c-2.95-21-3.92-42.59-11.12-62.79-.25-.75-1.32-.26-1.07.44Z");
    			add_location(path4, file$6, 28, 10, 2421);
    			attr_dev(path5, "class", "cls-4");
    			attr_dev(path5, "d", "M39.48 87.26c1 .09 20.78-8.56 20.87-15.69.12-9.4-9.08-4.37-9.08-4.37s4-2.51 9.06-11.85-4.93-14-7.49-11.77S69.7 35.49 67.2 29.93s-15.29 1.51-15.29 1.51S68 20.37 63 14.93s-14.71 7.51-14.41 6.61S56.39 5 52 .89 40.18 7.79 41.18 14c0 0-2-13.18-8-11.32s.91 17.82.91 17.82-2.23-7.23-6.6-5.22 4.22 21 4.22 21-2.48-5.28-9.11-2.71 3.25 19.57 3.25 19.57-4.18-8.81-8.2-1.06 7.2 15.32 7.2 15.32-13.75-2.5-8.31 7.69 15.17 11.5 22.94 12.17Z");
    			add_location(path5, file$6, 31, 10, 2708);
    			attr_dev(path6, "class", "cls-5");
    			attr_dev(path6, "d", "M37.79 101.36h.01l-.01-.01v.01zM36.43 98.45h.24l.55-.05.54-.06c0-.82-.08-1.77-.11-2.5v-1c-.48-12 1-24 2.37-35.88l4.68-42c.1-.86-1.09-1.1-1.18-.25l-2.1 18.86c-1.24 11.1-2.52 22.19-3.7 33.29a180.46 180.46 0 0 0-1.26 26.09v1c-.03.69-.03 1.61-.03 2.5Z");
    			add_location(path6, file$6, 34, 10, 3188);
    			attr_dev(path7, "d", "M48 85.53s18.68 2.2 19-4.08c.15-3.19-8-4.94-8-4.94s16.94 2 13.51-7.14c-1.82-4.85-10.55-3.83-9.73-4S78.11 61.2 73.41 53c-2.67-4.67-8.48 1.11-8 .25s15.08-9.09 9.07-16.61c-3.1-3.88-9.63 3.72-9.36 3s7.31-9.33.79-12c-9.35-3.85-7 9.75-7 9.75s-3.47-8.9-8-7.36c-8.83 3 .35 12.34.35 12.34s-4.59-7.12-10.13-1.8c-3.22 3.09 5.65 10.74 5.65 10.74s-15.38-11.5-15.49-2.26 11.53 14.14 11.53 14.14-10.21-5.78-7.82 1.54 5.79 9.38 5.79 9.38-7.41-3.83-5.25.76S44.46 84.64 48 85.53Z");
    			attr_dev(path7, "fill", "#65b78c");
    			add_location(path7, file$6, 37, 10, 3490);
    			attr_dev(path8, "class", "cls-4");
    			attr_dev(path8, "d", "m42.22 97.83.48-.07.65-.08c.23-.76.48-1.53.73-2.29s.48-1.46.73-2.19c6-17.68 13.74-35 16.08-53.65.08-.66-1-.7-1 0a114 114 0 0 1-3.17 15.72C53 68.91 47.41 82 43 95.44c-.27.79-.52 1.56-.78 2.39ZM40.08 105.13z");
    			add_location(path8, file$6, 40, 10, 4007);
    			attr_dev(g0, "id", "plant");
    			add_location(g0, file$6, 15, 7, 330);
    			attr_dev(g1, "id", "_ÎÓÈ_1");
    			attr_dev(g1, "data-name", "—ÎÓÈ_1");
    			add_location(g1, file$6, 14, 5, 289);
    			attr_dev(g2, "id", "Layer_2");
    			attr_dev(g2, "data-name", "Layer 2");
    			add_location(g2, file$6, 13, 3, 248);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 75.9 129.21");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    			append_dev(g0, path7);
    			append_dev(g0, path8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LargePlant', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LargePlant> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LargePlant extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LargePlant",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Icons/Back.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/Icons/Back.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let circle;
    	let path;
    	let path_stroke_miterlimit_value;
    	let path_intro;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path = svg_element("path");
    			attr_dev(circle, "cx", "206");
    			attr_dev(circle, "cy", "206");
    			attr_dev(circle, "r", "206");
    			attr_dev(circle, "fill", /*iconBackgroundColor*/ ctx[0]);
    			attr_dev(circle, "fill-opacity", /*itemIconOpacity*/ ctx[2]);
    			add_location(circle, file$5, 11, 3, 366);
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "stroke", /*iconColor*/ ctx[1]);
    			attr_dev(path, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-miterlimit", path_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2);
    			attr_dev(path, "d", "M248 309.9 120.6 203.6l122.7-101.5");
    			add_location(path, file$5, 11, 97, 460);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 412 412");
    			attr_dev(svg, "xml:space", "preserve");
    			set_style(svg, "transform", /*direction*/ ctx[4]);
    			add_location(svg, file$5, 10, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconBackgroundColor*/ 1) {
    				attr_dev(circle, "fill", /*iconBackgroundColor*/ ctx[0]);
    			}

    			if (dirty & /*itemIconOpacity*/ 4) {
    				attr_dev(circle, "fill-opacity", /*itemIconOpacity*/ ctx[2]);
    			}

    			if (dirty & /*iconColor*/ 2) {
    				attr_dev(path, "stroke", /*iconColor*/ ctx[1]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8) {
    				attr_dev(path, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8 && path_stroke_miterlimit_value !== (path_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2)) {
    				attr_dev(path, "stroke-miterlimit", path_stroke_miterlimit_value);
    			}
    		},
    		i: function intro(local) {
    			if (!path_intro) {
    				add_render_callback(() => {
    					path_intro = create_in_transition(path, draw, { duration: 600 });
    					path_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Back', slots, []);
    	let { iconBackgroundColor } = $$props;
    	let { iconColor } = $$props;
    	let { itemIconOpacity } = $$props;
    	let { iconStrokeWidth } = $$props;
    	let { back } = $$props;
    	let direction = back ? "" : "rotate(180deg)";

    	const writable_props = [
    		'iconBackgroundColor',
    		'iconColor',
    		'itemIconOpacity',
    		'iconStrokeWidth',
    		'back'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Back> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('iconBackgroundColor' in $$props) $$invalidate(0, iconBackgroundColor = $$props.iconBackgroundColor);
    		if ('iconColor' in $$props) $$invalidate(1, iconColor = $$props.iconColor);
    		if ('itemIconOpacity' in $$props) $$invalidate(2, itemIconOpacity = $$props.itemIconOpacity);
    		if ('iconStrokeWidth' in $$props) $$invalidate(3, iconStrokeWidth = $$props.iconStrokeWidth);
    		if ('back' in $$props) $$invalidate(5, back = $$props.back);
    	};

    	$$self.$capture_state = () => ({
    		iconBackgroundColor,
    		iconColor,
    		itemIconOpacity,
    		iconStrokeWidth,
    		draw,
    		back,
    		direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconBackgroundColor' in $$props) $$invalidate(0, iconBackgroundColor = $$props.iconBackgroundColor);
    		if ('iconColor' in $$props) $$invalidate(1, iconColor = $$props.iconColor);
    		if ('itemIconOpacity' in $$props) $$invalidate(2, itemIconOpacity = $$props.itemIconOpacity);
    		if ('iconStrokeWidth' in $$props) $$invalidate(3, iconStrokeWidth = $$props.iconStrokeWidth);
    		if ('back' in $$props) $$invalidate(5, back = $$props.back);
    		if ('direction' in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		iconBackgroundColor,
    		iconColor,
    		itemIconOpacity,
    		iconStrokeWidth,
    		direction,
    		back
    	];
    }

    class Back extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			iconBackgroundColor: 0,
    			iconColor: 1,
    			itemIconOpacity: 2,
    			iconStrokeWidth: 3,
    			back: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Back",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*iconBackgroundColor*/ ctx[0] === undefined && !('iconBackgroundColor' in props)) {
    			console.warn("<Back> was created without expected prop 'iconBackgroundColor'");
    		}

    		if (/*iconColor*/ ctx[1] === undefined && !('iconColor' in props)) {
    			console.warn("<Back> was created without expected prop 'iconColor'");
    		}

    		if (/*itemIconOpacity*/ ctx[2] === undefined && !('itemIconOpacity' in props)) {
    			console.warn("<Back> was created without expected prop 'itemIconOpacity'");
    		}

    		if (/*iconStrokeWidth*/ ctx[3] === undefined && !('iconStrokeWidth' in props)) {
    			console.warn("<Back> was created without expected prop 'iconStrokeWidth'");
    		}

    		if (/*back*/ ctx[5] === undefined && !('back' in props)) {
    			console.warn("<Back> was created without expected prop 'back'");
    		}
    	}

    	get iconBackgroundColor() {
    		throw new Error("<Back>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconBackgroundColor(value) {
    		throw new Error("<Back>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconColor() {
    		throw new Error("<Back>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconColor(value) {
    		throw new Error("<Back>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemIconOpacity() {
    		throw new Error("<Back>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemIconOpacity(value) {
    		throw new Error("<Back>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconStrokeWidth() {
    		throw new Error("<Back>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconStrokeWidth(value) {
    		throw new Error("<Back>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get back() {
    		throw new Error("<Back>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set back(value) {
    		throw new Error("<Back>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let users = writable([
      // {
      //   id: 1,
      //   name: "John Doe",
      //   email: "jdoe",
      // },
      {
        id: 2,
        name: "Barney Rubbles",
        email: "brubbles",
      },
      {
        id: 3,
        name: "Jeff Lebowski",
        email: "jlebowski",
      },
      {
        id: 4,
        name: "Water Sobchak",
        email: "wsobchak",
      },
      {
        id: 5,
        name: "Nadeem Farooque",
        email: "nfarooque",
      },
      {
        id: 6,
        name: "Kainaz Homji",
        email: "khomji",
      },
      {
        id: 7,
        name: "Pujitha Annamraju",
        email: "pannamraju",
      },
      {
        id: 8,
        name: "Erin Olinger",
        email: "eolinger",
      },
      {
        id: 9,
        name: "Jim Reuter",
        email: "jreuter",
      },
      {
        id: 10,
        name: "Sarah Schimmel",
        email: "sschimmel",
      },
      {
        id: 11,
        name: "Ahmed Muzzamil",
        email: "amuzzamil",
      },
    ]);

    let projects = writable([
      {
        id: 1,
        projectName: "First project",
        submitter: "Bob Sacamano",
        startDate: "2022-02-19T10:20:30Z",
        endDate: "2022-02-21T10:20:30Z",
        status: "In-progress",
        assignedTo: "jdoe",
        duration: 3,
        value: 10000,
      },
      {
        id: 2,
        projectName: "Second project",
        submitter: "Frank Costanza",
        startDate: "2022-02-24T10:20:30Z",
        endDate: "2022-02-25T10:20:30Z",
        status: "In-progress",
        assignedTo: "none",
        duration: 1,
        value: 20000,
      },
      {
        id: 3,
        projectName: "Third project",
        submitter: "Cosmo Kramer",
        startDate: "2022-02-16T10:20:30Z",
        endDate: "2022-02-17T10:20:30Z",
        status: "In-progress",
        assignedTo: "brubbles",
        duration: 2,
        value: 10000,
      },

      {
        id: 4,
        projectName: "Fourth project",
        submitter: "Babu Bhatt",
        startDate: "2022-02-26T20:20:30Z",
        endDate: "2022-02-27T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 2,
        value: 100000,
      },
      {
        id: 5,
        projectName: "Fifth project",
        submitter: "Jackie Chiles",
        startDate: "2022-02-17T10:20:30Z",
        endDate: "2022-02-19T10:20:30Z",
        status: "Completed",
        assignedTo: "jlebowski",
        duration: 3,
        value: 300000,
      },
      {
        id: 6,
        projectName: "Sixth project",
        submitter: "Bob Sacamano",
        startDate: "2022-02-25T10:20:30Z",
        endDate: "2022-02-27T10:20:30Z",
        status: "Completed",
        assignedTo: "eolinger",
        duration: 3,
        value: 200000,
      },
      {
        id: 7,
        projectName: "Seventh project",
        submitter: "Uncle Leo",
        startDate: "2022-02-23T10:20:30Z",
        endDate: "2022-02-25T10:20:30Z",
        status: "Completed",
        assignedTo: "jlebowski",
        duration: 3,
        value: 400000,
      },
      {
        id: 8,
        projectName: "Eighth project",
        submitter: "Morty Seinfeld",
        startDate: "2022-02-11T10:20:30Z",
        endDate: "2022-02-12T10:20:30Z",
        status: "Completed",
        assignedTo: "jdoe",
        duration: 2,
        value: 50000,
      },
      {
        id: 9,
        projectName: "XYZ Project",
        submitter: "Bob Sacamano",
        startDate: "2022-02-12T10:20:30Z",
        endDate: "2022-02-15T10:20:30Z",
        status: "Completed",
        assignedTo: "brubbles",
        duration: 4,
        value: 75000,
      },

      {
        id: 10,
        projectName: "ABC project",
        submitter: "Jerry Seinfeld",
        startDate: "2022-02-20T10:20:30Z",
        endDate: "2022-02-21T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 2,
        value: 75000,
      },
      {
        id: 11,
        projectName: "Random project",
        submitter: "Elaine Bennes",
        startDate: "2022-02-24T10:20:30Z",
        endDate: "2022-02-25T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 2,
        value: 150000,
      },
      {
        id: 12,
        projectName: "Another project",
        submitter: "Bob Sacamano",
        startDate: "2022-02-24T10:20:30Z",
        endDate: "2022-02-26T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 3,
        value: 550000,
      },
      {
        id: 13,
        projectName: "One more project",
        submitter: "George Costanza",
        startDate: "2022-02-14T10:20:30Z",
        endDate: "2022-02-16T10:20:30Z",
        status: "Completed",
        assignedTo: "eolinger",
        duration: 3,
        value: 10000,
      },
      {
        id: 14,
        projectName: "Random project",
        submitter: "J Peterman",
        startDate: "2022-02-27T10:20:30Z",
        endDate: "2022-02-28T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 2,
        value: 65000,
      },
      {
        id: 15,
        projectName: "Another project",
        submitter: "Elaine Bennes",
        startDate: "2022-03-02T10:20:30Z",
        endDate: "2022-03-04T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 3,
        value: 18000,
      },
      {
        id: 16,
        projectName: "One more project",
        submitter: "Jerry Seinfeld",
        startDate: "2022-02-14T10:20:30Z",
        endDate: "2022-02-16T10:20:30Z",
        status: "Completed",
        assignedTo: "none",
        duration: 3,
        value: 250000,
      },
      {
        id: 17,
        projectName: "Yoyoma project",
        submitter: "J Peterman",
        startDate: "2022-02-20T10:20:30Z",
        endDate: "2022-02-22T10:20:30Z",
        status: "Completed",
        assignedTo: "khomji",
        duration: 3,
        value: 150000,
      },
      {
        id: 18,
        projectName: "Woohoo project",
        submitter: "Jerry Seinfeld",
        startDate: "2022-03-22T10:20:30Z",
        endDate: "2022-03-23T10:20:30Z",
        status: "Completed",
        assignedTo: "pannamraju",
        duration: 2,
        value: 35000,
      },
      {
        id: 19,
        projectName: "Heha project",
        submitter: "Elaine Bennes",
        startDate: "2022-02-24T10:20:30Z",
        endDate: "2022-02-25T10:20:30Z",
        status: "Completed",
        assignedTo: "jreuter",
        duration: 2,
        value: 20000,
      },
      {
        id: 20,
        projectName: "Last project",
        submitter: "Babu Bhatt",
        startDate: "2022-02-22T10:20:30Z",
        endDate: "2022-02-23T10:20:30Z",
        status: "Completed",
        assignedTo: "pannamraju",
        duration: 2,
        value: 450000,
      },
    ]);

    let formsData = writable([
      {
        id: 1,
        name: "Deloitte Private",
        active: false,
        img: "large",
        sections: [
          {
            id: 1,
            name: "Target",
            questions: [
              {
                id: 1,
                question: "Target client",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 2,
                question: "WBS code",
                hint: "For the benefit of Pursuit Manager",
                response: "",
                type: "text",
              },
              {
                id: 3,
                question: "Target company revenue",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 4,
                question: "Entity type",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "Public" },
                  { id: 2, text: "Private" },
                  { id: 3, text: "State Govt" },
                  { id: 4, text: "Local Govt" },
                  { id: 5, text: "Federal" },
                  { id: 6, text: "Non-profit", hint: "(only private companies are in scope)" },
                ],
              },
              {
                id: 5,
                question: "Client category",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "EGC" },
                  { id: 2, text: "PE portfolio company" },
                  { id: 3, text: "Family owned" },
                  { id: 4, text: "Other Deloitte Private?" },
                ],
              },
              {
                id: 6,
                question: "Deloitte office supporting the pursuit",
                hint: "for the letterhead",
                response: "",
                type: "offices",
              },
              {
                id: 7,
                question: "Primary industry for proposal quals",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 8,
                question: "Primary contact at the client",
                hint: "For cover letter",
                response: "",
                choices: [
                  { id: 1, text: "Address" },
                  { id: 2, text: "City" },
                  { id: 3, text: "State" },
                  { id: 4, text: "Zip" },
                ],
                type: "multiple text",
              },
            ],
          },
          {
            id: 2,
            name: "Opportunity",
            questions: [
              {
                id: 1,
                question: "Service",
                hint: "Also, add in any additional service offerings, such as IPO services, or revenue recognition.",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "External audit — Growth" },
                  { id: 2, text: "External audit & tax — Growth" },
                  { id: 3, text: "External audit — Defend" },
                  { id: 4, text: "External audit & tax — Defend" },
                  { id: 5, text: "Tax only - Growth" },
                  { id: 6, text: "Tax only - Defend" },
                  { id: 7, text: "Other", type: "text" },
                ],
              },
              {
                id: 2,
                question: "Pursuit phase",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "Proposal" },
                  { id: 2, text: "Orals" },
                ],
              },
              {
                id: 3,
                question: "Due date to the client",
                hint: "Select date and time",
                response: "",
                type: "date",
              },
              {
                id: 4,
                question: "Estimated annual audit fees",
                hint: "A ballpark estimate.",
                response: "",
                type: "currency",
              },
              {
                id: 5,
                question: "Annual fees for other services",
                hint: "Please specify service and fees",
                response: "",
                type: "currency",
              },
              {
                id: 6,
                question: "Mercury ID #",
                hint: "",
                response: "",
                type: "number",
              },
              {
                id: 7,
                question: "Primary reason(s) for going to bid?",
                hint: "",
                response: "",
                type: "multiple text",
                choices: [
                  { id: 1, primary: false },
                  { id: 2, primary: false },
                  { id: 3, primary: false },
                ],
              },
              {
                id: 8,
                question: "Do we have a relationship with anyone at the company? With who?",
                hint: "",
                response: "",
                type: "multiple text",
                choices: [
                  { id: 1, text: "Contact", primary: false },
                  { id: 2, text: "Contact", primary: false },
                  { id: 3, text: "Contact", primary: false },
                ],
              },
              {
                id: 9,
                question: "What is the strength of that relationship on scale of 1-5?",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "1 - Not strong" },
                  { id: 2, text: "2" },
                  { id: 3, text: "3" },
                  { id: 4, text: "4" },
                  { id: 5, text: "5 - Very strong" },
                ],
              },
              {
                id: 10,
                question: "RFP",
                hint: "Received? If so, please attach.",
                response: [],
                type: "files",
              },
              {
                id: 11,
                question: "Why are we positioned to win?",
                hint: "",
                response: "",
                type: "textarea",
              },
              {
                id: 12,
                question: "Why might we lose?",
                hint: "",
                response: "",
                type: "textarea",
              },
              {
                id: 13,
                question: "Incumbent",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "KPMG" },
                  { id: 2, text: "PwC" },
                  { id: 3, text: "EY" },
                  { id: 4, text: "Second tier firm (GT...)" },
                  { id: 5, text: "Regional firm" },
                  { id: 6, text: "Small local firm" },
                ],
              },
              {
                id: 14,
                question: "Competition",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "KPMG" },
                  { id: 2, text: "PwC" },
                  { id: 3, text: "EY" },
                  { id: 4, text: "Second tier firm (GT...)" },
                  { id: 5, text: "Regional firm" },
                  { id: 6, text: "Small local firm" },
                ],
              },
            ],
          },
          {
            id: 3,
            name: "Team",
            questions: [
              {
                id: 1,
                question: "Lead Client Service Partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 2,
                question: "Lead audit partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 3,
                question: "Lead tax partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 4,
                question: "Industry SME",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 5,
                question: "Primary contact from client service team",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 6,
                question: "Audit growth manager",
                hint: "If applicable",
                response: "",
                type: "text",
              },
              {
                id: 7,
                question: "Additional team member names and roles",
                hint: "If applicable",
                response: "",
                type: "multiple text",
                group: true,
                choices: [
                  { id: 1, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 2, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 3, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 4, text: "Name", role: "Role", response: "", roleResponse: "" },
                ],
              },
              {
                id: 8,
                question: "Additional background details and general project comments",
                hint: "",
                response: "",
                type: "textarea",
              },
            ],
          },
        ],
      }, {
        id: 2,
        name: "Emerging Growth Company (EGC)",
        active: false,
        img: "small",
        sections: [
          {
            id: 1,
            name: "Target",
            questions: [
              {
                id: 1,
                question: "Target client",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 2,
                question: "WBS code",
                hint: "For the benefit of Pursuit Manager",
                response: "",
                type: "text",
              },
              {
                id: 3,
                question: "Target company revenue",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 4,
                question: "Entity type",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "Public" },
                  { id: 2, text: "Private" },
                  { id: 3, text: "State Govt" },
                  { id: 4, text: "Local Govt" },
                  { id: 5, text: "Federal" },
                  { id: 6, text: "Non-profit", hint: "(only private companies are in scope)" },
                ],
              },
              {
                id: 5,
                question: "Client category",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "EGC" },
                  { id: 2, text: "PE portfolio company" },
                  { id: 3, text: "Family owned" },
                  { id: 4, text: "Other Deloitte Private?" },
                ],
              },
              {
                id: 6,
                question: "EGC only: Stage of company as it relates to a potential IPO",
                hint: "Choose one",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "Early stage" },
                  { id: 2, text: "PE Late Stage" },
                  { id: 3, text: "Imminent IPO" },
                  { id: 4, text: "SPAC" },
                ],
              },
              {
                id: 7,
                question: "Deloitte office supporting the pursuit",
                hint: "for the letterhead",
                response: "",
                type: "offices",
              },
              {
                id: 8,
                question: "Primary industry for proposal quals",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 9,
                question: "Primary contact at the client",
                hint: "For cover letter",
                response: "",
                choices: [
                  { id: 1, text: "Address" },
                  { id: 2, text: "City" },
                  { id: 3, text: "State" },
                  { id: 4, text: "Zip" },
                ],
                type: "multiple text",
              },
            ],
          },
          {
            id: 2,
            name: "Opportunity",
            questions: [
              {
                id: 1,
                question: "Service",
                hint: "Also, add in any additional service offerings, such as IPO services, or revenue recognition.",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "External audit — Growth" },
                  { id: 2, text: "External audit — Retention" },
                  { id: 3, text: "External audit & tax — Growth" },
                  { id: 4, text: "External audit & tax — Retention" },
                ],
              },
              {
                id: 2,
                question: "Pursuit phase",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "Proposal" },
                  { id: 2, text: "Orals" },
                ],
              },
              {
                id: 3,
                question: "Due date",
                hint: "Select date and time",
                response: "",
                type: "date",
              },
              {
                id: 4,
                question: "Annual audit fees",
                hint: "A ballpark estimate.",
                response: "",
                type: "currency",
              },
              {
                id: 5,
                question: "Annual fees for other services",
                hint: "Please specify service and fees",
                response: "",
                type: "currency",
              },
              {
                id: 6,
                question: "Mercury ID #",
                hint: "",
                response: "",
                type: "number",
              },
              {
                id: 7,
                question: "Origin: Relationship based or RFP based? Please expand in the two categories below",
                hint: "",
                response: "",
                type: "multiple textarea",
                choices: [
                  { id: 1, text: "Relationship-based?", primary: false },
                  { id: 2, text: "RFP-based?", primary: false },
                ],
              },
              {
                id: 8,
                question: "Target conversation overview",
                hint: "Brief description of how the opportunity came to us, from whom, and why; please include any specific relationships.",
                response: "",
                type: "text",
              },

              {
                id: 9,
                question: "RFP",
                hint: "Received? If so, please attach.",
                response: [],
                type: "files",
              },
              {
                id: 10,
                question: "Why are we positioned to win?",
                hint: "",
                response: "",
                type: "textarea",
              },
              {
                id: 11,
                question: "Why might we lose?",
                hint: "",
                response: "",
                type: "textarea",
              },
              {
                id: 12,
                question: "Incumbent",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "KPMG" },
                  { id: 2, text: "PwC" },
                  { id: 3, text: "EY" },
                  { id: 4, text: "Second tier firm (GT...)" },
                  { id: 5, text: "Regional firm" },
                  { id: 6, text: "Small local firm" },
                ],
              },
              {
                id: 13,
                question: "Competition",
                hint: "",
                response: "",
                type: "choice",
                choices: [
                  { id: 1, text: "KPMG" },
                  { id: 2, text: "PwC" },
                  { id: 3, text: "EY" },
                  { id: 4, text: "Second tier firm (GT...)" },
                  { id: 5, text: "Regional firm" },
                  { id: 6, text: "Small local firm" },
                ],
              },
            ],
          },
          {
            id: 3,
            name: "Team",
            questions: [
              {
                id: 1,
                question: "Lead Client Service Partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 2,
                question: "Lead audit partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 3,
                question: "Lead tax partner",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 4,
                question: "Industry SME",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 5,
                question: "Primary contact from client service team",
                hint: "",
                response: "",
                type: "text",
              },
              {
                id: 6,
                question: "Audit growth manager",
                hint: "If applicable",
                response: "",
                type: "text",
              },
              {
                id: 7,
                question: "Additional team member names and roles",
                hint: "If applicable",
                response: "",
                type: "multiple text",
                group: true,
                choices: [
                  { id: 1, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 2, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 3, text: "Name", role: "Role", response: "", roleResponse: "" },
                  { id: 4, text: "Name", role: "Role", response: "", roleResponse: "" },
                ],
              },
              {
                id: 8,
                question: "Additional background details and general project comments",
                hint: "",
                response: "",
                type: "textarea",
              },
            ],
          },
        ],
      },]);

    /* src/Sections/Submit.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/Sections/Submit.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[32] = list;
    	child_ctx[33] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[45] = list;
    	child_ctx[46] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[43] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[26] = list;
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (1083:2) {:else}
    function create_else_block_1$1(ctx) {
    	let form;
    	let div1;
    	let div0;
    	let backbutton;
    	let t0;
    	let h2;
    	let t1_value = /*selectedForm*/ ctx[5][0].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let fieldset;
    	let form_transition;
    	let current;
    	let mounted;
    	let dispose;

    	backbutton = new Back({
    			props: {
    				iconBackgroundColor: "#fff",
    				iconColor: "white",
    				itemIconOpacity: "0",
    				iconStrokeWidth: "3rem",
    				back: "true"
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*selectedForm*/ ctx[5][0].sections;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(backbutton.$$.fragment);
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = text(" pursuit request");
    			t3 = space();
    			fieldset = element("fieldset");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "backButton svelte-1pc8cf");
    			add_location(div0, file$4, 1085, 8, 30266);
    			add_location(h2, file$4, 1094, 8, 30536);
    			attr_dev(div1, "class", "formTitleWrapper svelte-1pc8cf");
    			add_location(div1, file$4, 1084, 6, 30227);
    			attr_dev(fieldset, "class", "formSectionsContainer svelte-1pc8cf");
    			add_location(fieldset, file$4, 1099, 6, 30624);
    			attr_dev(form, "action", "");
    			attr_dev(form, "class", "form svelte-1pc8cf");
    			add_location(form, file$4, 1083, 4, 30174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			mount_component(backbutton, div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(form, t3);
    			append_dev(form, fieldset);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*showFormOptions*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*selectedForm*/ 32) && t1_value !== (t1_value = /*selectedForm*/ ctx[5][0].name + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*selectedForm, searching, selectedCity, searchResultsObj, getSelectedCity, searchTerm, searchCities*/ 254) {
    				each_value_1 = /*selectedForm*/ ctx[5][0].sections;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(fieldset, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backbutton.$$.fragment, local);

    			add_render_callback(() => {
    				if (!form_transition) form_transition = create_bidirectional_transition(form, slide, {}, true);
    				form_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backbutton.$$.fragment, local);
    			if (!form_transition) form_transition = create_bidirectional_transition(form, slide, {}, false);
    			form_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(backbutton);
    			destroy_each(each_blocks, detaching);
    			if (detaching && form_transition) form_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(1083:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1048:2) {#if selectedForm.length <= 0}
    function create_if_block$2(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div;
    	let section_intro;
    	let current;
    	let each_value = /*$formsData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Please choose a pursuit category:";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$4, 1049, 6, 29072);
    			attr_dev(div, "class", "formChoiceContainer svelte-1pc8cf");
    			add_location(div, file$4, 1050, 6, 29121);
    			attr_dev(section, "class", "selectForm svelte-1pc8cf");
    			add_location(section, file$4, 1048, 4, 29028);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$formsData*/ 1) {
    				each_value = /*$formsData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!section_intro) {
    				add_render_callback(() => {
    					section_intro = create_in_transition(section, slide, {});
    					section_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(1048:2) {#if selectedForm.length <= 0}",
    		ctx
    	});

    	return block;
    }

    // (1192:64) 
    function create_if_block_11(ctx) {
    	let div1;
    	let label;
    	let t0_value = /*question*/ ctx[31].question + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let div0;
    	let fieldset;
    	let fieldset_id_value;
    	let t2;
    	let each_value_7 = /*question*/ ctx[31].choices;
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			fieldset = element("fieldset");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*question*/ ctx[31].question);
    			add_location(label, file$4, 1193, 20, 35647);
    			attr_dev(fieldset, "class", "options svelte-1pc8cf");
    			attr_dev(fieldset, "id", fieldset_id_value = /*question*/ ctx[31].question);
    			add_location(fieldset, file$4, 1195, 22, 35777);
    			attr_dev(div0, "class", "optionsWrapper svelte-1pc8cf");
    			add_location(div0, file$4, 1194, 20, 35726);
    			attr_dev(div1, "class", "questionContainer svelte-1pc8cf");
    			add_location(div1, file$4, 1192, 18, 35595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, fieldset);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*question*/ ctx[31].question + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*question*/ ctx[31].question)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				each_value_7 = /*question*/ ctx[31].choices;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(fieldset, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && fieldset_id_value !== (fieldset_id_value = /*question*/ ctx[31].question)) {
    				attr_dev(fieldset, "id", fieldset_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(1192:64) ",
    		ctx
    	});

    	return block;
    }

    // (1170:60) 
    function create_if_block_9(ctx) {
    	let div1;
    	let label;
    	let t0_value = /*question*/ ctx[31].question + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let div0;
    	let fieldset;
    	let fieldset_id_value;
    	let t2;
    	let each_value_6 = /*question*/ ctx[31].choices;
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			fieldset = element("fieldset");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*question*/ ctx[31].question);
    			add_location(label, file$4, 1171, 20, 34432);
    			attr_dev(fieldset, "class", "options multipleText svelte-1pc8cf");
    			attr_dev(fieldset, "id", fieldset_id_value = /*question*/ ctx[31].question);
    			toggle_class(fieldset, "multipleTextRole", /*question*/ ctx[31].group === true);
    			add_location(fieldset, file$4, 1173, 22, 34562);
    			attr_dev(div0, "class", "optionsWrapper svelte-1pc8cf");
    			add_location(div0, file$4, 1172, 20, 34511);
    			attr_dev(div1, "class", "questionContainer svelte-1pc8cf");
    			add_location(div1, file$4, 1170, 18, 34380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, fieldset);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*question*/ ctx[31].question + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*question*/ ctx[31].question)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				each_value_6 = /*question*/ ctx[31].choices;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(fieldset, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && fieldset_id_value !== (fieldset_id_value = /*question*/ ctx[31].question)) {
    				attr_dev(fieldset, "id", fieldset_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				toggle_class(fieldset, "multipleTextRole", /*question*/ ctx[31].group === true);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(1170:60) ",
    		ctx
    	});

    	return block;
    }

    // (1150:53) 
    function create_if_block_8(ctx) {
    	let div1;
    	let label;
    	let t0_value = /*question*/ ctx[31].question + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let div0;
    	let fieldset;
    	let fieldset_id_value;
    	let t2;
    	let each_value_5 = /*question*/ ctx[31].choices;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			fieldset = element("fieldset");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*question*/ ctx[31].question);
    			add_location(label, file$4, 1151, 20, 33442);
    			attr_dev(fieldset, "class", "options svelte-1pc8cf");
    			attr_dev(fieldset, "id", fieldset_id_value = /*question*/ ctx[31].question);
    			add_location(fieldset, file$4, 1153, 22, 33572);
    			attr_dev(div0, "class", "optionsWrapper svelte-1pc8cf");
    			add_location(div0, file$4, 1152, 20, 33521);
    			attr_dev(div1, "class", "questionContainer svelte-1pc8cf");
    			add_location(div1, file$4, 1150, 18, 33390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, fieldset);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*question*/ ctx[31].question + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*question*/ ctx[31].question)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				each_value_5 = /*question*/ ctx[31].choices;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(fieldset, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && fieldset_id_value !== (fieldset_id_value = /*question*/ ctx[31].question)) {
    				attr_dev(fieldset, "id", fieldset_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(1150:53) ",
    		ctx
    	});

    	return block;
    }

    // (1118:54) 
    function create_if_block_4(ctx) {
    	let div1;
    	let label;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let if_block0 = /*searching*/ ctx[2] && create_if_block_6(ctx);
    	let if_block1 = /*selectedCity*/ ctx[4] && /*searching*/ ctx[2] === false && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Deloitte office supporting the pursuit (for the letterhead)*";
    			t1 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			attr_dev(label, "for", "office");
    			add_location(label, file$4, 1119, 20, 31675);
    			attr_dev(div0, "class", "office svelte-1pc8cf");
    			toggle_class(div0, "officeSelected", !/*searching*/ ctx[2]);
    			add_location(div0, file$4, 1120, 20, 31784);
    			attr_dev(div1, "class", "questionContainer svelte-1pc8cf");
    			add_location(div1, file$4, 1118, 18, 31623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (/*searching*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div0, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selectedCity*/ ctx[4] && /*searching*/ ctx[2] === false) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*searching*/ 4) {
    				toggle_class(div0, "officeSelected", !/*searching*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(1118:54) ",
    		ctx
    	});

    	return block;
    }

    // (1113:55) 
    function create_if_block_3$2(ctx) {
    	let div;
    	let label;
    	let t0_value = /*question*/ ctx[31].question + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let textarea;
    	let textarea_id_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function textarea_input_handler() {
    		/*textarea_input_handler*/ ctx[15].call(textarea, /*each_value_2*/ ctx[32], /*question_index*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*question*/ ctx[31].question);
    			add_location(label, file$4, 1114, 20, 31354);
    			attr_dev(textarea, "class", "text svelte-1pc8cf");
    			attr_dev(textarea, "id", textarea_id_value = /*question*/ ctx[31].question);
    			attr_dev(textarea, "type", "text");
    			add_location(textarea, file$4, 1115, 20, 31433);
    			attr_dev(div, "class", "questionContainer svelte-1pc8cf");
    			add_location(div, file$4, 1113, 18, 31302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*question*/ ctx[31].response);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", textarea_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*question*/ ctx[31].question + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*question*/ ctx[31].question)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && textarea_id_value !== (textarea_id_value = /*question*/ ctx[31].question)) {
    				attr_dev(textarea, "id", textarea_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				set_input_value(textarea, /*question*/ ctx[31].response);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(1113:55) ",
    		ctx
    	});

    	return block;
    }

    // (1108:16) {#if question.type === "text"}
    function create_if_block_2$2(ctx) {
    	let div;
    	let label;
    	let t0_value = /*question*/ ctx[31].question + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let input;
    	let input_id_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[14].call(input, /*each_value_2*/ ctx[32], /*question_index*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*question*/ ctx[31].question);
    			add_location(label, file$4, 1109, 20, 31035);
    			attr_dev(input, "class", "text svelte-1pc8cf");
    			attr_dev(input, "id", input_id_value = /*question*/ ctx[31].question);
    			attr_dev(input, "type", "text");
    			add_location(input, file$4, 1110, 20, 31114);
    			attr_dev(div, "class", "questionContainer svelte-1pc8cf");
    			add_location(div, file$4, 1108, 18, 30983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*question*/ ctx[31].response);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*question*/ ctx[31].question + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*question*/ ctx[31].question)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input_id_value !== (input_id_value = /*question*/ ctx[31].question)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input.value !== /*question*/ ctx[31].response) {
    				set_input_value(input, /*question*/ ctx[31].response);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(1108:16) {#if question.type === \\\"text\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1197:24) {#each question.choices as choice}
    function create_each_block_7(ctx) {
    	let div;
    	let label;
    	let t0_value = (/*choice*/ ctx[40]?.text || "") + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let textarea;
    	let textarea_label_value;
    	let textarea_id_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function textarea_input_handler_1() {
    		/*textarea_input_handler_1*/ ctx[23].call(textarea, /*each_value_7*/ ctx[45], /*choice_index_1*/ ctx[46]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			attr_dev(label, "class", "hidden");
    			attr_dev(label, "for", label_for_value = /*choice*/ ctx[40].id);
    			add_location(label, file$4, 1198, 28, 35972);
    			attr_dev(textarea, "label", textarea_label_value = /*choice*/ ctx[40].text);
    			attr_dev(textarea, "id", textarea_id_value = /*choice*/ ctx[40].id);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "svelte-1pc8cf");
    			add_location(textarea, file$4, 1199, 28, 36068);
    			attr_dev(div, "class", "option textOption svelte-1pc8cf");
    			add_location(div, file$4, 1197, 26, 35912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*choice*/ ctx[40].response);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", textarea_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = (/*choice*/ ctx[40]?.text || "") + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*choice*/ ctx[40].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && textarea_label_value !== (textarea_label_value = /*choice*/ ctx[40].text)) {
    				attr_dev(textarea, "label", textarea_label_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && textarea_id_value !== (textarea_id_value = /*choice*/ ctx[40].id)) {
    				attr_dev(textarea, "id", textarea_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				set_input_value(textarea, /*choice*/ ctx[40].response);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(1197:24) {#each question.choices as choice}",
    		ctx
    	});

    	return block;
    }

    // (1183:28) {#if choice?.role}
    function create_if_block_10(ctx) {
    	let label;
    	let t0_value = (/*choice*/ ctx[40]?.role || "") + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let input;
    	let input_id_value;
    	let mounted;
    	let dispose;

    	function input_input_handler_3() {
    		/*input_input_handler_3*/ ctx[22].call(input, /*each_value_6*/ ctx[43], /*idx*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "class", "hidden");
    			attr_dev(label, "for", label_for_value = /*choice*/ ctx[40].id);
    			add_location(label, file$4, 1183, 30, 35159);
    			attr_dev(input, "id", input_id_value = /*choice*/ ctx[40].id);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1pc8cf");
    			add_location(input, file$4, 1184, 30, 35257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*choice*/ ctx[40].roleResponse);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = (/*choice*/ ctx[40]?.role || "") + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*choice*/ ctx[40].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input_id_value !== (input_id_value = /*choice*/ ctx[40].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input.value !== /*choice*/ ctx[40].roleResponse) {
    				set_input_value(input, /*choice*/ ctx[40].roleResponse);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(1183:28) {#if choice?.role}",
    		ctx
    	});

    	return block;
    }

    // (1179:24) {#each question.choices as choice, idx}
    function create_each_block_6(ctx) {
    	let div;
    	let label;
    	let t0_value = (/*choice*/ ctx[40]?.text || "") + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let input;
    	let input_id_value;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_input_handler_2() {
    		/*input_input_handler_2*/ ctx[21].call(input, /*each_value_6*/ ctx[43], /*idx*/ ctx[44]);
    	}

    	let if_block = /*choice*/ ctx[40]?.role && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr_dev(label, "class", "hidden");
    			attr_dev(label, "for", label_for_value = /*choice*/ ctx[40].id);
    			add_location(label, file$4, 1180, 28, 34919);
    			attr_dev(input, "id", input_id_value = /*choice*/ ctx[40].id);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1pc8cf");
    			add_location(input, file$4, 1181, 28, 35016);
    			attr_dev(div, "class", "option textOption svelte-1pc8cf");
    			add_location(div, file$4, 1179, 26, 34859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*choice*/ ctx[40].response);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_2);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = (/*choice*/ ctx[40]?.text || "") + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm*/ 32 && label_for_value !== (label_for_value = /*choice*/ ctx[40].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input_id_value !== (input_id_value = /*choice*/ ctx[40].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input.value !== /*choice*/ ctx[40].response) {
    				set_input_value(input, /*choice*/ ctx[40].response);
    			}

    			if (/*choice*/ ctx[40]?.role) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(div, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(1179:24) {#each question.choices as choice, idx}",
    		ctx
    	});

    	return block;
    }

    // (1155:24) {#each question.choices as choice}
    function create_each_block_5(ctx) {
    	let div;
    	let input;
    	let input_label_value;
    	let input_id_value;
    	let input_value_value;
    	let t;
    	let mounted;
    	let dispose;
    	/*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]] = /*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]] || [];
    	/*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]][/*section_index*/ ctx[30]] = [];

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[19].call(input, /*each_value_2*/ ctx[32], /*question_index*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			attr_dev(input, "label", input_label_value = /*choice*/ ctx[40].text);
    			attr_dev(input, "id", input_id_value = /*choice*/ ctx[40].text);
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*choice*/ ctx[40].text;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-1pc8cf");
    			/*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]][/*section_index*/ ctx[30]].push(input);
    			add_location(input, file$4, 1156, 28, 33756);
    			attr_dev(div, "class", "option svelte-1pc8cf");
    			add_location(div, file$4, 1155, 26, 33707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = input.__value === /*question*/ ctx[31].response;
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*selectedForm*/ 32 && input_label_value !== (input_label_value = /*choice*/ ctx[40].text)) {
    				attr_dev(input, "label", input_label_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input_id_value !== (input_id_value = /*choice*/ ctx[40].text)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*selectedForm*/ 32 && input_value_value !== (input_value_value = /*choice*/ ctx[40].text)) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty[0] & /*selectedForm*/ 32) {
    				input.checked = input.__value === /*question*/ ctx[31].response;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]][/*section_index*/ ctx[30]].splice(/*$$binding_groups*/ ctx[20][0][/*question_index*/ ctx[33]][/*section_index*/ ctx[30]].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(1155:24) {#each question.choices as choice}",
    		ctx
    	});

    	return block;
    }

    // (1122:22) {#if searching}
    function create_if_block_6(ctx) {
    	let input;
    	let t;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*searchTerm*/ ctx[1] !== "" && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(input, "id", "office");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1pc8cf");
    			add_location(input, file$4, 1122, 24, 31901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*searchTerm*/ ctx[1]);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[16]),
    					listen_dev(input, "keyup", /*searchCities*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchTerm*/ 2 && input.value !== /*searchTerm*/ ctx[1]) {
    				set_input_value(input, /*searchTerm*/ ctx[1]);
    			}

    			if (/*searchTerm*/ ctx[1] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(1122:22) {#if searching}",
    		ctx
    	});

    	return block;
    }

    // (1124:24) {#if searchTerm !== ""}
    function create_if_block_7(ctx) {
    	let ul;
    	let each_value_3 = /*searchResultsObj*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$2(get_each_context_3$2(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1pc8cf");
    			add_location(ul, file$4, 1124, 26, 32057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResultsObj, getSelectedCity*/ 136) {
    				each_value_3 = /*searchResultsObj*/ ctx[3];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$2(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(1124:24) {#if searchTerm !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1127:30) {#each result as resultCity}
    function create_each_block_4$1(ctx) {
    	let li;
    	let span;
    	let t0_value = /*resultCity*/ ctx[37].city + "";
    	let t0;
    	let t1;
    	let t2_value = /*resultCity*/ ctx[37].address + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[17](/*resultCity*/ ctx[37]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(", ");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(span, file$4, 1128, 34, 32321);
    			attr_dev(li, "class", "resultOffice svelte-1pc8cf");
    			add_location(li, file$4, 1127, 32, 32216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*searchResultsObj*/ 8 && t0_value !== (t0_value = /*resultCity*/ ctx[37].city + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*searchResultsObj*/ 8 && t2_value !== (t2_value = /*resultCity*/ ctx[37].address + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(1127:30) {#each result as resultCity}",
    		ctx
    	});

    	return block;
    }

    // (1126:28) {#each searchResultsObj as result}
    function create_each_block_3$2(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*result*/ ctx[34];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getSelectedCity, searchResultsObj*/ 136) {
    				each_value_4 = /*result*/ ctx[34];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$2.name,
    		type: "each",
    		source: "(1126:28) {#each searchResultsObj as result}",
    		ctx
    	});

    	return block;
    }

    // (1137:22) {#if selectedCity && searching === false}
    function create_if_block_5(ctx) {
    	let div6;
    	let div4;
    	let div0;
    	let t0_value = /*selectedCity*/ ctx[4].city + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*selectedCity*/ ctx[4].address + "";
    	let t2;
    	let t3;
    	let div2;
    	let span0;
    	let t5;
    	let t6_value = /*selectedCity*/ ctx[4].phone + "";
    	let t6;
    	let t7;
    	let div3;
    	let span1;
    	let t9;
    	let t10_value = /*selectedCity*/ ctx[4].fax + "";
    	let t10;
    	let t11;
    	let div5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Phone:";
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "Fax:";
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			div5 = element("div");
    			div5.textContent = "Change";
    			attr_dev(div0, "class", "city svelte-1pc8cf");
    			add_location(div0, file$4, 1139, 28, 32787);
    			add_location(div1, file$4, 1140, 28, 32859);
    			attr_dev(span0, "class", "svelte-1pc8cf");
    			add_location(span0, file$4, 1141, 47, 32940);
    			attr_dev(div2, "class", "phone svelte-1pc8cf");
    			add_location(div2, file$4, 1141, 28, 32921);
    			attr_dev(span1, "class", "svelte-1pc8cf");
    			add_location(span1, file$4, 1142, 45, 33032);
    			attr_dev(div3, "class", "fax svelte-1pc8cf");
    			add_location(div3, file$4, 1142, 28, 33015);
    			attr_dev(div4, "class", "selectedCityDetails");
    			add_location(div4, file$4, 1138, 26, 32725);
    			attr_dev(div5, "class", "changeIcon svelte-1pc8cf");
    			add_location(div5, file$4, 1144, 26, 33134);
    			attr_dev(div6, "class", "selectedCityWrapper svelte-1pc8cf");
    			add_location(div6, file$4, 1137, 24, 32665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div4);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, span1);
    			append_dev(div3, t9);
    			append_dev(div3, t10);
    			append_dev(div6, t11);
    			append_dev(div6, div5);

    			if (!mounted) {
    				dispose = listen_dev(div5, "click", /*click_handler_2*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedCity*/ 16 && t0_value !== (t0_value = /*selectedCity*/ ctx[4].city + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*selectedCity*/ 16 && t2_value !== (t2_value = /*selectedCity*/ ctx[4].address + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*selectedCity*/ 16 && t6_value !== (t6_value = /*selectedCity*/ ctx[4].phone + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*selectedCity*/ 16 && t10_value !== (t10_value = /*selectedCity*/ ctx[4].fax + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(1137:22) {#if selectedCity && searching === false}",
    		ctx
    	});

    	return block;
    }

    // (1107:14) {#each section.questions as question}
    function create_each_block_2$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*question*/ ctx[31].type === "text") return create_if_block_2$2;
    		if (/*question*/ ctx[31].type === "textarea") return create_if_block_3$2;
    		if (/*question*/ ctx[31].type === "offices") return create_if_block_4;
    		if (/*question*/ ctx[31].type === "choice") return create_if_block_8;
    		if (/*question*/ ctx[31].type === "multiple text") return create_if_block_9;
    		if (/*question*/ ctx[31].type === "multiple textarea") return create_if_block_11;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(1107:14) {#each section.questions as question}",
    		ctx
    	});

    	return block;
    }

    // (1101:8) {#each selectedForm[0].sections as section}
    function create_each_block_1$2(ctx) {
    	let section;
    	let h3;
    	let t0_value = /*section*/ ctx[28].name + "";
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let each_value_2 = /*section*/ ctx[28].questions;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(h3, "class", "svelte-1pc8cf");
    			add_location(h3, file$4, 1102, 12, 30769);
    			attr_dev(div, "class", "formSectionContent svelte-1pc8cf");
    			add_location(div, file$4, 1105, 12, 30833);
    			attr_dev(section, "class", "formSection svelte-1pc8cf");
    			add_location(section, file$4, 1101, 10, 30727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, t0);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(section, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedForm*/ 32 && t0_value !== (t0_value = /*section*/ ctx[28].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*selectedForm, searching, selectedCity, searchResultsObj, getSelectedCity, searchTerm, searchCities*/ 254) {
    				each_value_2 = /*section*/ ctx[28].questions;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(1101:8) {#each selectedForm[0].sections as section}",
    		ctx
    	});

    	return block;
    }

    // (1070:12) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let largeplant;
    	let current;
    	largeplant = new SmallPlant({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(largeplant.$$.fragment);
    			attr_dev(div, "class", "formChoiceImg smallPlant svelte-1pc8cf");
    			add_location(div, file$4, 1070, 14, 29903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(largeplant, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(largeplant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(largeplant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(largeplant);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(1070:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1066:12) {#if formData.img === "large"}
    function create_if_block_1$2(ctx) {
    	let div;
    	let smallplant;
    	let current;
    	smallplant = new LargePlant({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(smallplant.$$.fragment);
    			attr_dev(div, "class", "formChoiceImg largePlant svelte-1pc8cf");
    			add_location(div, file$4, 1066, 14, 29778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(smallplant, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(smallplant.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(smallplant.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(smallplant);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(1066:12) {#if formData.img === \\\"large\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1052:8) {#each $formsData as formData}
    function create_each_block$2(ctx) {
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let div0;
    	let t1_value = /*formData*/ ctx[25].name + "";
    	let t1;
    	let t2;
    	let div1_intro;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*formData*/ ctx[25].img === "large") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[9](/*formData*/ ctx[25], /*each_value*/ ctx[26], /*formData_index*/ ctx[27]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[10](/*formData*/ ctx[25], /*each_value*/ ctx[26], /*formData_index*/ ctx[27]);
    	}

    	function mouseout_handler() {
    		return /*mouseout_handler*/ ctx[11](/*formData*/ ctx[25], /*each_value*/ ctx[26], /*formData_index*/ ctx[27]);
    	}

    	function blur_handler() {
    		return /*blur_handler*/ ctx[12](/*formData*/ ctx[25], /*each_value*/ ctx[26], /*formData_index*/ ctx[27]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[13](/*formData*/ ctx[25], /*each_value*/ ctx[26], /*formData_index*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "formChoice svelte-1pc8cf");
    			add_location(div0, file$4, 1075, 12, 30025);
    			attr_dev(div1, "class", "formChoiceWrapper svelte-1pc8cf");
    			toggle_class(div1, "formChoiceHovered", /*formData*/ ctx[25].hovered === true);
    			add_location(div1, file$4, 1052, 10, 29204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div1, "focus", focus_handler, false, false, false),
    					listen_dev(div1, "mouseout", mouseout_handler, false, false, false),
    					listen_dev(div1, "blur", blur_handler, false, false, false),
    					listen_dev(div1, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, t0);
    			}

    			if ((!current || dirty[0] & /*$formsData*/ 1) && t1_value !== (t1_value = /*formData*/ ctx[25].name + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*$formsData*/ 1) {
    				toggle_class(div1, "formChoiceHovered", /*formData*/ ctx[25].hovered === true);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { y: -30, duration: 300 });
    					div1_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(1052:8) {#each $formsData as formData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedForm*/ ctx[5].length <= 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Submit request";
    			t1 = space();
    			if_block.c();
    			attr_dev(h1, "class", "svelte-1pc8cf");
    			add_location(h1, file$4, 1045, 4, 28958);
    			attr_dev(div, "class", "titleWrapper svelte-1pc8cf");
    			add_location(div, file$4, 1044, 2, 28927);
    			attr_dev(section, "class", "container svelte-1pc8cf");
    			add_location(section, file$4, 1043, 0, 28897);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h1);
    			append_dev(section, t1);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCityDetails(e) {
    	
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let selectedForm;
    	let $formsData;
    	validate_store(formsData, 'formsData');
    	component_subscribe($$self, formsData, $$value => $$invalidate(0, $formsData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Submit', slots, []);

    	let states = [
    		{
    			id: 1,
    			state: "Alabama",
    			cities: [
    				{
    					id: 1,
    					city: "Birmingham ",
    					address: "420 North 20th Street, Suite 2400, Birmingham, AL, 35203-3289, United States",
    					phone: "+1 205 321 6000",
    					fax: "+1 205 322 2828"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Arizona ",
    			cities: [
    				{
    					id: 1,
    					city: "Phoenix ",
    					address: "2901 North Central Avenue, Suite 1200, Phoenix, AZ, 85012-2799, United States",
    					phone: "+1 602 234 5100",
    					fax: "+1 602 234 5186"
    				},
    				{
    					id: 1,
    					city: "Gilbert ",
    					address: "310 E. Rivulon Blvd, Gilbert, AZ, 85297, United States",
    					phone: "+1 480 319 8400",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Gilbert ",
    					address: "300 East Rivulon Boulevard, Gilbert, AZ, 85297, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "California",
    			cities: [
    				{
    					id: 1,
    					city: "Costa Mesa ",
    					address: "695 Town Center Dr., Suite 1000, Costa Mesa, CA, 92626, United States",
    					phone: "+1 714 436 7100",
    					fax: "+1 714 436 7200"
    				},
    				{
    					id: 1,
    					city: "Fresno ",
    					address: "5250 N Palm Ave, Suite 300, Fresno, CA, 93704, United States",
    					phone: "+1 559 449 6300",
    					fax: "+1 559 431 5244"
    				},
    				{
    					id: 1,
    					city: "Los Angeles ",
    					address: "555 West 5th Street, Suite 2700, Los Angeles, CA, 90013-1010, United States",
    					phone: "+1 213 688 0800",
    					fax: "+1 213 688 0100"
    				},
    				{
    					id: 1,
    					city: "Pleasanton ",
    					address: "6210 Stoneridge Mall Road, Suite 250, Pleasanton, CA, 94588, United States",
    					phone: "+1 925 965 2800",
    					fax: "+1 925 965 2800"
    				},
    				{
    					id: 1,
    					city: "Sacramento ",
    					address: "980 9th Street, Suite 1800, Sacramento, CA, 95814, United States",
    					phone: "+1 916 288 3100",
    					fax: "+1 866 719 2934"
    				},
    				{
    					id: 1,
    					city: "San Diego ",
    					address: "12830 El Camino Real, Suite 600, San Diego, CA, 92130, United States",
    					phone: "+1 619 232 6500",
    					fax: "+1 619 237 6801"
    				},
    				{
    					id: 1,
    					city: "San Francisco ",
    					address: "555 Mission Street, Suite 1400, San Francisco, CA, 94105, United States",
    					phone: "+1 415 783 4000",
    					fax: "+1 415 783 4329"
    				},
    				{
    					id: 1,
    					city: "San Jose ",
    					address: "225 West Santa Clara Street, Suite 600, San Jose, CA, 95113-2303, United States",
    					phone: "+1 408 704 4000",
    					fax: "+1 408 704 3083"
    				},
    				{
    					id: 1,
    					city: "San Francisco (Heat) ",
    					address: "1100 Sansome Street, San Francisco (Heat), CA, 94111, United States",
    					phone: "+1 415 477 1999",
    					fax: "+1 415 477 1990"
    				},
    				{
    					id: 1,
    					city: "Manhattan Beach ",
    					address: "1600 Rosecrans Boulevard. Building 7, Suite 200, Manhattan Beach, CA, 90266, United States",
    					phone: "+1 213 593 4600",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "San Diego-DIA ",
    					address: "350 Tenth Avenue, 8th Floor, Diamond View, San Diego, CA, 92101, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Colorado",
    			cities: [
    				{
    					id: 1,
    					city: "Denver-DD ",
    					address: "1455 16th Street, Suite 307, Denver, CO, 80202, United States",
    					phone: "+1 303 446 6920",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Denver ",
    					address: "1601 Wewatta Street, Suite 400, Denver, CO, 80202, United States",
    					phone: "+1  303 292 5400",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Colorado Springs  ",
    					address: "559 E Pikes Peak Avenue, Suite 301, Colorado Springs, CO, 80903, United States",
    					phone: "+1 719 424 3810",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Connecticut",
    			cities: [
    				{
    					id: 1,
    					city: "Hartford ",
    					address: "City Place I, 185 Asylum Street, 33rd Floor, Hartford, CT, 06103-3402, United States",
    					phone: "+1 860 725 3000",
    					fax: "+1 860 725 3500"
    				},
    				{
    					id: 1,
    					city: "Stamford ",
    					address: "695 East Main Street, 6th Floor, Stamford, CT, 06901, United States",
    					phone: "+1 203 708 4000",
    					fax: "+1 203 708 4000"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "District of Columbia",
    			cities: [
    				{
    					id: 1,
    					city: "Washington ",
    					address: "555 12th Street NW, Suite 400, Washington, DC, 20004, United States",
    					phone: "+1 202 879 5600",
    					fax: "+1 202 879 5309"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Florida",
    			cities: [
    				{
    					id: 1,
    					city: "Boca Raton ",
    					address: "1800 N Military Trail, Suite 200, Boca Raton, FL, 33431, United States",
    					phone: "+1 561 962 7700",
    					fax: "+1 561 962 7750"
    				},
    				{
    					id: 1,
    					city: "Jacksonville ",
    					address: "50 North Laura Street, Suite 3400, Jacksonville, FL, 32202, United States",
    					phone: "+1 904 665 1400",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Miami ",
    					address: "333 Southeast 2nd Avenue, Suite 3600, Miami, FL, 33131, United States",
    					phone: "+1 305 372 3100",
    					fax: "+1 305 372 3160"
    				},
    				{
    					id: 1,
    					city: "Tallahassee ",
    					address: "215 South Monroe Street, Suite 100, Tallahassee, FL, 32301, United States",
    					phone: "+1 850 521 4800",
    					fax: "+1 850 521 4830"
    				},
    				{
    					id: 1,
    					city: "Tampa ",
    					address: "Tampa City Center, 201 North Franklin Street, Suite 3600, Tampa, FL, 33602, United States",
    					phone: "+1 813 273 8300",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Panama City ",
    					address: "2908 Thomas Drive, Unit E, Panama City, FL, 32408, United States",
    					phone: "+1 850 235 4239",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Lake Mary ",
    					address: "901 International Parkway, Suite 100, Lake Mary, FL, 32746, United States",
    					phone: "+1 407 710 4500",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Lake Mary ",
    					address: "1001 Heathrow Park Lane, Lake Mary, FL, 32746, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Georgia",
    			cities: [
    				{
    					id: 1,
    					city: "Atlanta   ",
    					address: "191 Peachtree Street NE, Suite 2000, Atlanta, GA, 30303-1943, United States",
    					phone: "+1 404 631 2000",
    					fax: "+1 404 220 1583"
    				}
    			]
    		},
    		{ id: 1, state: "Guam", cities: [] },
    		{
    			id: 1,
    			state: "Hawaii",
    			cities: [
    				{
    					id: 1,
    					city: "Honolulu ",
    					address: "999 Bishop Street, Suite 2700, Honolulu, HI, 96813, United States",
    					phone: "+1 808 543 0700",
    					fax: "+1 855 214 5030"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Idaho",
    			cities: [
    				{
    					id: 1,
    					city: "Boise ",
    					address: "800 West Main Street, Suite 1400, Boise, ID, 83702, United States",
    					phone: "+1 208 342 9361",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Illinois",
    			cities: [
    				{
    					id: 1,
    					city: "Chicago ",
    					address: "111 S. Wacker Drive, Suite 1800, Chicago, IL, 60606-4301, United States",
    					phone: "+1 312 486 1000",
    					fax: "+1 312 486 1486"
    				},
    				{
    					id: 1,
    					city: "O'Fallon ",
    					address: "715 Seibert Rd.,, Suite 3, O'Fallon, IL, 62225, United States",
    					phone: "+1 618 222 3800",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Indiana",
    			cities: [
    				{
    					id: 1,
    					city: "Indianapolis ",
    					address: "Chase Tower, 111 Monument Circle, Suite 4200, Indianapolis, IN, 46204-5108, United States",
    					phone: "+1 317 464 8600",
    					fax: "+1 317 464 8500"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Iowa",
    			cities: [
    				{
    					id: 1,
    					city: "Davenport ",
    					address: "4550 East 53rd Street, Suite 110, Davenport, IA, 52807-3171, United States",
    					phone: "+1 563 322 4415",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Des Moines ",
    					address: "699 Walnut St., Suite 1800, Des Moines, IA, 50309, United States",
    					phone: "+1 515 288 1200",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Kentucky",
    			cities: [
    				{
    					id: 1,
    					city: "Louisville ",
    					address: "220 W Main Street, Suite 2100, Louisville, KY, 40202, United States",
    					phone: "+1 502 562 2000",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Louisiana",
    			cities: [
    				{
    					id: 1,
    					city: "New Orleans ",
    					address: "701 Poydras Street, Suite 4200, New Orleans, LA, 70139, United States",
    					phone: "+1 504 581 2727",
    					fax: "+1 504 561 7293"
    				},
    				{
    					id: 1,
    					city: "Baton Rouge ",
    					address: "100 North Street, Baton Rouge, LA, 70802, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Maryland",
    			cities: [
    				{
    					id: 1,
    					city: "Baltimore ",
    					address: "500 East Pratt St., Suite 500, Baltimore, MD, 20201-2713, United States",
    					phone: "+1 410 576 6700",
    					fax: "+1 410 837 0510"
    				},
    				{
    					id: 1,
    					city: "Lexington Park ",
    					address: "22454 Three Notch Road, Suite 200, Lexington Park, MD, 20653, United States",
    					phone: "+1 240 237 4500",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Bethesda ",
    					address: "6555 Rock Spring Drive, Suite 240, Bethesda, MD, 20817, United States",
    					phone: "none",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Rockville (GPS) ",
    					address: "12300 Twinbrook Parkway, Rockville, MD, 20852, United States",
    					phone: "none",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Baltimore ",
    					address: "7111 Security Boulevard, Baltimore, MD, 21244, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Massachusetts",
    			cities: [
    				{
    					id: 1,
    					city: "Boston ",
    					address: "200 Berkeley Street, 10th Floor, Boston, MA, 02116, United States",
    					phone: "+1 617 437 2000",
    					fax: "+1 617 437 2111"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Michigan",
    			cities: [
    				{
    					id: 1,
    					city: "Detroit ",
    					address: "200 Renaissance Center, Suite 3900, Detroit, MI, 48243-1313, United States",
    					phone: "+1 313 396 3000",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Grand Rapids ",
    					address: "38 Commerce Ave SW, Suite 500, Grand Rapids, MI, 49503-4252, United States",
    					phone: "+1 616 336 7900",
    					fax: "+1 616 336 7850"
    				},
    				{
    					id: 1,
    					city: "Midland ",
    					address: "3320 Ridgecrest Building, 3320 Ridgecrest Drive, Suite 400, Midland, MI, 48642, United States",
    					phone: "+1 989 631 2370",
    					fax: "+1 989 631 4485"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Minnesota",
    			cities: [
    				{
    					id: 1,
    					city: "Minneapolis ",
    					address: "50 S 6th Street, Suite 2800, Minneapolis, MN, 55402-1844, United States",
    					phone: "+1 612 397 4000",
    					fax: "+1 612 397 4450"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Missouri",
    			cities: [
    				{
    					id: 1,
    					city: "Kansas City ",
    					address: "1100 Walnut Street, Suite 3300, Kansas City, MO, 64106, United States",
    					phone: "+1 816 474 6180",
    					fax: "+1 816 881 5131"
    				},
    				{
    					id: 1,
    					city: "St. Louis ",
    					address: "100 S. 4th Street,, Suite 300, St. Louis, MO, 63102, United States",
    					phone: "+1 314 342 4900",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Nebraska",
    			cities: [
    				{
    					id: 1,
    					city: "Omaha ",
    					address: "1601 Dodge Street, Suite 3100, Omaha, NE, 68102-9706, United States",
    					phone: "+1 402 346 7788",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Nevada",
    			cities: [
    				{
    					id: 1,
    					city: "Las Vegas ",
    					address: "3883 H. Hughes Parkway, Suite 400, Las Vegas, NV, 89169, United States",
    					phone: "+1 702 893 3100",
    					fax: "+1 702 893 3298"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "New Jersey",
    			cities: [
    				{
    					id: 1,
    					city: "Jersey City ",
    					address: "3 Second Street, Suite 400, Harborside Plaza 10, Jersey City, NJ, 07311, United States",
    					phone: "+1 212 937 8202",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Parsippany ",
    					address: "100 Kimball Drive, Parsippany, NJ, 07054, United States",
    					phone: "+1 973 602 6000",
    					fax: "+1 973 602 5050"
    				},
    				{
    					id: 1,
    					city: "Princeton ",
    					address: "500 College Road East, Princeton, NJ, 08540, United States",
    					phone: "+1 609 514 3600",
    					fax: "+1 609 514 3603"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "New York",
    			cities: [
    				{
    					id: 1,
    					city: "NYC - 30 Rock (HQ) ",
    					address: "New York - National Office, 30 Rockefeller Plaza, 41st floor, New York, NY, 10112-0015, United States",
    					phone: "+1 212 492 4000",
    					fax: "+1 212 489 1687"
    				},
    				{
    					id: 1,
    					city: "Jericho ",
    					address: "2 Jericho Plaza, Jericho, NY, 11753, United States",
    					phone: "+1 516 918 7000",
    					fax: "+1 516 827 3980"
    				},
    				{
    					id: 1,
    					city: "Rochester ",
    					address: "910 Bausch &amp; Lomb Place, Rochester, NY, 14604, United States",
    					phone: "+1 585 238 3300",
    					fax: "+1 585 232 2890"
    				},
    				{
    					id: 1,
    					city: "Buffalo ",
    					address: "Sheridan Meadows Corporate Park North, 6500 Sheridan Drive, Suite 216, Williamsville, NY, 14221-4842, United States",
    					phone: "+1 716 843 7200",
    					fax: "+1 716 856 7760"
    				},
    				{
    					id: 1,
    					city: "NYC-Deloitte Digital ",
    					address: "330 Hudson Street, 9th Floor, New York, NY, 10013 , United States",
    					phone: "+1 212 829 6000",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "New York ",
    					address: "1221 Avenue of the Americas, 39th Floor, New York, NY, 10020, United States",
    					phone: "+1 646 901 5000",
    					fax: "+1 646 901 5001"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "North Carolina",
    			cities: [
    				{
    					id: 1,
    					city: "Charlotte ",
    					address: "650 S. Tryon Street, Suite 1800, Charlotte, NC, 28202-4200, United States",
    					phone: "+1 704 887 1500",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Raleigh ",
    					address: "150 Fayetteville Street Mall, Suite 1000, Raleigh, NC, 27601-2957, United States",
    					phone: "+1 919 546 8000",
    					fax: "+1 919 833 3276"
    				},
    				{
    					id: 1,
    					city: "Greensboro ",
    					address: "303 Pisgah Church Road, Suite 2A, Greensboro, NC, 27455, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Ohio",
    			cities: [
    				{
    					id: 1,
    					city: "Cincinnati ",
    					address: "50 W 5th Street, Suite 200, Cincinnati, OH, 45202-3789, United States",
    					phone: "+1 513 784 7100",
    					fax: "+1 513 784 7204"
    				},
    				{
    					id: 1,
    					city: "Cleveland ",
    					address: "127 Public Square, 2600 Key Center, Suite 3300, Cleveland, OH, 44114-1291, United States",
    					phone: "+1 216 589 1300",
    					fax: "+1 216 589 1369"
    				},
    				{
    					id: 1,
    					city: "Columbus ",
    					address: "180 East Broad Street, 14th Floor, Suite 1400, Columbus, OH, 43215-3611, United States",
    					phone: "+1 614 221 1000",
    					fax: "+1 614 229 4647"
    				},
    				{
    					id: 1,
    					city: "Dayton ",
    					address: "711 E. Monument Ave., Suite 300, Dayton, OH, 45402-1320, United States",
    					phone: "+1 937 223 8821",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Oklahoma",
    			cities: [
    				{
    					id: 1,
    					city: "Tulsa ",
    					address: "6100 South Yale Avenue, Suite 2010, Tulsa, OK, 74136, United States",
    					phone: "+1 918 477 8800",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Oklahoma City ",
    					address: "100 North Broadway, #3250, Oklahoma City, OK, 73102, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Oregon",
    			cities: [
    				{
    					id: 1,
    					city: "Portland ",
    					address: "111 SW 5th Avenue, Suite 3900, Portland, OR, 97204-3642, United States",
    					phone: "+1 503 222 1341",
    					fax: "+1 503 224 2172"
    				},
    				{
    					id: 1,
    					city: "Salem (GPS) ",
    					address: "117 Commercial Street NE, Salem (GPS), OR, 97301, United States",
    					phone: "+1 971 915 5100",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Pennsylvania",
    			cities: [
    				{
    					id: 1,
    					city: "Camp Hill ",
    					address: "300 Corporate Center Drive, 1, 3, 4 floors, Camp Hill, PA, 17011, United States",
    					phone: "+1 717 695 5200",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Glen Mills ",
    					address: "1 Braxton Way, Glen Mills (DTTL), PA, 19342, United States",
    					phone: "+1 610 479 3900",
    					fax: "+1 610 479 3200"
    				},
    				{
    					id: 1,
    					city: "Philadelphia ",
    					address: "1700 Market Street, Suite 2700, Philadelphia, PA, 19103, United States",
    					phone: "+1 215 246 2300",
    					fax: "+1 215 569 2441"
    				},
    				{
    					id: 1,
    					city: "Pittsburgh ",
    					address: "One PPG Place, Suite 2600, Pittsburgh, PA, 15222-5443, United States",
    					phone: "+1 215 957 1999",
    					fax: "+1 412 338 7380"
    				},
    				{
    					id: 1,
    					city: "Harrisburg ",
    					address: "30 North Third Street, Suite 800, Harrisburg, PA, 17101, United States",
    					phone: "+1 412 338 7200",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Mechanicsburg  ",
    					address: "200 Sterling Parkway, Mechanicsburg, PA, 17050-2938, United States",
    					phone: "+1 717 651 6200",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Mechanicsburg  ",
    					address: "300 Sterling Parkway, 3rd Floor, Mechanicsburg, PA, 17050, United States",
    					phone: "+1 717 695 5000",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Puerto Rico",
    			cities: [
    				{
    					id: 1,
    					city: "San Juan ",
    					address: "350 Carlos Chardon Avenue, Hato Rey, Suite 700, San Juan, PR, 00917-2140, United States",
    					phone: "+1 787 759 7171",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Tennessee",
    			cities: [
    				{
    					id: 1,
    					city: "Hermitage ",
    					address: "4022 Sells Dr., Hermitage, TN, 37076-2930, United States",
    					phone: "+1 615 882 7600",
    					fax: "+1 615 882 6600"
    				},
    				{
    					id: 1,
    					city: "Memphis ",
    					address: "6075 Poplar Avenue, Suite 350, Memphis, TN, 38119-0112, United States",
    					phone: "+1 901 322 6700",
    					fax: "+1 901 322 6799"
    				},
    				{
    					id: 1,
    					city: "Nashville ",
    					address: "1033 Demonbreun Street, Suite 400, Nashville, TN, 37203, United States",
    					phone: "+1 615 259 1800",
    					fax: "+1 615 259 1862"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Texas",
    			cities: [
    				{
    					id: 1,
    					city: "Austin ",
    					address: "500 West 2nd Street, Suite 1600, Austin, TX, 78701, United States",
    					phone: "+1 512 691 2300",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Austin ",
    					address: "7700 West Parmer Lane, Building C, Ste. 375, Austin, TX, 78729, United States",
    					phone: "+1 512 498 7400",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Dallas ",
    					address: "2200 Ross Ave., Suite 1600, Dallas, TX, 75201, United States",
    					phone: "+1 214 840 7000",
    					fax: '+1 214 840 7050\n                        <br>\n                        <strong>Dan Berner, North Texas managing partner\n                         <br>\n                        <a href="mailto:dberner@deloitte.com" class="email-link" data-contacttype="email">dberner@deloitte.com</a>'
    				},
    				{
    					id: 1,
    					city: "Deloitte University ",
    					address: "2501 Westlake Parkway, Westlake, TX, 76262, United States",
    					phone: "+1 682 388 1000",
    					fax: "+1 469 417 5090"
    				},
    				{
    					id: 1,
    					city: "Fort Worth ",
    					address: "301 Commerce Street, Suite 2601, Fort Worth, TX, 76102, United States",
    					phone: "+1 817 347 3300",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Houston ",
    					address: "1111 Bagby St., Suite 4500, Houston, TX, 77002-2591, United States",
    					phone: "+1 713 982 2000",
    					fax: "+1 713 982 2001"
    				},
    				{
    					id: 1,
    					city: "San Antonio ",
    					address: "14100 San Pedro Avenue, Suite 700, San Antonio, TX, 78232, United States",
    					phone: "+1 210 507 9006",
    					fax: "+1 210 224 9456"
    				},
    				{
    					id: 1,
    					city: "Austin ",
    					address: "7601 Southwest Parkway, Building 1, 3rd floor, Austin, TX, 78735, United States",
    					phone: "none",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Dallas ",
    					address: "717 N. Harwood Street, Dallas, TX, 75201, United States",
    					phone: "none",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "San Antonio ",
    					address: "310 S St.Mary's Street, San Antonio, TX, 78232, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Utah",
    			cities: [
    				{
    					id: 1,
    					city: "Salt Lake City ",
    					address: "111 South Main Street, Suite 1500, Salt Lake City, UT, 84111-1919, United States",
    					phone: "+1 801 328 4706",
    					fax: "+1 801 355 7515"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Virginia",
    			cities: [
    				{
    					id: 1,
    					city: "Rosslyn ",
    					address: "1919 North Lynn Street, Suite 1500, Rosslyn, VA, 22209, United States",
    					phone: "+1 571 882 5000",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "McLean ",
    					address: "7900 Tysons One Place, Suite 800, McLean, VA, 22102-5971, United States",
    					phone: "+1 703 251 1000",
    					fax: "+1 703 251 3400"
    				},
    				{
    					id: 1,
    					city: "Richmond ",
    					address: "901 East Byrd Street, West Tower, Suite 820, Richmond, VA, 23219, United States",
    					phone: "+1 804 697 1500",
    					fax: "+1 804 697 1825"
    				},
    				{
    					id: 1,
    					city: "Fairview Park ",
    					address: "2941 Fairview Park Drive, Suite 400, Fairview Park, VA, 22042, United States",
    					phone: "+1 571 581 3500",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Falls Church  ",
    					address: "5275 Leesburg Pike, 5th floor, Suite 1100, Falls Church, VA, 22041, United States",
    					phone: "none",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Kent St. (Arlington) ",
    					address: "1777 N. Kent Street, Kent St. (Arlington), VA, 22209, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Washington",
    			cities: [
    				{
    					id: 1,
    					city: "Seattle ",
    					address: "925 Fourth Avenue, Suite 3300, Seattle, WA, 98104-1126, United States",
    					phone: "+1 206 716 7000",
    					fax: "+1 206 965 7000"
    				},
    				{
    					id: 1,
    					city: "Deloitte Digital ",
    					address: "821 Second Avenue, Suite 200, Seattle, WA, 98104, United States",
    					phone: "+1 206 633 1167",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Wisconsin ",
    			cities: [
    				{
    					id: 1,
    					city: "Milwaukee ",
    					address: "555 East Wells Street, Suite 1400, Milwaukee, WI, 53202, United States",
    					phone: "+1 414 271 3000",
    					fax: "+1 414 347 6200"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "More Office Details",
    			cities: []
    		},
    		{
    			id: 1,
    			state: "Distrito Federal",
    			cities: [
    				{
    					id: 1,
    					city: "Mexico City ",
    					address: "Torre Mayor, Paseo de La Reforma 489, piso 6, D.F., Cuauhtémoc, Mexico City, DF, 06500, United States",
    					phone: "+011 52 55 5080 6000",
    					fax: "none"
    				}
    			]
    		},
    		{
    			id: 1,
    			state: "Mexico",
    			cities: [
    				{
    					id: 1,
    					city: "Mexico City ",
    					address: "Torre Mayor, Paseo de La Reforma 489, piso 6, D.F., Cuauhtémoc, Mexico City, DF, 06500, United States",
    					phone: "+011 52 55 5080 6000",
    					fax: "none"
    				},
    				{
    					id: 1,
    					city: "Queretaro City ",
    					address: "Avenida 5 de Febrero No.1351, Queretaro City, QE, 76120, United States",
    					phone: "none",
    					fax: "none"
    				}
    			]
    		}
    	];

    	let searchTerm;
    	let searching = true;
    	let searchResultsObj = [];

    	function searchCities() {
    		$$invalidate(2, searching = true);
    		$$invalidate(3, searchResultsObj = []);

    		states.forEach(state => {
    			let resultObj = state.cities.filter(city => {
    				return city.city.toLowerCase().includes(searchTerm?.toLowerCase());
    			});

    			if (resultObj.length !== 0) searchResultsObj.push(resultObj);
    		});
    	}

    	let selectedCity;

    	function getSelectedCity(city) {
    		$$invalidate(4, selectedCity = city);
    		$$invalidate(2, searching = false);
    	}

    	function showFormOptions(form) {
    		$$invalidate(5, selectedForm[0].active = false, selectedForm);
    		formsData.set($formsData);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Submit> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];
    	const mouseover_handler = (formData, each_value, formData_index) => set_store_value(formsData, each_value[formData_index].hovered = true, $formsData);
    	const focus_handler = (formData, each_value, formData_index) => set_store_value(formsData, each_value[formData_index].hovered = true, $formsData);
    	const mouseout_handler = (formData, each_value, formData_index) => set_store_value(formsData, each_value[formData_index].hovered = false, $formsData);
    	const blur_handler = (formData, each_value, formData_index) => set_store_value(formsData, each_value[formData_index].hovered = false, $formsData);

    	const click_handler = (formData, each_value, formData_index) => {
    		set_store_value(formsData, each_value[formData_index].active = true, $formsData);
    		set_store_value(formsData, each_value[formData_index].hovered = false, $formsData);
    	};

    	function input_input_handler(each_value_2, question_index) {
    		each_value_2[question_index].response = this.value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	function textarea_input_handler(each_value_2, question_index) {
    		each_value_2[question_index].response = this.value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	function input_input_handler_1() {
    		searchTerm = this.value;
    		$$invalidate(1, searchTerm);
    	}

    	const click_handler_1 = resultCity => getSelectedCity(resultCity);
    	const click_handler_2 = () => $$invalidate(2, searching = true);

    	function input_change_handler(each_value_2, question_index) {
    		each_value_2[question_index].response = this.__value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	function input_input_handler_2(each_value_6, idx) {
    		each_value_6[idx].response = this.value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	function input_input_handler_3(each_value_6, idx) {
    		each_value_6[idx].roleResponse = this.value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	function textarea_input_handler_1(each_value_7, choice_index_1) {
    		each_value_7[choice_index_1].response = this.value;
    		($$invalidate(5, selectedForm), $$invalidate(0, $formsData));
    	}

    	$$self.$capture_state = () => ({
    		LargePlant: SmallPlant,
    		SmallPlant: LargePlant,
    		fly,
    		slide,
    		BackButton: Back,
    		formsData,
    		states,
    		searchTerm,
    		searching,
    		searchResultsObj,
    		searchCities,
    		selectedCity,
    		getSelectedCity,
    		getCityDetails,
    		showFormOptions,
    		selectedForm,
    		$formsData
    	});

    	$$self.$inject_state = $$props => {
    		if ('states' in $$props) states = $$props.states;
    		if ('searchTerm' in $$props) $$invalidate(1, searchTerm = $$props.searchTerm);
    		if ('searching' in $$props) $$invalidate(2, searching = $$props.searching);
    		if ('searchResultsObj' in $$props) $$invalidate(3, searchResultsObj = $$props.searchResultsObj);
    		if ('selectedCity' in $$props) $$invalidate(4, selectedCity = $$props.selectedCity);
    		if ('selectedForm' in $$props) $$invalidate(5, selectedForm = $$props.selectedForm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$formsData*/ 1) {
    			$$invalidate(5, selectedForm = $formsData.filter(form => form.active === true));
    		}
    	};

    	return [
    		$formsData,
    		searchTerm,
    		searching,
    		searchResultsObj,
    		selectedCity,
    		selectedForm,
    		searchCities,
    		getSelectedCity,
    		showFormOptions,
    		mouseover_handler,
    		focus_handler,
    		mouseout_handler,
    		blur_handler,
    		click_handler,
    		input_input_handler,
    		textarea_input_handler,
    		input_input_handler_1,
    		click_handler_1,
    		click_handler_2,
    		input_change_handler,
    		$$binding_groups,
    		input_input_handler_2,
    		input_input_handler_3,
    		textarea_input_handler_1
    	];
    }

    class Submit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Submit",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Elements/Calendar Icon.svelte generated by Svelte v3.46.4 */

    const file$3 = "src/Elements/Calendar Icon.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let circle;
    	let path0;
    	let path0_stroke_miterlimit_value;
    	let g;
    	let path1;
    	let path2;
    	let path2_stroke_miterlimit_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			g = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(circle, "cx", "208.5");
    			attr_dev(circle, "cy", "206");
    			attr_dev(circle, "r", "206");
    			attr_dev(circle, "fill", /*iconBackgroundColor*/ ctx[0]);
    			attr_dev(circle, "fill-opacity", /*itemIconOpacity*/ ctx[2]);
    			add_location(circle, file$3, 28, 2, 720);
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "stroke", /*iconColor*/ ctx[1]);
    			attr_dev(path0, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-miterlimit", path0_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2);
    			attr_dev(path0, "d", "M177 203.6h0M177 203.6h0M208.5 203.6h0M242.7 203.6h0M274.2 203.6h0M142.8 232.5h0M177 232.5h0M208.5 232.5h0M242.7 232.5h0M274.2 232.5h0");
    			add_location(path0, file$3, 29, 2, 819);
    			attr_dev(path1, "class", "st1");
    			attr_dev(path1, "d", "M142.8 261.4h0M177 261.4h0M208.5 261.4h0M242.7 261.4h0");
    			add_location(path1, file$3, 37, 7, 1166);
    			add_location(g, file$3, 37, 4, 1163);
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "stroke", /*iconColor*/ ctx[1]);
    			attr_dev(path2, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "stroke-miterlimit", path2_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2);
    			attr_dev(path2, "d", "M106 128.7h205v165.6H106zM106 173.4h205M274.2 147.1v-39.4M142.8 147.1v-39.4");
    			add_location(path2, file$3, 37, 90, 1249);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0");
    			attr_dev(svg, "y", "0");
    			attr_dev(svg, "viewBox", "0 0 412 412");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$3, 19, 0, 580);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, path0);
    			append_dev(svg, g);
    			append_dev(g, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconBackgroundColor*/ 1) {
    				attr_dev(circle, "fill", /*iconBackgroundColor*/ ctx[0]);
    			}

    			if (dirty & /*itemIconOpacity*/ 4) {
    				attr_dev(circle, "fill-opacity", /*itemIconOpacity*/ ctx[2]);
    			}

    			if (dirty & /*iconColor*/ 2) {
    				attr_dev(path0, "stroke", /*iconColor*/ ctx[1]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8) {
    				attr_dev(path0, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8 && path0_stroke_miterlimit_value !== (path0_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2)) {
    				attr_dev(path0, "stroke-miterlimit", path0_stroke_miterlimit_value);
    			}

    			if (dirty & /*iconColor*/ 2) {
    				attr_dev(path2, "stroke", /*iconColor*/ ctx[1]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8) {
    				attr_dev(path2, "stroke-width", /*iconStrokeWidth*/ ctx[3]);
    			}

    			if (dirty & /*iconStrokeWidth*/ 8 && path2_stroke_miterlimit_value !== (path2_stroke_miterlimit_value = /*iconStrokeWidth*/ ctx[3] + /*iconStrokeWidth*/ ctx[3] / 2)) {
    				attr_dev(path2, "stroke-miterlimit", path2_stroke_miterlimit_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendaru20Icon', slots, []);
    	let { iconBackgroundColor } = $$props;
    	let { iconColor } = $$props;
    	let { itemIconOpacity } = $$props;
    	let { iconStrokeWidth } = $$props;
    	const writable_props = ['iconBackgroundColor', 'iconColor', 'itemIconOpacity', 'iconStrokeWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Calendaru20Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('iconBackgroundColor' in $$props) $$invalidate(0, iconBackgroundColor = $$props.iconBackgroundColor);
    		if ('iconColor' in $$props) $$invalidate(1, iconColor = $$props.iconColor);
    		if ('itemIconOpacity' in $$props) $$invalidate(2, itemIconOpacity = $$props.itemIconOpacity);
    		if ('iconStrokeWidth' in $$props) $$invalidate(3, iconStrokeWidth = $$props.iconStrokeWidth);
    	};

    	$$self.$capture_state = () => ({
    		iconBackgroundColor,
    		iconColor,
    		itemIconOpacity,
    		iconStrokeWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconBackgroundColor' in $$props) $$invalidate(0, iconBackgroundColor = $$props.iconBackgroundColor);
    		if ('iconColor' in $$props) $$invalidate(1, iconColor = $$props.iconColor);
    		if ('itemIconOpacity' in $$props) $$invalidate(2, itemIconOpacity = $$props.itemIconOpacity);
    		if ('iconStrokeWidth' in $$props) $$invalidate(3, iconStrokeWidth = $$props.iconStrokeWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [iconBackgroundColor, iconColor, itemIconOpacity, iconStrokeWidth];
    }

    class Calendaru20Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			iconBackgroundColor: 0,
    			iconColor: 1,
    			itemIconOpacity: 2,
    			iconStrokeWidth: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendaru20Icon",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*iconBackgroundColor*/ ctx[0] === undefined && !('iconBackgroundColor' in props)) {
    			console.warn("<Calendaru20Icon> was created without expected prop 'iconBackgroundColor'");
    		}

    		if (/*iconColor*/ ctx[1] === undefined && !('iconColor' in props)) {
    			console.warn("<Calendaru20Icon> was created without expected prop 'iconColor'");
    		}

    		if (/*itemIconOpacity*/ ctx[2] === undefined && !('itemIconOpacity' in props)) {
    			console.warn("<Calendaru20Icon> was created without expected prop 'itemIconOpacity'");
    		}

    		if (/*iconStrokeWidth*/ ctx[3] === undefined && !('iconStrokeWidth' in props)) {
    			console.warn("<Calendaru20Icon> was created without expected prop 'iconStrokeWidth'");
    		}
    	}

    	get iconBackgroundColor() {
    		throw new Error("<Calendaru20Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconBackgroundColor(value) {
    		throw new Error("<Calendaru20Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconColor() {
    		throw new Error("<Calendaru20Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconColor(value) {
    		throw new Error("<Calendaru20Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemIconOpacity() {
    		throw new Error("<Calendaru20Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemIconOpacity(value) {
    		throw new Error("<Calendaru20Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconStrokeWidth() {
    		throw new Error("<Calendaru20Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconStrokeWidth(value) {
    		throw new Error("<Calendaru20Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));

    const getDaysArray = function (start, end) {
      for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
      }
      return arr;
    };

    const addDays = (date, days) => {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const subtractDays = (date, days) => {
      var result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };


    function firstDayOfWeek(dateObject, firstDayOfWeekIndex) {
      const dayOfWeek = dateObject.getDay(),
        firstDayOfWeek = new Date(dateObject),
        diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

      firstDayOfWeek.setDate(dateObject.getDate() - diff);
      firstDayOfWeek.setHours(0, 0, 0, 0);

      return firstDayOfWeek;
    }

    /* src/Sections/Deployment.svelte generated by Svelte v3.46.4 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/Sections/Deployment.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (213:8) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No projects in queue.";
    			attr_dev(p, "class", "svelte-1vremfi");
    			add_location(p, file$2, 213, 10, 7982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(213:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (167:8) {#if unassignedProjects.length > 0}
    function create_if_block_3$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_4 = /*unassignedProjects*/ ctx[5];
    	validate_each_argument(each_value_4);
    	const get_key = ctx => /*project*/ ctx[27].id;
    	validate_each_keys(ctx, each_value_4, get_each_context_4, get_key);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*unassignedProjects, handleDragStart, handleDragStop*/ 12320) {
    				each_value_4 = /*unassignedProjects*/ ctx[5];
    				validate_each_argument(each_value_4);
    				group_outros();
    				validate_each_keys(ctx, each_value_4, get_each_context_4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_4, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_4, each_1_anchor, get_each_context_4);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(167:8) {#if unassignedProjects.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (168:10) {#each unassignedProjects as project (project.id)}
    function create_each_block_4(key_1, ctx) {
    	let div9;
    	let div0;
    	let t0_value = /*project*/ ctx[27].projectName + "";
    	let t0;
    	let div0_intro;
    	let t1;
    	let div8;
    	let div4;
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;
    	let t3_value = /*project*/ ctx[27].submitter + "";
    	let t3;
    	let t4;
    	let div7;
    	let div5;
    	let t5;
    	let t6_value = /*project*/ ctx[27].value / 1000 + "";
    	let t6;
    	let t7;
    	let t8;
    	let div6;
    	let span;
    	let t10;
    	let t11_value = new Date(/*project*/ ctx[27].endDate).toLocaleString("en-us", { day: "numeric", month: "short" }) + "";
    	let t11;
    	let div8_intro;
    	let t12;
    	let div9_data_project_id_value;
    	let div9_intro;
    	let div9_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div8 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t5 = text("$");
    			t6 = text(t6_value);
    			t7 = text("K");
    			t8 = space();
    			div6 = element("div");
    			span = element("span");
    			span.textContent = "Due:";
    			t10 = space();
    			t11 = text(t11_value);
    			t12 = space();
    			attr_dev(div0, "class", "unassignedProjectName svelte-1vremfi");
    			toggle_class(div0, "red", new Date(/*project*/ ctx[27].endDate) <= addDays(new Date(), 2));
    			toggle_class(div0, "orange", new Date(/*project*/ ctx[27].endDate) > addDays(new Date(), 2) && new Date(/*project*/ ctx[27].endDate) < addDays(new Date(), 4));
    			toggle_class(div0, "yellow", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 3));
    			toggle_class(div0, "green", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 5));
    			add_location(div0, file$2, 178, 14, 6374);
    			if (!src_url_equal(img.src, img_src_value = "testing/champerera.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "champerera");
    			attr_dev(img, "class", "svelte-1vremfi");
    			add_location(img, file$2, 193, 22, 7212);
    			attr_dev(div1, "class", "unassignedProjectSubmitterPic svelte-1vremfi");
    			add_location(div1, file$2, 192, 20, 7146);
    			attr_dev(div2, "class", "unassignedProjectSubmitter");
    			add_location(div2, file$2, 195, 20, 7313);
    			attr_dev(div3, "class", "unassignedProjectSubmitterWrapper svelte-1vremfi");
    			add_location(div3, file$2, 191, 18, 7078);
    			attr_dev(div4, "class", "unassignedProjectOwner svelte-1vremfi");
    			add_location(div4, file$2, 190, 16, 7023);
    			attr_dev(div5, "class", "unassignedProjectValue svelte-1vremfi");
    			add_location(div5, file$2, 201, 18, 7543);
    			add_location(span, file$2, 205, 20, 7724);
    			attr_dev(div6, "class", "unassignedProjectDate");
    			add_location(div6, file$2, 204, 18, 7668);
    			attr_dev(div7, "class", "unassignedProjectBottom svelte-1vremfi");
    			add_location(div7, file$2, 200, 16, 7487);
    			attr_dev(div8, "class", "unassignedProjectDetails svelte-1vremfi");
    			add_location(div8, file$2, 189, 14, 6949);
    			attr_dev(div9, "class", "unassignedProject svelte-1vremfi");
    			attr_dev(div9, "draggable", "true");
    			attr_dev(div9, "data-project-id", div9_data_project_id_value = /*project*/ ctx[27].id);
    			add_location(div9, file$2, 168, 12, 5987);
    			this.first = div9;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div0, t0);
    			append_dev(div9, t1);
    			append_dev(div9, div8);
    			append_dev(div8, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div8, t4);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, t5);
    			append_dev(div5, t6);
    			append_dev(div5, t7);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			append_dev(div6, span);
    			append_dev(div6, t10);
    			append_dev(div6, t11);
    			append_dev(div9, t12);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div9, "dragstart", /*handleDragStart*/ ctx[12], false, false, false),
    					listen_dev(div9, "dragend", /*handleDragStop*/ ctx[13], false, false, false),
    					listen_dev(div9, "click", handleClick, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*unassignedProjects*/ 32) && t0_value !== (t0_value = /*project*/ ctx[27].projectName + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*unassignedProjects*/ 32) {
    				toggle_class(div0, "red", new Date(/*project*/ ctx[27].endDate) <= addDays(new Date(), 2));
    			}

    			if (dirty[0] & /*unassignedProjects*/ 32) {
    				toggle_class(div0, "orange", new Date(/*project*/ ctx[27].endDate) > addDays(new Date(), 2) && new Date(/*project*/ ctx[27].endDate) < addDays(new Date(), 4));
    			}

    			if (dirty[0] & /*unassignedProjects*/ 32) {
    				toggle_class(div0, "yellow", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 3));
    			}

    			if (dirty[0] & /*unassignedProjects*/ 32) {
    				toggle_class(div0, "green", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 5));
    			}

    			if ((!current || dirty[0] & /*unassignedProjects*/ 32) && t3_value !== (t3_value = /*project*/ ctx[27].submitter + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*unassignedProjects*/ 32) && t6_value !== (t6_value = /*project*/ ctx[27].value / 1000 + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty[0] & /*unassignedProjects*/ 32) && t11_value !== (t11_value = new Date(/*project*/ ctx[27].endDate).toLocaleString("en-us", { day: "numeric", month: "short" }) + "")) set_data_dev(t11, t11_value);

    			if (!current || dirty[0] & /*unassignedProjects*/ 32 && div9_data_project_id_value !== (div9_data_project_id_value = /*project*/ ctx[27].id)) {
    				attr_dev(div9, "data-project-id", div9_data_project_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fly, { y: -10 });
    					div0_intro.start();
    				});
    			}

    			if (!div8_intro) {
    				add_render_callback(() => {
    					div8_intro = create_in_transition(div8, fly, { y: 10 });
    					div8_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div9_outro) div9_outro.end(1);
    				div9_intro = create_in_transition(div9, /*receive*/ ctx[8], { key: /*project*/ ctx[27], duration: 500 });
    				div9_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div9_intro) div9_intro.invalidate();
    			div9_outro = create_out_transition(div9, /*send*/ ctx[7], { key: /*project*/ ctx[27], duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (detaching && div9_outro) div9_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(168:10) {#each unassignedProjects as project (project.id)}",
    		ctx
    	});

    	return block;
    }

    // (240:10) {#each weekDays as weekday, idx}
    function create_each_block_3$1(ctx) {
    	let div;
    	let t0_value = /*weekday*/ ctx[29] + "";
    	let t0;
    	let t1;
    	let b;
    	let t2_value = String(/*weekDates*/ ctx[2][/*idx*/ ctx[26]]).split(" ")[2] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			b = element("b");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(b, file$2, 242, 14, 9020);
    			attr_dev(div, "class", "segment svelte-1vremfi");
    			add_location(div, file$2, 240, 12, 8960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, b);
    			append_dev(b, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*weekDates*/ 4 && t2_value !== (t2_value = String(/*weekDates*/ ctx[2][/*idx*/ ctx[26]]).split(" ")[2] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(240:10) {#each weekDays as weekday, idx}",
    		ctx
    	});

    	return block;
    }

    // (288:20) {:else}
    function create_else_block(ctx) {
    	let t_value = /*project*/ ctx[27].projectName + "";
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    			br = element("br");
    			add_location(br, file$2, 288, 43, 11456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentWeekProjects, $users*/ 72 && t_value !== (t_value = /*project*/ ctx[27].projectName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(288:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (283:65) 
    function create_if_block_2$1(ctx) {
    	let t0_value = /*project*/ ctx[27].projectName + "";
    	let t0;
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("++");
    			br = element("br");
    			add_location(br, file$2, 283, 45, 11125);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentWeekProjects, $users*/ 72 && t0_value !== (t0_value = /*project*/ ctx[27].projectName + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(283:65) ",
    		ctx
    	});

    	return block;
    }

    // (278:20) {#if new Date(project.startDate) < lastMonday}
    function create_if_block_1$1(ctx) {
    	let t0;
    	let t1_value = /*project*/ ctx[27].projectName + "";
    	let t1;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("++ ");
    			t1 = text(t1_value);
    			br = element("br");
    			add_location(br, file$2, 278, 46, 10754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentWeekProjects, $users*/ 72 && t1_value !== (t1_value = /*project*/ ctx[27].projectName + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(278:20) {#if new Date(project.startDate) < lastMonday}",
    		ctx
    	});

    	return block;
    }

    // (255:14) {#each currentWeekProjects.filter((p) => p.assignedTo === user.email) as project, index (project.id)}
    function create_each_block_2$1(key_1, ctx) {
    	let div1;
    	let div0;
    	let show_if;
    	let show_if_1;
    	let div0_data_from_user_value;
    	let div0_data_project_id_value;
    	let div0_intro;
    	let div0_outro;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (dirty[0] & /*currentWeekProjects, $users, lastMonday*/ 73) show_if = null;
    		if (dirty[0] & /*currentWeekProjects, $users, sunday*/ 74) show_if_1 = null;
    		if (show_if == null) show_if = !!(new Date(/*project*/ ctx[27].startDate) < /*lastMonday*/ ctx[0]);
    		if (show_if) return create_if_block_1$1;
    		if (show_if_1 == null) show_if_1 = !!(new Date(/*project*/ ctx[27].endDate) > /*sunday*/ ctx[1]);
    		if (show_if_1) return create_if_block_2$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx, [-1, -1]);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div0, "class", "event svelte-1vremfi");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "grid-area", "event");
    			attr_dev(div0, "data-from-user", div0_data_from_user_value = /*user*/ ctx[21].email);
    			attr_dev(div0, "data-project-id", div0_data_project_id_value = /*project*/ ctx[27].id);
    			toggle_class(div0, "red", new Date(/*project*/ ctx[27].endDate) <= addDays(new Date(), 2));
    			toggle_class(div0, "orange", new Date(/*project*/ ctx[27].endDate) > addDays(new Date(), 2) && new Date(/*project*/ ctx[27].endDate) < addDays(new Date(), 4));
    			toggle_class(div0, "yellow", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 3));
    			toggle_class(div0, "green", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 5));
    			add_location(div0, file$2, 261, 18, 9763);
    			attr_dev(div1, "class", "daySegments svelte-1vremfi");
    			set_style(div1, "display", "grid");
    			set_style(div1, "grid-template-columns", "repeat(7, 1fr)");
    			set_style(div1, "grid-template-areas", "'" + /*getGridAreas*/ ctx[11](/*project*/ ctx[27]) + "'");
    			add_location(div1, file$2, 255, 16, 9524);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    			append_dev(div1, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "dragstart", /*handleDragStart*/ ctx[12], false, false, false),
    					listen_dev(div0, "click", handleClick, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (!current || dirty[0] & /*$users*/ 64 && div0_data_from_user_value !== (div0_data_from_user_value = /*user*/ ctx[21].email)) {
    				attr_dev(div0, "data-from-user", div0_data_from_user_value);
    			}

    			if (!current || dirty[0] & /*currentWeekProjects, $users*/ 72 && div0_data_project_id_value !== (div0_data_project_id_value = /*project*/ ctx[27].id)) {
    				attr_dev(div0, "data-project-id", div0_data_project_id_value);
    			}

    			if (dirty[0] & /*currentWeekProjects, $users*/ 72) {
    				toggle_class(div0, "red", new Date(/*project*/ ctx[27].endDate) <= addDays(new Date(), 2));
    			}

    			if (dirty[0] & /*currentWeekProjects, $users*/ 72) {
    				toggle_class(div0, "orange", new Date(/*project*/ ctx[27].endDate) > addDays(new Date(), 2) && new Date(/*project*/ ctx[27].endDate) < addDays(new Date(), 4));
    			}

    			if (dirty[0] & /*currentWeekProjects, $users*/ 72) {
    				toggle_class(div0, "yellow", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 3));
    			}

    			if (dirty[0] & /*currentWeekProjects, $users*/ 72) {
    				toggle_class(div0, "green", new Date(/*project*/ ctx[27].endDate) >= addDays(new Date(), 5));
    			}

    			if (!current || dirty[0] & /*currentWeekProjects, $users*/ 72) {
    				set_style(div1, "grid-template-areas", "'" + /*getGridAreas*/ ctx[11](/*project*/ ctx[27]) + "'");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				div0_intro = create_in_transition(div0, /*receive*/ ctx[8], { key: /*project*/ ctx[27], duration: 500 });
    				div0_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, /*send*/ ctx[7], { key: /*project*/ ctx[27], duration: 500 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			if (detaching && div0_outro) div0_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(255:14) {#each currentWeekProjects.filter((p) => p.assignedTo === user.email) as project, index (project.id)}",
    		ctx
    	});

    	return block;
    }

    // (298:12) {#if dragged}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let each_value_1 = /*weekDates*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "daySegmentsBase svelte-1vremfi");
    			set_style(div0, "grid-template-areas", /*standardGridAreas*/ ctx[10]);
    			add_location(div0, file$2, 299, 16, 11910);
    			attr_dev(div1, "class", "timeline svelte-1vremfi");
    			add_location(div1, file$2, 298, 14, 11871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$users, weekDates, handleDrop*/ 16452) {
    				each_value_1 = /*weekDates*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(298:12) {#if dragged}",
    		ctx
    	});

    	return block;
    }

    // (301:18) {#each weekDates as date, idx}
    function create_each_block_1$1(ctx) {
    	let div;
    	let div_data_to_user_value;
    	let div_data_new_from_date_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "dropArea svelte-1vremfi");
    			set_style(div, "grid-area", "'" + ('event' + /*idx*/ ctx[26]) + "'");
    			attr_dev(div, "data-to-user", div_data_to_user_value = /*user*/ ctx[21].email);
    			attr_dev(div, "data-new-from-date", div_data_new_from_date_value = /*date*/ ctx[24]);
    			add_location(div, file$2, 301, 20, 12057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "drop", /*handleDrop*/ ctx[14], false, false, false),
    					listen_dev(div, "dragenter", dragenter_handler, false, false, false),
    					listen_dev(div, "dragover", dragover_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$users*/ 64 && div_data_to_user_value !== (div_data_to_user_value = /*user*/ ctx[21].email)) {
    				attr_dev(div, "data-to-user", div_data_to_user_value);
    			}

    			if (dirty[0] & /*weekDates*/ 4 && div_data_new_from_date_value !== (div_data_new_from_date_value = /*date*/ ctx[24])) {
    				attr_dev(div, "data-new-from-date", div_data_new_from_date_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(301:18) {#each weekDates as date, idx}",
    		ctx
    	});

    	return block;
    }

    // (250:6) {#each $users as user, index (user.id)}
    function create_each_block$1(key_1, ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*user*/ ctx[21].name + "";
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let t3;
    	let div3_intro;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[18](/*user*/ ctx[21], ...args);
    	}

    	let each_value_2 = /*currentWeekProjects*/ ctx[3].filter(func);
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*project*/ ctx[27].id;
    	validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2$1(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2$1(key, child_ctx));
    	}

    	let if_block = /*dragged*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr_dev(div0, "class", "name svelte-1vremfi");
    			add_location(div0, file$2, 251, 10, 9281);
    			attr_dev(div1, "class", "timeline svelte-1vremfi");
    			add_location(div1, file$2, 253, 12, 9369);
    			attr_dev(div2, "class", "timelineWrapper svelte-1vremfi");
    			add_location(div2, file$2, 252, 10, 9327);
    			attr_dev(div3, "class", "row svelte-1vremfi");
    			add_location(div3, file$2, 250, 8, 9233);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div3, t3);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*$users*/ 64) && t0_value !== (t0_value = /*user*/ ctx[21].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*getGridAreas, currentWeekProjects, $users, handleDragStart, lastMonday, sunday*/ 6219) {
    				each_value_2 = /*currentWeekProjects*/ ctx[3].filter(func);
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div1, outro_and_destroy_block, create_each_block_2$1, null, get_each_context_2$1);
    				check_outros();
    			}

    			if (/*dragged*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, fly, { y: -20 });
    					div3_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(250:6) {#each $users as user, index (user.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div13;
    	let div0;
    	let h1;
    	let t1;
    	let div12;
    	let div2;
    	let h2;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t4;
    	let div10;
    	let div6;
    	let div3;
    	let backbutton0;
    	let t5;
    	let div4;
    	let span;
    	let t7;

    	let t8_value = /*sunday*/ ctx[1].toLocaleString("en-us", {
    		day: "numeric",
    		month: "long",
    		year: "numeric"
    	}) + "";

    	let t8;
    	let t9;
    	let div5;
    	let backbutton1;
    	let t10;
    	let div9;
    	let div7;
    	let t12;
    	let div8;
    	let t13;
    	let div11;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_3$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*unassignedProjects*/ ctx[5].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	backbutton0 = new Back({
    			props: {
    				iconBackgroundColor: "#fff",
    				iconColor: "white",
    				itemIconOpacity: "0",
    				iconStrokeWidth: "1rem",
    				back: "true"
    			},
    			$$inline: true
    		});

    	backbutton1 = new Back({
    			props: {
    				iconBackgroundColor: "#fff",
    				iconColor: "white",
    				itemIconOpacity: "0",
    				iconStrokeWidth: "1rem"
    			},
    			$$inline: true
    		});

    	let each_value_3 = /*weekDays*/ ctx[9];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let each_value = /*$users*/ ctx[6];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[21].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Deployment";
    			t1 = space();
    			div12 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Pursuit queue";
    			t3 = space();
    			div1 = element("div");
    			if_block.c();
    			t4 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div3 = element("div");
    			create_component(backbutton0.$$.fragment);
    			t5 = space();
    			div4 = element("div");
    			span = element("span");
    			span.textContent = "Week ending";
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			create_component(backbutton1.$$.fragment);
    			t10 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "Pursuit managers";
    			t12 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t13 = space();
    			div11 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1vremfi");
    			add_location(h1, file$2, 160, 4, 5718);
    			attr_dev(div0, "class", "deploymentTitle svelte-1vremfi");
    			add_location(div0, file$2, 159, 2, 5684);
    			attr_dev(h2, "class", "svelte-1vremfi");
    			add_location(h2, file$2, 164, 6, 5808);
    			attr_dev(div1, "class", "unassignedProjects svelte-1vremfi");
    			add_location(div1, file$2, 165, 6, 5837);
    			attr_dev(div2, "class", "unassigned svelte-1vremfi");
    			add_location(div2, file$2, 163, 4, 5777);
    			attr_dev(div3, "class", "prev svelte-1vremfi");
    			add_location(div3, file$2, 219, 8, 8127);
    			attr_dev(span, "class", "svelte-1vremfi");
    			add_location(span, file$2, 229, 10, 8454);
    			attr_dev(div4, "class", "currentWeekEnding svelte-1vremfi");
    			add_location(div4, file$2, 228, 8, 8388);
    			attr_dev(div5, "class", "next svelte-1vremfi");
    			add_location(div5, file$2, 232, 8, 8597);
    			attr_dev(div6, "class", "schedulerNavMenu svelte-1vremfi");
    			add_location(div6, file$2, 218, 6, 8088);
    			attr_dev(div7, "class", "name nameHeader svelte-1vremfi");
    			add_location(div7, file$2, 237, 8, 8819);
    			attr_dev(div8, "class", "daySegments svelte-1vremfi");
    			add_location(div8, file$2, 238, 8, 8879);
    			attr_dev(div9, "class", "headerRow svelte-1vremfi");
    			add_location(div9, file$2, 236, 6, 8787);
    			attr_dev(div10, "class", "scheduleHeader svelte-1vremfi");
    			add_location(div10, file$2, 217, 4, 8053);
    			attr_dev(div11, "class", "scheduleContainer svelte-1vremfi");
    			add_location(div11, file$2, 248, 4, 9147);
    			attr_dev(div12, "class", "container svelte-1vremfi");
    			add_location(div12, file$2, 162, 2, 5749);
    			attr_dev(div13, "class", "deploymentContainer svelte-1vremfi");
    			add_location(div13, file$2, 158, 0, 5648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div0);
    			append_dev(div0, h1);
    			append_dev(div13, t1);
    			append_dev(div13, div12);
    			append_dev(div12, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div12, t4);
    			append_dev(div12, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div3);
    			mount_component(backbutton0, div3, null);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div4, span);
    			append_dev(div4, t7);
    			append_dev(div4, t8);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			mount_component(backbutton1, div5, null);
    			append_dev(div10, t10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t12);
    			append_dev(div9, div8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div8, null);
    			}

    			append_dev(div12, t13);
    			append_dev(div12, div11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div11, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*showPrevWeek*/ ctx[16], false, false, false),
    					listen_dev(div4, "click", showCalendar, false, false, false),
    					listen_dev(div5, "click", /*showNextWeek*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			if ((!current || dirty[0] & /*sunday*/ 2) && t8_value !== (t8_value = /*sunday*/ ctx[1].toLocaleString("en-us", {
    				day: "numeric",
    				month: "long",
    				year: "numeric"
    			}) + "")) set_data_dev(t8, t8_value);

    			if (dirty[0] & /*weekDates, weekDays*/ 516) {
    				each_value_3 = /*weekDays*/ ctx[9];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*standardGridAreas, weekDates, $users, handleDrop, dragged, currentWeekProjects, getGridAreas, handleDragStart, lastMonday, sunday*/ 23647) {
    				each_value = /*$users*/ ctx[6];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each1_lookup, div11, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(backbutton0.$$.fragment, local);
    			transition_in(backbutton1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(backbutton0.$$.fragment, local);
    			transition_out(backbutton1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			if_blocks[current_block_type_index].d();
    			destroy_component(backbutton0);
    			destroy_component(backbutton1);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleClick(e) {
    	
    }

    function showCalendar() {
    	
    }

    const dragenter_handler = e => e.preventDefault();
    const dragover_handler = e => e.preventDefault();

    function instance$2($$self, $$props, $$invalidate) {
    	let unassignedProjects;
    	let $projects;
    	let $users;
    	validate_store(projects, 'projects');
    	component_subscribe($$self, projects, $$value => $$invalidate(17, $projects = $$value));
    	validate_store(users, 'users');
    	component_subscribe($$self, users, $$value => $$invalidate(6, $users = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Deployment', slots, []);
    	const [send, receive] = crossfade({});
    	let lastMonday = firstDayOfWeek(new Date(), 1);
    	let weekDates = getDaysArray(lastMonday, addDays(lastMonday, 6));
    	let weekDays = weekDates.map(date => date.toLocaleString("en-us", { weekday: "short" }));
    	let standardGridAreas = ["event1", "event2", "event3", "event4", "event5", "event6", "event7"].join(" ");

    	function getGridAreas(project) {
    		let gridAreas = weekDates.map(date => date.toLocaleString("en-us", {
    			month: "short",
    			day: "numeric",
    			year: "numeric"
    		}).replace(",", "").replaceAll(" ", ""));

    		if (new Date(project.startDate) < lastMonday) {
    			let projectDaysArray = getDaysArray(new Date(project.startDate), new Date(project.endDate));
    			let midStartDay;
    			let midStartDayIdx;

    			projectDaysArray.forEach((projectDay, idx) => {
    				if (projectDay.getDate() == lastMonday.getDate()) {
    					// console.log("Falling on Monday " + project.projectName + " " + projectDay);
    					midStartDay = projectDay;

    					midStartDayIdx = idx;
    				}
    			});

    			let startDay = new Date(midStartDay).toLocaleString("en-us", {
    				month: "short",
    				day: "numeric",
    				year: "numeric"
    			}).replace(",", "").replaceAll(" ", "");

    			new Date(project.endDate).toLocaleString("en-us", {
    				month: "short",
    				day: "numeric",
    				year: "numeric"
    			}).replace(",", "").replaceAll(" ", "");

    			let numberOfDays = projectDaysArray.length - midStartDayIdx;
    			let eventAreas = "";

    			for (let i = 0; i < numberOfDays; i++) {
    				eventAreas += "event ";
    			}

    			gridAreas.splice(gridAreas.indexOf(startDay), numberOfDays, eventAreas);
    			project.gridareas = gridAreas;

    			// console.log(gridAreas);
    			return gridAreas.join(" ");
    		} else {
    			let startDay = new Date(project.startDate).toLocaleString("en-us", {
    				month: "short",
    				day: "numeric",
    				year: "numeric"
    			}).replace(",", "").replaceAll(" ", "");

    			new Date(project.endDate).toLocaleString("en-us", {
    				month: "short",
    				day: "numeric",
    				year: "numeric"
    			}).replace(",", "").replaceAll(" ", "");

    			let numberOfDays = project.duration;
    			let eventAreas = "";

    			for (let i = 0; i < numberOfDays; i++) {
    				eventAreas += "event ";
    			}

    			gridAreas.splice(gridAreas.indexOf(startDay), numberOfDays, eventAreas);
    			project.gridareas = gridAreas;

    			// console.log(gridAreas);
    			return gridAreas.join(" ");
    		}
    	}

    	let movedEvent;

    	function handleDragStart(e) {
    		e.dataTransfer.setData("text/plain", e.target.dataset.projectId);

    		// let itemToMove = $projects.find((proj) => proj.id == e.target.dataset.projectId);
    		$$invalidate(4, dragged = true);

    		movedEvent = e.target;
    		movedEvent.style.zIndex = 999;
    	}

    	function handleDragStop() {
    		$$invalidate(4, dragged = false);
    	}

    	function handleDrop(e) {
    		let projectId = e.dataTransfer.getData("text/plain");
    		let itemToMove = $projects.find(proj => proj.id == projectId);
    		$projects.indexOf(itemToMove);
    		itemToMove.assignedTo = e.currentTarget.dataset.toUser;
    		let startDateBefore = new Date(itemToMove.startDate);
    		itemToMove.startDate = new Date(e.currentTarget.dataset.newFromDate).toISOString();
    		let newStartDate = new Date(e.currentTarget.dataset.newFromDate);
    		let daysMoved = new Date(e.currentTarget.dataset.newFromDate).getDay() - startDateBefore.getDay();

    		if (daysMoved !== 0) {
    			newStartDate.setDate(newStartDate.getDate() + itemToMove.duration - 1);
    			itemToMove.endDate = newStartDate.toISOString();
    			console.log(itemToMove.endDate);
    		}

    		projects.set($projects);
    		$$invalidate(4, dragged = false);
    		movedEvent.style.zIndex = "auto";
    		console.log(itemToMove);
    	}

    	let currentWeekProjects;
    	let sunday;
    	let dragged;

    	function showNextWeek() {
    		lastMonday.setDate(lastMonday.getDate() + 7);
    		$$invalidate(2, weekDates = getDaysArray(lastMonday, addDays(lastMonday, 6)));
    		$$invalidate(0, lastMonday);
    		projects.set($projects);
    	}

    	function showPrevWeek() {
    		lastMonday.setDate(lastMonday.getDate() - 7);
    		$$invalidate(2, weekDates = getDaysArray(lastMonday, addDays(lastMonday, 6)));
    		$$invalidate(0, lastMonday);
    		projects.set($projects);
    	}

    	let colors = [];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Deployment> was created with unknown prop '${key}'`);
    	});

    	const func = (user, p) => p.assignedTo === user.email;

    	$$self.$capture_state = () => ({
    		BackButton: Back,
    		CalendarIcon: Calendaru20Icon,
    		crossfade,
    		fade,
    		send,
    		receive,
    		users,
    		projects,
    		range,
    		getDaysArray,
    		firstDayOfWeek,
    		addDays,
    		subtractDays,
    		slide,
    		fly,
    		quintInOut,
    		lastMonday,
    		weekDates,
    		weekDays,
    		standardGridAreas,
    		getGridAreas,
    		movedEvent,
    		handleDragStart,
    		handleDragStop,
    		handleDrop,
    		currentWeekProjects,
    		sunday,
    		handleClick,
    		dragged,
    		showNextWeek,
    		showPrevWeek,
    		showCalendar,
    		colors,
    		unassignedProjects,
    		$projects,
    		$users
    	});

    	$$self.$inject_state = $$props => {
    		if ('lastMonday' in $$props) $$invalidate(0, lastMonday = $$props.lastMonday);
    		if ('weekDates' in $$props) $$invalidate(2, weekDates = $$props.weekDates);
    		if ('weekDays' in $$props) $$invalidate(9, weekDays = $$props.weekDays);
    		if ('standardGridAreas' in $$props) $$invalidate(10, standardGridAreas = $$props.standardGridAreas);
    		if ('movedEvent' in $$props) movedEvent = $$props.movedEvent;
    		if ('currentWeekProjects' in $$props) $$invalidate(3, currentWeekProjects = $$props.currentWeekProjects);
    		if ('sunday' in $$props) $$invalidate(1, sunday = $$props.sunday);
    		if ('dragged' in $$props) $$invalidate(4, dragged = $$props.dragged);
    		if ('colors' in $$props) colors = $$props.colors;
    		if ('unassignedProjects' in $$props) $$invalidate(5, unassignedProjects = $$props.unassignedProjects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*lastMonday, $projects, sunday*/ 131075) {
    			if (lastMonday) {
    				$$invalidate(3, currentWeekProjects = $projects.filter(project => {
    					// console.log("MONDAY: " + lastMonday);
    					$$invalidate(1, sunday = new Date(lastMonday)); //to set Sunday date to Monday

    					sunday.setDate(lastMonday.getDate() + 6);
    					let monday = new Date(lastMonday); //to set Monday date to one day before
    					monday.setDate(lastMonday.getDate());

    					// console.log("SUNDAY: " + sunday);
    					return (new Date(project.startDate) >= monday || new Date(project.endDate) >= monday) && (new Date(project.endDate) <= sunday || new Date(project.startDate) <= sunday);
    				}));

    				projects.set($projects);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$projects*/ 131072) {
    			$$invalidate(5, unassignedProjects = $projects.filter(p => p.assignedTo === "none").sort((a, b) => new Date(a.endDate) > new Date(b.endDate) ? 1 : -1));
    		}
    	};

    	return [
    		lastMonday,
    		sunday,
    		weekDates,
    		currentWeekProjects,
    		dragged,
    		unassignedProjects,
    		$users,
    		send,
    		receive,
    		weekDays,
    		standardGridAreas,
    		getGridAreas,
    		handleDragStart,
    		handleDragStop,
    		handleDrop,
    		showNextWeek,
    		showPrevWeek,
    		$projects,
    		func
    	];
    }

    class Deployment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Deployment",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Elements/Logo.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/Elements/Logo.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M268.44 45.48A7.51 7.51 0 1 1 276 53a7.52 7.52 0 0 1-7.51-7.52");
    			attr_dev(path0, "fill", "#86bc25");
    			add_location(path0, file$1, 6, 5, 157);
    			attr_dev(path1, "d", "M43.06 25.09q0 13-7 20t-19.66 7H0V.22h17.56q12.21 0 18.86 6.39t6.64 18.48m-14.22.5q0-7.14-2.76-10.59t-8.38-3.45h-4v29.1h3.05q6.24 0 9.16-3.71t2.92-11.35M88.52 0h13.06v52.17H88.52zM144.44 32.71q0 9.51-5 14.82t-14 5.32q-8.62 0-13.71-5.44t-5.1-14.7q0-9.48 5-14.73t14-5.25a19.6 19.6 0 0 1 9.85 2.43 16.44 16.44 0 0 1 6.6 7 23 23 0 0 1 2.32 10.59m-24.52 0a17.55 17.55 0 0 0 1.31 7.61 4.5 4.5 0 0 0 4.37 2.61 4.38 4.38 0 0 0 4.29-2.61 18.13 18.13 0 0 0 1.25-7.61 17.38 17.38 0 0 0-1.26-7.49 5 5 0 0 0-8.65 0q-1.31 2.52-1.31 7.51M149.62 13.42h13.06v38.75h-13.06zM149.62 0h13.06v8.73h-13.06zM189.14 42.28a19 19 0 0 0 6.32-1.28v9.7a25.17 25.17 0 0 1-5 1.65 27.13 27.13 0 0 1-5.6.5q-6.57 0-9.48-3.3t-2.9-10.14v-16h-4.58v-10h4.58V3.53l13.12-2.29v12.18h8.34v10h-8.34v15.1c0 2.51 1.19 3.76 3.54 3.76M219.37 42.28a19 19 0 0 0 6.31-1.28v9.7a24.88 24.88 0 0 1-5 1.65 27.2 27.2 0 0 1-5.6.5c-4.38 0-7.55-1.1-9.48-3.3s-2.91-5.58-2.91-10.14v-16h-4.59v-10h4.57v-10l13.16-2.14v12.15h8.34v10h-8.34v15.1q0 3.76 3.54 3.76M260.58 17.3q-4.65-4.56-13.21-4.57-9 0-13.83 5.25t-4.84 15.07q0 9.51 5.23 14.65t14.68 5.15a42.81 42.81 0 0 0 7.81-.62 22.47 22.47 0 0 0 6.31-2.2l-2-8.73a28.69 28.69 0 0 1-4.22 1.38 28.32 28.32 0 0 1-6.32.66 8.93 8.93 0 0 1-6-1.84 6.66 6.66 0 0 1-2.32-5.1h23.34v-5.95q0-8.58-4.66-13.15M242.16 28a7.11 7.11 0 0 1 1.84-4.68 5.38 5.38 0 0 1 3.86-1.49 5.06 5.06 0 0 1 4 1.68 6.72 6.72 0 0 1 1.52 4.49ZM78.81 17.3q-4.65-4.56-13.21-4.57-9 0-13.82 5.25t-4.85 15.07q0 9.51 5.23 14.65t14.68 5.15a43 43 0 0 0 7.82-.62A22.41 22.41 0 0 0 81 50l-2-8.7a29.08 29.08 0 0 1-4.22 1.38 28.48 28.48 0 0 1-6.33.66 9 9 0 0 1-6-1.84 6.69 6.69 0 0 1-2.32-5.1h23.34v-5.95q0-8.58-4.66-13.15M60.39 28a7.11 7.11 0 0 1 1.82-4.67 5.38 5.38 0 0 1 3.86-1.49 5.06 5.06 0 0 1 4 1.68A6.78 6.78 0 0 1 71.62 28Z");
    			add_location(path1, file$1, 6, 95, 247);
    			attr_dev(g, "data-name", "Layer 2");
    			add_location(g, file$1, 5, 2, 129);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 283.46 53");
    			set_style(svg, "width", /*width*/ ctx[0]);
    			add_location(svg, file$1, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1) {
    				set_style(svg, "width", /*width*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	let { width } = $$props;
    	const writable_props = ['width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ width });

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !('width' in props)) {
    			console.warn("<Logo> was created without expected prop 'width'");
    		}
    	}

    	get width() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (104:2) {#if navActiveElement === "Home"}
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_3 = /*homeComponentArray*/ ctx[1];
    	validate_each_argument(each_value_3);
    	const get_key = ctx => /*component*/ ctx[14].id;
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*homeComponentArray, navActiveElement*/ 6) {
    				each_value_3 = /*homeComponentArray*/ ctx[1];
    				validate_each_argument(each_value_3);
    				group_outros();
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_3, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_3, each_1_anchor, get_each_context_3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(104:2) {#if navActiveElement === \\\"Home\\\"}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#each homeComponentArray as component (component.id)}
    function create_each_block_3(key_1, ctx) {
    	let section;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[14].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("form", /*form_handler*/ ctx[10]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(section, "class", "content svelte-10i8us4");
    			add_location(section, file, 105, 6, 2831);
    			this.first = section;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			append_dev(section, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (switch_value !== (switch_value = /*component*/ ctx[14].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("form", /*form_handler*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(105:4) {#each homeComponentArray as component (component.id)}",
    		ctx
    	});

    	return block;
    }

    // (111:2) {#if navActiveElement === "Team"}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*teamComponentArray*/ ctx[0];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*component*/ ctx[14].id;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamComponentArray*/ 1) {
    				each_value_2 = /*teamComponentArray*/ ctx[0];
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_2, each_1_anchor, get_each_context_2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(111:2) {#if navActiveElement === \\\"Team\\\"}",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#each teamComponentArray as component (component.id)}
    function create_each_block_2(key_1, ctx) {
    	let section;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[14].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(section, "class", "content svelte-10i8us4");
    			add_location(section, file, 112, 6, 3097);
    			this.first = section;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			append_dev(section, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (switch_value !== (switch_value = /*component*/ ctx[14].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(112:4) {#each teamComponentArray as component (component.id)}",
    		ctx
    	});

    	return block;
    }

    // (118:2) {#if navActiveElement === "Submit"}
    function create_if_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*submitComponentArray*/ ctx[3];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[14].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*submitComponentArray*/ 8) {
    				each_value_1 = /*submitComponentArray*/ ctx[3];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(118:2) {#if navActiveElement === \\\"Submit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#each submitComponentArray as component (component.id)}
    function create_each_block_1(key_1, ctx) {
    	let section;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[14].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(section, "class", "content svelte-10i8us4");
    			add_location(section, file, 119, 6, 3321);
    			this.first = section;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			append_dev(section, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (switch_value !== (switch_value = /*component*/ ctx[14].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(119:4) {#each submitComponentArray as component (component.id)}",
    		ctx
    	});

    	return block;
    }

    // (126:2) {#if navActiveElement === "Deployment"}
    function create_if_block(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*deploymentComponentArray*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[14].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*deploymentComponentArray*/ 16) {
    				each_value = /*deploymentComponentArray*/ ctx[4];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(126:2) {#if navActiveElement === \\\"Deployment\\\"}",
    		ctx
    	});

    	return block;
    }

    // (127:4) {#each deploymentComponentArray as component (component.id)}
    function create_each_block(key_1, ctx) {
    	let section;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*component*/ ctx[14].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(section, "class", "content svelte-10i8us4");
    			add_location(section, file, 127, 6, 3554);
    			this.first = section;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			append_dev(section, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (switch_value !== (switch_value = /*component*/ ctx[14].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(127:4) {#each deploymentComponentArray as component (component.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let main;
    	let nav;
    	let div0;
    	let logo;
    	let t1;
    	let div7;
    	let div5;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div6;
    	let img;
    	let img_src_value;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	logo = new Logo({ props: { width: "9rem" }, $$inline: true });
    	let if_block0 = /*navActiveElement*/ ctx[2] === "Home" && create_if_block_3(ctx);
    	let if_block1 = /*navActiveElement*/ ctx[2] === "Team" && create_if_block_2(ctx);
    	let if_block2 = /*navActiveElement*/ ctx[2] === "Submit" && create_if_block_1(ctx);
    	let if_block3 = /*navActiveElement*/ ctx[2] === "Deployment" && create_if_block(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = space();
    			main = element("main");
    			nav = element("nav");
    			div0 = element("div");
    			create_component(logo.$$.fragment);
    			t1 = space();
    			div7 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div1.textContent = "Home";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Submit request";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Team";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Deployment";
    			t9 = space();
    			div6 = element("div");
    			img = element("img");
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			if (if_block2) if_block2.c();
    			t13 = space();
    			if (if_block3) if_block3.c();
    			t14 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file, 49, 2, 1301);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file, 50, 2, 1365);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file, 51, 2, 1438);
    			attr_dev(div0, "class", "logo svelte-10i8us4");
    			add_location(div0, file, 59, 4, 1617);
    			attr_dev(div1, "class", "navElement svelte-10i8us4");
    			toggle_class(div1, "navActive", /*navActiveElement*/ ctx[2] === "Home");
    			add_location(div1, file, 65, 8, 1790);
    			attr_dev(div2, "class", "navElement svelte-10i8us4");
    			toggle_class(div2, "navActive", /*navActiveElement*/ ctx[2] === "Submit");
    			add_location(div2, file, 73, 8, 1984);
    			attr_dev(div3, "class", "navElement svelte-10i8us4");
    			toggle_class(div3, "navActive", /*navActiveElement*/ ctx[2] === "Team");
    			add_location(div3, file, 81, 8, 2192);
    			attr_dev(div4, "class", "navElement svelte-10i8us4");
    			toggle_class(div4, "navActive", /*navActiveElement*/ ctx[2] === "Deployment");
    			add_location(div4, file, 89, 8, 2386);
    			attr_dev(div5, "class", "navElements svelte-10i8us4");
    			add_location(div5, file, 64, 6, 1756);
    			if (!src_url_equal(img.src, img_src_value = "/testing/champerera.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Chami Perera");
    			attr_dev(img, "class", "svelte-10i8us4");
    			add_location(img, file, 99, 8, 2640);
    			attr_dev(div6, "class", "userInfo svelte-10i8us4");
    			add_location(div6, file, 98, 6, 2609);
    			attr_dev(div7, "class", "navWrapper svelte-10i8us4");
    			add_location(div7, file, 63, 4, 1725);
    			attr_dev(nav, "class", "svelte-10i8us4");
    			add_location(nav, file, 58, 2, 1607);
    			attr_dev(main, "class", "svelte-10i8us4");
    			add_location(main, file, 57, 0, 1598);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, div0);
    			mount_component(logo, div0, null);
    			append_dev(nav, t1);
    			append_dev(nav, div7);
    			append_dev(div7, div5);
    			append_dev(div5, div1);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, img);
    			append_dev(main, t10);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t11);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t12);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t13);
    			if (if_block3) if_block3.m(main, null);
    			insert_dev(target, t14, anchor);
    			mount_component(footer, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[7], false, false, false),
    					listen_dev(div3, "click", /*click_handler_3*/ ctx[8], false, false, false),
    					listen_dev(div4, "click", /*click_handler_4*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navActiveElement*/ 4) {
    				toggle_class(div1, "navActive", /*navActiveElement*/ ctx[2] === "Home");
    			}

    			if (dirty & /*navActiveElement*/ 4) {
    				toggle_class(div2, "navActive", /*navActiveElement*/ ctx[2] === "Submit");
    			}

    			if (dirty & /*navActiveElement*/ 4) {
    				toggle_class(div3, "navActive", /*navActiveElement*/ ctx[2] === "Team");
    			}

    			if (dirty & /*navActiveElement*/ 4) {
    				toggle_class(div4, "navActive", /*navActiveElement*/ ctx[2] === "Deployment");
    			}

    			if (/*navActiveElement*/ ctx[2] === "Home") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*navActiveElement*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t11);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*navActiveElement*/ ctx[2] === "Team") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*navActiveElement*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t12);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*navActiveElement*/ ctx[2] === "Submit") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*navActiveElement*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, t13);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*navActiveElement*/ ctx[2] === "Deployment") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*navActiveElement*/ 4) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(logo);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t14);
    			destroy_component(footer, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let homeComponentArray;
    	let teamComponentArray;
    	let deploymentComponentArray;
    	let submitComponentArray;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const [send, receive] = crossfade({});
    	let navActiveElement = "Submit";

    	let sectionComponents = [
    		{
    			id: 1,
    			name: "Home",
    			component: Home,
    			visible: true
    		},
    		{
    			id: 2,
    			name: "Team",
    			component: Team,
    			visible: false
    		},
    		{
    			id: 3,
    			name: "Submit",
    			component: Submit,
    			visible: false
    		},
    		{
    			id: 4,
    			name: "Deployment",
    			component: Deployment,
    			visible: false
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(2, navActiveElement = "Home");
    	const click_handler_1 = () => $$invalidate(2, navActiveElement = "Home");
    	const click_handler_2 = () => $$invalidate(2, navActiveElement = "Submit");
    	const click_handler_3 = () => $$invalidate(2, navActiveElement = "Team");
    	const click_handler_4 = () => $$invalidate(2, navActiveElement = "Deployment");
    	const form_handler = () => $$invalidate(2, navActiveElement = "Submit");

    	$$self.$capture_state = () => ({
    		crossfade,
    		fade,
    		send,
    		receive,
    		Footer,
    		Home,
    		Team,
    		Submit,
    		Deployment,
    		Logo,
    		navActiveElement,
    		sectionComponents,
    		teamComponentArray,
    		homeComponentArray,
    		submitComponentArray,
    		deploymentComponentArray
    	});

    	$$self.$inject_state = $$props => {
    		if ('navActiveElement' in $$props) $$invalidate(2, navActiveElement = $$props.navActiveElement);
    		if ('sectionComponents' in $$props) $$invalidate(13, sectionComponents = $$props.sectionComponents);
    		if ('teamComponentArray' in $$props) $$invalidate(0, teamComponentArray = $$props.teamComponentArray);
    		if ('homeComponentArray' in $$props) $$invalidate(1, homeComponentArray = $$props.homeComponentArray);
    		if ('submitComponentArray' in $$props) $$invalidate(3, submitComponentArray = $$props.submitComponentArray);
    		if ('deploymentComponentArray' in $$props) $$invalidate(4, deploymentComponentArray = $$props.deploymentComponentArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*homeComponentArray*/ 2) {
    			console.log(homeComponentArray);
    		}

    		if ($$self.$$.dirty & /*teamComponentArray*/ 1) {
    			console.log(teamComponentArray);
    		}
    	};

    	$$invalidate(1, homeComponentArray = sectionComponents.filter(comp => comp.name === "Home"));
    	$$invalidate(0, teamComponentArray = sectionComponents.filter(comp => comp.name === "Team"));
    	$$invalidate(4, deploymentComponentArray = sectionComponents.filter(comp => comp.name === "Deployment"));
    	$$invalidate(3, submitComponentArray = sectionComponents.filter(comp => comp.name === "Submit"));

    	return [
    		teamComponentArray,
    		homeComponentArray,
    		navActiveElement,
    		submitComponentArray,
    		deploymentComponentArray,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		form_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
