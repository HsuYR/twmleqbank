
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

    /* src/Shuffle.svelte generated by Svelte v3.38.2 */

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

    /* src/QBank.svelte generated by Svelte v3.38.2 */

    function fetchQbank(subjectUrls) {
    	return Promise.all(subjectUrls.map(url => fetch("qbank/" + url + ".json").then(e => e.json()))).then(data => {
    		let qbank = data.flat();

    		let subjects = qbank.map(e => e.subject).filter((value, index, self) => {
    			return self.indexOf(value) === index;
    		});

    		let sessions = qbank.map(e => e.session).filter((value, index, self) => {
    			return self.indexOf(value) === index;
    		}).sort();

    		function query_question(subjects_query, sessions_query, do_shuffle = true) {
    			console.log(`subjects (${subjects_query})`);
    			console.log(`sessions (${sessions_query})`);
    			let result = qbank.filter(e => subjects_query.includes(e.subject)).filter(e => sessions_query.includes(e.session));
    			result = JSON.parse(JSON.stringify(result));

    			if (do_shuffle) {
    				shuffle(result);

    				result.map(result => {
    					shuffle(result.choices);
    				});
    			}

    			console.log(result);
    			return result;
    		}

    		return { subjects, sessions, query_question };
    	});
    }

    /* src/Exam.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/Exam.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (16:12) {#if question.img_link }
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*question*/ ctx[8].img_link)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "無法顯示圖片");
    			attr_dev(img, "class", "svelte-fa22vv");
    			add_location(img, file$1, 16, 14, 692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions*/ 1 && img.src !== (img_src_value = /*question*/ ctx[8].img_link)) {
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
    		source: "(16:12) {#if question.img_link }",
    		ctx
    	});

    	return block;
    }

    // (20:12) {#each question.choices as choice, i}
    function create_each_block_1$1(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*choice*/ ctx[11].text + "";
    	let t1;
    	let label_class_value;
    	let mounted;
    	let dispose;
    	/*$$binding_groups*/ ctx[6][0][/*question_index*/ ctx[10]] = [];

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[5].call(input, /*each_value*/ ctx[9], /*question_index*/ ctx[10]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*question*/ ctx[8], /*each_value*/ ctx[9], /*question_index*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");
    			input.__value = /*i*/ ctx[13];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[6][0][/*question_index*/ ctx[10]].push(input);
    			add_location(input, file$1, 21, 16, 970);
    			attr_dev(label, "class", label_class_value = "" + (/*question*/ ctx[8].showing + " " + (/*choice*/ ctx[11].is_correct ? "correct" : "incorrect") + " svelte-fa22vv"));
    			add_location(label, file$1, 20, 14, 825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*question*/ ctx[8].current_answer;
    			append_dev(label, t0);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", input_change_handler),
    					listen_dev(label, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*questions*/ 1) {
    				input.checked = input.__value === /*question*/ ctx[8].current_answer;
    			}

    			if (dirty & /*questions*/ 1 && t1_value !== (t1_value = /*choice*/ ctx[11].text + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*questions*/ 1 && label_class_value !== (label_class_value = "" + (/*question*/ ctx[8].showing + " " + (/*choice*/ ctx[11].is_correct ? "correct" : "incorrect") + " svelte-fa22vv"))) {
    				attr_dev(label, "class", label_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[6][0][/*question_index*/ ctx[10]].splice(/*$$binding_groups*/ ctx[6][0][/*question_index*/ ctx[10]].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(20:12) {#each question.choices as choice, i}",
    		ctx
    	});

    	return block;
    }

    // (12:8) {#each questions as question}
    function create_each_block$1(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*question*/ ctx[8].session + "";
    	let t0;
    	let t1;
    	let t2_value = /*question*/ ctx[8].no + "";
    	let t2;
    	let t3;
    	let t4;
    	let p1;
    	let t5_value = /*question*/ ctx[8].question + "";
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let if_block = /*question*/ ctx[8].img_link && create_if_block(ctx);
    	let each_value_1 = /*question*/ ctx[8].choices;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    			add_location(p0, file$1, 13, 12, 560);
    			add_location(p1, file$1, 14, 12, 614);
    			attr_dev(div, "class", "svelte-fa22vv");
    			add_location(div, file$1, 12, 10, 542);
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
    			if (dirty & /*questions*/ 1 && t0_value !== (t0_value = /*question*/ ctx[8].session + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*questions*/ 1 && t2_value !== (t2_value = /*question*/ ctx[8].no + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*questions*/ 1 && t5_value !== (t5_value = /*question*/ ctx[8].question + "")) set_data_dev(t5, t5_value);

    			if (/*question*/ ctx[8].img_link) {
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

    			if (dirty & /*questions*/ 1) {
    				each_value_1 = /*question*/ ctx[8].choices;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:8) {#each questions as question}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let form;
    	let p;
    	let t0;
    	let t1_value = /*questions*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value = /*questions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			p = element("p");
    			t0 = text("共");
    			t1 = text(t1_value);
    			t2 = text("題，已作答");
    			t3 = text(/*answered*/ ctx[1]);
    			t4 = text("題，答對");
    			t5 = text(/*correctly_answered*/ ctx[2]);
    			t6 = text(" (");
    			t7 = text(/*correct_percent*/ ctx[3]);
    			t8 = text("%)");
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$1, 10, 8, 407);
    			add_location(form, file$1, 9, 4, 367);
    			add_location(main, file$1, 8, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(p, t8);
    			append_dev(form, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[4]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questions*/ 1 && t1_value !== (t1_value = /*questions*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*answered*/ 2) set_data_dev(t3, /*answered*/ ctx[1]);
    			if (dirty & /*correctly_answered*/ 4) set_data_dev(t5, /*correctly_answered*/ ctx[2]);
    			if (dirty & /*correct_percent*/ 8) set_data_dev(t7, /*correct_percent*/ ctx[3]);

    			if (dirty & /*questions*/ 1) {
    				each_value = /*questions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	let answered;
    	let correctly_answered;
    	let correct_percent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Exam", slots, []);
    	let { questions } = $$props;
    	const writable_props = ["questions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Exam> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler(each_value, question_index) {
    		each_value[question_index].current_answer = this.__value;
    		$$invalidate(0, questions);
    	}

    	const click_handler = (question, each_value, question_index) => {
    		$$invalidate(0, each_value[question_index].showing = "showing", questions);
    	};

    	$$self.$$set = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    	};

    	$$self.$capture_state = () => ({
    		questions,
    		answered,
    		correctly_answered,
    		correct_percent
    	});

    	$$self.$inject_state = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    		if ("answered" in $$props) $$invalidate(1, answered = $$props.answered);
    		if ("correctly_answered" in $$props) $$invalidate(2, correctly_answered = $$props.correctly_answered);
    		if ("correct_percent" in $$props) $$invalidate(3, correct_percent = $$props.correct_percent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*questions*/ 1) {
    			$$invalidate(1, answered = questions.filter(e => e.showing == "showing").length);
    		}

    		if ($$self.$$.dirty & /*questions*/ 1) {
    			$$invalidate(2, correctly_answered = questions.filter(e => e.current_answer !== undefined
    			? e.choices[e.current_answer].is_correct
    			: false).length);
    		}

    		if ($$self.$$.dirty & /*answered, correctly_answered*/ 6) {
    			$$invalidate(3, correct_percent = answered == 0
    			? 0
    			: Math.round(correctly_answered * 100 / answered));
    		}
    	};

    	return [
    		questions,
    		answered,
    		correctly_answered,
    		correct_percent,
    		submit_handler,
    		input_change_handler,
    		$$binding_groups,
    		click_handler
    	];
    }

    class Exam extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { questions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Exam",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*questions*/ ctx[0] === undefined && !("questions" in props)) {
    			console.warn("<Exam> was created without expected prop 'questions'");
    		}
    	}

    	get questions() {
    		throw new Error("<Exam>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set questions(value) {
    		throw new Error("<Exam>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   import {fetchQbank}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import {fetchQbank}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:then}
    function create_then_block(ctx) {
    	let form;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let button;
    	let t3;
    	let exam;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*subjects*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*sessions*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	exam = new Exam({
    			props: { questions: /*questions_selected*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t3 = space();
    			create_component(exam.$$.fragment);
    			attr_dev(div0, "class", "subject_selection svelte-kj8am1");
    			add_location(div0, file, 45, 4, 842);
    			attr_dev(div1, "class", "session_selection svelte-kj8am1");
    			add_location(div1, file, 54, 4, 1075);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-kj8am1");
    			add_location(button, file, 63, 4, 1312);
    			attr_dev(form, "class", "question_selection svelte-kj8am1");
    			add_location(form, file, 43, 1, 763);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(form, t0);
    			append_dev(form, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(form, t1);
    			append_dev(form, button);
    			insert_dev(target, t3, anchor);
    			mount_component(exam, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects, subjects_query*/ 5) {
    				each_value_1 = /*subjects*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*sessions, sessions_query*/ 10) {
    				each_value = /*sessions*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const exam_changes = {};
    			if (dirty & /*questions_selected*/ 16) exam_changes.questions = /*questions_selected*/ ctx[4];
    			exam.$set(exam_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(exam.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(exam.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(exam, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(43:2) {:then}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#each subjects as subject}
    function create_each_block_1(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*subject*/ ctx[14] + "";
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
    			input.__value = input_value_value = /*subject*/ ctx[14];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[7][1].push(input);
    			add_location(input, file, 48, 12, 938);
    			add_location(label, file, 47, 8, 918);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*subjects_query*/ ctx[2].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subjects*/ 1 && input_value_value !== (input_value_value = /*subject*/ ctx[14])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*subjects_query*/ 4) {
    				input.checked = ~/*subjects_query*/ ctx[2].indexOf(input.__value);
    			}

    			if (dirty & /*subjects*/ 1 && t1_value !== (t1_value = /*subject*/ ctx[14] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[7][1].splice(/*$$binding_groups*/ ctx[7][1].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(47:8) {#each subjects as subject}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#each sessions as session}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*session*/ ctx[11] + "";
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
    			input.__value = input_value_value = /*session*/ ctx[11];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[7][0].push(input);
    			add_location(input, file, 57, 12, 1171);
    			add_location(label, file, 56, 8, 1151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*sessions_query*/ ctx[3].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler_1*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sessions*/ 2 && input_value_value !== (input_value_value = /*session*/ ctx[11])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*sessions_query*/ 8) {
    				input.checked = ~/*sessions_query*/ ctx[3].indexOf(input.__value);
    			}

    			if (dirty & /*sessions*/ 2 && t1_value !== (t1_value = /*session*/ ctx[11] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[7][0].splice(/*$$binding_groups*/ ctx[7][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(56:8) {#each sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (41:21)    <p>正在載入題庫...</p>   {:then}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "正在載入題庫...";
    			add_location(p, file, 41, 2, 735);
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
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(41:21)    <p>正在載入題庫...</p>   {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		blocks: [,,,]
    	};

    	handle_promise(fetchQbank, info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "二階國考題庫";
    			t1 = space();
    			info.block.c();
    			attr_dev(h1, "class", "svelte-kj8am1");
    			add_location(h1, file, 39, 1, 695);
    			attr_dev(main, "class", "svelte-kj8am1");
    			add_location(main, file, 38, 0, 687);
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
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

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
    		"醫學倫理",
    		"產科",
    		"婦女生殖內分泌",
    		"內分泌及乳房外科",
    		"皮膚科"
    	];

    	let subjects = [], sessions = [];
    	let subjects_query = [], sessions_query = [];
    	let queryQbank;
    	let questions_selected = [];

    	fetchQbank(subjectUrls).then(qb => {
    		$$invalidate(0, subjects = qb.subjects);
    		$$invalidate(1, sessions = qb.sessions);
    		queryQbank = qb.query_question;
    	});

    	function handleSubmit() {
    		$$invalidate(4, questions_selected = queryQbank(subjects_query, sessions_query));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], []];

    	function input_change_handler() {
    		subjects_query = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(2, subjects_query);
    	}

    	function input_change_handler_1() {
    		sessions_query = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(3, sessions_query);
    	}

    	$$self.$capture_state = () => ({
    		fetchQbank,
    		Exam,
    		subjectUrls,
    		subjects,
    		sessions,
    		subjects_query,
    		sessions_query,
    		queryQbank,
    		questions_selected,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("subjects" in $$props) $$invalidate(0, subjects = $$props.subjects);
    		if ("sessions" in $$props) $$invalidate(1, sessions = $$props.sessions);
    		if ("subjects_query" in $$props) $$invalidate(2, subjects_query = $$props.subjects_query);
    		if ("sessions_query" in $$props) $$invalidate(3, sessions_query = $$props.sessions_query);
    		if ("queryQbank" in $$props) queryQbank = $$props.queryQbank;
    		if ("questions_selected" in $$props) $$invalidate(4, questions_selected = $$props.questions_selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		subjects,
    		sessions,
    		subjects_query,
    		sessions_query,
    		questions_selected,
    		handleSubmit,
    		input_change_handler,
    		$$binding_groups,
    		input_change_handler_1
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
