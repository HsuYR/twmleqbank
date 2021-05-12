
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
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

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[17] = list;
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   //import * as qbankJSON from './qbank/qbank.json'   //let qbank = qbankJSON.default;   //console.log(JSON.stringify(qbank));    let qbank  let subjects   let sessions    const subjectUrls = [     '心臟內科',     '胸腔內科',     '胃腸肝膽科',     '腎臟科',     '免疫風濕科',     '血液科',     '腫瘤科',     '感染科',     '新陳代謝科',     '家庭醫學科',     '醫學倫理'   ];   let fetchQbank = Promise.all(   subjectUrls.map(url =>       fetch('qbank/' + url + '.json')           .then(e => e.json())       )   ).then(data => {       qbank = data.flat();       populateQuestionSelection(qbank)   }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   //import * as qbankJSON from './qbank/qbank.json'   //let qbank = qbankJSON.default;   //console.log(JSON.stringify(qbank));    let qbank  let subjects   let sessions    const subjectUrls = [     '心臟內科',     '胸腔內科',     '胃腸肝膽科',     '腎臟科',     '免疫風濕科',     '血液科',     '腫瘤科',     '感染科',     '新陳代謝科',     '家庭醫學科',     '醫學倫理'   ];   let fetchQbank = Promise.all(   subjectUrls.map(url =>       fetch('qbank/' + url + '.json')           .then(e => e.json())       )   ).then(data => {       qbank = data.flat();       populateQuestionSelection(qbank)   }",
    		ctx
    	});

    	return block;
    }

    // (88:2) {:then}
    function create_then_block(ctx) {
    	let form0;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let button;
    	let t3;
    	let form1;
    	let p;
    	let t4;
    	let t5_value = /*questions_selected*/ ctx[4].length + "";
    	let t5;
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*subjects*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*sessions*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*questions_selected*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form0 = element("form");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t3 = space();
    			form1 = element("form");
    			p = element("p");
    			t4 = text("共");
    			t5 = text(t5_value);
    			t6 = text("題");
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "subject_selection svelte-3eze0y");
    			add_location(div0, file, 90, 4, 2218);
    			attr_dev(div1, "class", "session_selection svelte-3eze0y");
    			add_location(div1, file, 99, 4, 2446);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-3eze0y");
    			add_location(button, file, 108, 2, 2673);
    			attr_dev(form0, "class", "question_selection svelte-3eze0y");
    			add_location(form0, file, 88, 1, 2139);
    			add_location(p, file, 114, 4, 2764);
    			add_location(form1, file, 113, 2, 2728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form0, anchor);
    			append_dev(form0, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(form0, t0);
    			append_dev(form0, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(form0, t1);
    			append_dev(form0, button);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, form1, anchor);
    			append_dev(form1, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(form1, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(form0, "submit", prevent_default(/*handleSubmit*/ ctx[6]), false, true, false),
    					listen_dev(form1, "submit", prevent_default(/*submit_handler*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects, subjects_selected*/ 5) {
    				each_value_3 = /*subjects*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*sessions, sessions_selected*/ 10) {
    				each_value_2 = /*sessions*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*questions_selected*/ 16 && t5_value !== (t5_value = /*questions_selected*/ ctx[4].length + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*questions_selected, toABCD*/ 16) {
    				each_value = /*questions_selected*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form0);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(form1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(88:2) {:then}",
    		ctx
    	});

    	return block;
    }

    // (92:6) {#each subjects as subject}
    function create_each_block_3(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*subject*/ ctx[25] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*subject*/ ctx[25];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[9][1].push(input);
    			add_location(input, file, 93, 10, 2310);
    			add_location(label, file, 92, 8, 2292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*subjects_selected*/ ctx[2].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects*/ 1 && input_value_value !== (input_value_value = /*subject*/ ctx[25])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*subjects_selected*/ 4) {
    				input.checked = ~/*subjects_selected*/ ctx[2].indexOf(input.__value);
    			}

    			if (dirty & /*subjects*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[25] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[9][1].splice(/*$$binding_groups*/ ctx[9][1].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(92:6) {#each subjects as subject}",
    		ctx
    	});

    	return block;
    }

    // (101:6) {#each sessions as session}
    function create_each_block_2(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*session*/ ctx[22] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*session*/ ctx[22];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file, 102, 10, 2538);
    			add_location(label, file, 101, 8, 2520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*sessions_selected*/ ctx[3].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler_1*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sessions*/ 2 && input_value_value !== (input_value_value = /*session*/ ctx[22])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*sessions_selected*/ 8) {
    				input.checked = ~/*sessions_selected*/ ctx[3].indexOf(input.__value);
    			}

    			if (dirty & /*sessions*/ 2 && t1_value !== (t1_value = /*session*/ ctx[22] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[9][0].splice(/*$$binding_groups*/ ctx[9][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(101:6) {#each sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (120:8) {#if question.img_link }
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*question*/ ctx[16].img_link)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "無法顯示圖片");
    			attr_dev(img, "class", "svelte-3eze0y");
    			add_location(img, file, 120, 10, 3009);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions_selected*/ 16 && img.src !== (img_src_value = /*question*/ ctx[16].img_link)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(120:8) {#if question.img_link }",
    		ctx
    	});

    	return block;
    }

    // (124:8) {#each question.choices as choice, i}
    function create_each_block_1(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*choice*/ ctx[19] + "";
    	let t1;
    	let label_class_value;
    	let mounted;
    	let dispose;
    	/*$$binding_groups*/ ctx[9][2][/*qi*/ ctx[18]] = [];

    	function input_change_handler_2() {
    		/*input_change_handler_2*/ ctx[11].call(input, /*each_value*/ ctx[17], /*qi*/ ctx[18]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[12](/*question*/ ctx[16], /*each_value*/ ctx[17], /*qi*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");
    			input.__value = /*i*/ ctx[21];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[9][2][/*qi*/ ctx[18]].push(input);
    			add_location(input, file, 125, 12, 3299);

    			attr_dev(label, "class", label_class_value = "" + (/*question*/ ctx[16].showing + " " + (/*question*/ ctx[16].answer.includes(toABCD(/*i*/ ctx[21]))
    			? "correct_answer"
    			: "incorrect_answer") + " svelte-3eze0y"));

    			add_location(label, file, 124, 10, 3126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*question*/ ctx[16].current_answer;
    			append_dev(label, t0);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", input_change_handler_2),
    					listen_dev(label, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*questions_selected*/ 16) {
    				input.checked = input.__value === /*question*/ ctx[16].current_answer;
    			}

    			if (dirty & /*questions_selected*/ 16 && t1_value !== (t1_value = /*choice*/ ctx[19] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*questions_selected*/ 16 && label_class_value !== (label_class_value = "" + (/*question*/ ctx[16].showing + " " + (/*question*/ ctx[16].answer.includes(toABCD(/*i*/ ctx[21]))
    			? "correct_answer"
    			: "incorrect_answer") + " svelte-3eze0y"))) {
    				attr_dev(label, "class", label_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[9][2][/*qi*/ ctx[18]].splice(/*$$binding_groups*/ ctx[9][2][/*qi*/ ctx[18]].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(124:8) {#each question.choices as choice, i}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#each questions_selected as question, qi}
    function create_each_block(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*question*/ ctx[16].session + "";
    	let t0;
    	let t1;
    	let t2_value = /*question*/ ctx[16].no + "";
    	let t2;
    	let t3;
    	let t4;
    	let p1;
    	let t5_value = /*question*/ ctx[16].question + "";
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let if_block = /*question*/ ctx[16].img_link && create_if_block(ctx);
    	let each_value_1 = /*question*/ ctx[16].choices;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = text(" 第");
    			t2 = text(t2_value);
    			t3 = text("題");
    			t4 = space();
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			add_location(p0, file, 117, 8, 2889);
    			add_location(p1, file, 118, 8, 2939);
    			attr_dev(div, "class", "question_set svelte-3eze0y");
    			add_location(div, file, 116, 6, 2854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(p1, t5);
    			append_dev(div, t6);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions_selected*/ 16 && t0_value !== (t0_value = /*question*/ ctx[16].session + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*questions_selected*/ 16 && t2_value !== (t2_value = /*question*/ ctx[16].no + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*questions_selected*/ 16 && t5_value !== (t5_value = /*question*/ ctx[16].question + "")) set_data_dev(t5, t5_value);

    			if (/*question*/ ctx[16].img_link) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*questions_selected, toABCD*/ 16) {
    				each_value_1 = /*question*/ ctx[16].choices;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(116:4) {#each questions_selected as question, qi}",
    		ctx
    	});

    	return block;
    }

    // (86:21)    <p>正在載入題庫...</p>   {:then}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "正在載入題庫...";
    			add_location(p, file, 86, 2, 2111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(86:21)    <p>正在載入題庫...</p>   {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block
    	};

    	handle_promise(/*fetchQbank*/ ctx[5], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "二階國考題庫";
    			t1 = space();
    			info.block.c();
    			attr_dev(h1, "class", "svelte-3eze0y");
    			add_location(h1, file, 84, 1, 2071);
    			attr_dev(main, "class", "svelte-3eze0y");
    			add_location(main, file, 83, 0, 2063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    function toABCD(i) {
    	if (i === 0) return "A";
    	if (i === 1) return "B";
    	if (i === 2) return "C";
    	if (i === 3) return "D";
    }

    function shuffle(array) {
    	var currentIndex = array.length, temporaryValue, randomIndex;

    	// While there remain elements to shuffle...
    	while (0 !== currentIndex) {
    		// Pick a remaining element...
    		randomIndex = Math.floor(Math.random() * currentIndex);

    		currentIndex -= 1;

    		// And swap it with the current element.
    		temporaryValue = array[currentIndex];

    		array[currentIndex] = array[randomIndex];
    		array[randomIndex] = temporaryValue;
    	}

    	return array;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let qbank;
    	let subjects;
    	let sessions;

    	const subjectUrls = [
    		"心臟內科",
    		"胸腔內科",
    		"胃腸肝膽科",
    		"腎臟科",
    		"免疫風濕科",
    		"血液科",
    		"腫瘤科",
    		"感染科",
    		"新陳代謝科",
    		"家庭醫學科",
    		"醫學倫理"
    	];

    	let fetchQbank = Promise.all(subjectUrls.map(url => fetch("qbank/" + url + ".json").then(e => e.json()))).then(data => {
    		qbank = data.flat();
    		populateQuestionSelection(qbank);
    	});

    	function populateQuestionSelection(qbank) {
    		$$invalidate(0, subjects = qbank.map(e => e.subject).filter((value, index, self) => {
    			return self.indexOf(value) === index;
    		}));

    		$$invalidate(1, sessions = qbank.map(e => e.session).filter((value, index, self) => {
    			return self.indexOf(value) === index;
    		}).sort());
    	}

    	let subjects_selected = [], sessions_selected = [];
    	let questions_selected = [];

    	function handleSubmit() {
    		console.log(`subject (${subjects_selected})`);
    		console.log(`session (${sessions_selected})`);
    		$$invalidate(4, questions_selected = qbank.filter(e => subjects_selected.includes(e.subject)).filter(e => sessions_selected.includes(e.session)));
    		console.log(questions_selected);
    		$$invalidate(4, questions_selected = JSON.parse(JSON.stringify(questions_selected)));
    		shuffle(questions_selected);
    		console.log(questions_selected);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], [], []];

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		subjects_selected = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(2, subjects_selected);
    	}

    	function input_change_handler_1() {
    		sessions_selected = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(3, sessions_selected);
    	}

    	function input_change_handler_2(each_value, qi) {
    		each_value[qi].current_answer = this.__value;
    		$$invalidate(4, questions_selected);
    	}

    	const click_handler = (question, each_value, qi) => {
    		$$invalidate(4, each_value[qi].showing = "showing", questions_selected);
    	};

    	$$self.$capture_state = () => ({
    		qbank,
    		subjects,
    		sessions,
    		subjectUrls,
    		fetchQbank,
    		populateQuestionSelection,
    		subjects_selected,
    		sessions_selected,
    		questions_selected,
    		handleSubmit,
    		toABCD,
    		shuffle
    	});

    	$$self.$inject_state = $$props => {
    		if ("qbank" in $$props) qbank = $$props.qbank;
    		if ("subjects" in $$props) $$invalidate(0, subjects = $$props.subjects);
    		if ("sessions" in $$props) $$invalidate(1, sessions = $$props.sessions);
    		if ("fetchQbank" in $$props) $$invalidate(5, fetchQbank = $$props.fetchQbank);
    		if ("subjects_selected" in $$props) $$invalidate(2, subjects_selected = $$props.subjects_selected);
    		if ("sessions_selected" in $$props) $$invalidate(3, sessions_selected = $$props.sessions_selected);
    		if ("questions_selected" in $$props) $$invalidate(4, questions_selected = $$props.questions_selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		subjects,
    		sessions,
    		subjects_selected,
    		sessions_selected,
    		questions_selected,
    		fetchQbank,
    		handleSubmit,
    		submit_handler,
    		input_change_handler,
    		$$binding_groups,
    		input_change_handler_1,
    		input_change_handler_2,
    		click_handler
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
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
