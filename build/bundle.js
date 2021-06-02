
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    /* src/Exam.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/Exam.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[11] = list;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (24:12) {#if question.img_link }
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*question*/ ctx[10].img_link)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "無法顯示圖片");
    			attr_dev(img, "class", "svelte-12qzhp3");
    			add_location(img, file$1, 24, 14, 888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions*/ 1 && img.src !== (img_src_value = /*question*/ ctx[10].img_link)) {
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
    		source: "(24:12) {#if question.img_link }",
    		ctx
    	});

    	return block;
    }

    // (28:12) {#each question.choicesOrder as ci}
    function create_each_block_1$1(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t;
    	let html_tag;
    	let raw_value = /*question*/ ctx[10].choices[/*ci*/ ctx[13]].text + "";
    	let mounted;
    	let dispose;
    	/*$$binding_groups*/ ctx[9][0][/*question_index*/ ctx[12]] = [];

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[8].call(input, /*each_value*/ ctx[11], /*question_index*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*ci*/ ctx[13];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[9][0][/*question_index*/ ctx[12]].push(input);
    			add_location(input, file$1, 29, 16, 1186);
    			html_tag = new HtmlTag(null);
    			attr_dev(label, "class", "svelte-12qzhp3");
    			toggle_class(label, "showing", "currentAnswer" in /*question*/ ctx[10]);
    			toggle_class(label, "correct", /*question*/ ctx[10].choices[/*ci*/ ctx[13]].is_correct);
    			toggle_class(label, "incorrect", !/*question*/ ctx[10].choices[/*ci*/ ctx[13]].is_correct);
    			add_location(label, file$1, 28, 14, 1013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*question*/ ctx[10].currentAnswer;
    			append_dev(label, t);
    			html_tag.m(raw_value, label);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*questions*/ 1 && input_value_value !== (input_value_value = /*ci*/ ctx[13])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*questions*/ 1) {
    				input.checked = input.__value === /*question*/ ctx[10].currentAnswer;
    			}

    			if (dirty & /*questions*/ 1 && raw_value !== (raw_value = /*question*/ ctx[10].choices[/*ci*/ ctx[13]].text + "")) html_tag.p(raw_value);

    			if (dirty & /*questions*/ 1) {
    				toggle_class(label, "showing", "currentAnswer" in /*question*/ ctx[10]);
    			}

    			if (dirty & /*questions*/ 1) {
    				toggle_class(label, "correct", /*question*/ ctx[10].choices[/*ci*/ ctx[13]].is_correct);
    			}

    			if (dirty & /*questions*/ 1) {
    				toggle_class(label, "incorrect", !/*question*/ ctx[10].choices[/*ci*/ ctx[13]].is_correct);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[9][0][/*question_index*/ ctx[12]].splice(/*$$binding_groups*/ ctx[9][0][/*question_index*/ ctx[12]].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(28:12) {#each question.choicesOrder as ci}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#each questions as question}
    function create_each_block$1(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*question*/ ctx[10].session + "";
    	let t0;
    	let t1;
    	let t2_value = /*question*/ ctx[10].no + "";
    	let t2;
    	let t3;
    	let input;
    	let t4;
    	let button;
    	let t6;
    	let p1;
    	let t7_value = /*question*/ ctx[10].question + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[6].call(input, /*each_value*/ ctx[11], /*question_index*/ ctx[12]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*question*/ ctx[10], /*each_value*/ ctx[11], /*question_index*/ ctx[12]);
    	}

    	let if_block = /*question*/ ctx[10].img_link && create_if_block(ctx);
    	let each_value_1 = /*question*/ ctx[10].choicesOrder;
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
    			t3 = text("題 \n              ");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Clear answer";
    			t6 = space();
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block) if_block.c();
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			add_location(input, file$1, 18, 14, 616);
    			attr_dev(button, "class", "svelte-12qzhp3");
    			add_location(button, file$1, 19, 14, 670);
    			add_location(p0, file$1, 17, 12, 563);
    			add_location(p1, file$1, 22, 12, 810);
    			attr_dev(div, "class", "svelte-12qzhp3");
    			add_location(div, file$1, 16, 10, 545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, input);
    			set_input_value(input, /*question*/ ctx[10].tagString);
    			append_dev(p0, t4);
    			append_dev(p0, button);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(div, t8);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(button, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*questions*/ 1 && t0_value !== (t0_value = /*question*/ ctx[10].session + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*questions*/ 1 && t2_value !== (t2_value = /*question*/ ctx[10].no + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*questions*/ 1 && input.value !== /*question*/ ctx[10].tagString) {
    				set_input_value(input, /*question*/ ctx[10].tagString);
    			}

    			if (dirty & /*questions*/ 1 && t7_value !== (t7_value = /*question*/ ctx[10].question + "")) set_data_dev(t7, t7_value);

    			if (/*question*/ ctx[10].img_link) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t9);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*questions*/ 1) {
    				each_value_1 = /*question*/ ctx[10].choicesOrder;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t10);
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
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(16:8) {#each questions as question}",
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
    			t5 = text(/*correctlyAnswered*/ ctx[2]);
    			t6 = text(" (");
    			t7 = text(/*correct_percent*/ ctx[3]);
    			t8 = text("%)");
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$1, 13, 8, 410);
    			add_location(form, file$1, 12, 4, 370);
    			add_location(main, file$1, 11, 0, 359);
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
    				dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[5]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questions*/ 1 && t1_value !== (t1_value = /*questions*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*answered*/ 2) set_data_dev(t3, /*answered*/ ctx[1]);
    			if (dirty & /*correctlyAnswered*/ 4) set_data_dev(t5, /*correctlyAnswered*/ ctx[2]);
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
    	let questionsAnswered;
    	let answered;
    	let correctlyAnswered;
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

    	function input_input_handler(each_value, question_index) {
    		each_value[question_index].tagString = this.value;
    		$$invalidate(0, questions);
    	}

    	const click_handler = (question, each_value, question_index) => {
    		delete question.currentAnswer;
    		$$invalidate(0, each_value[question_index] = question, questions);
    	};

    	function input_change_handler(each_value, question_index) {
    		each_value[question_index].currentAnswer = this.__value;
    		$$invalidate(0, questions);
    	}

    	$$self.$$set = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    	};

    	$$self.$capture_state = () => ({
    		questions,
    		questionsAnswered,
    		answered,
    		correctlyAnswered,
    		correct_percent
    	});

    	$$self.$inject_state = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    		if ("questionsAnswered" in $$props) $$invalidate(4, questionsAnswered = $$props.questionsAnswered);
    		if ("answered" in $$props) $$invalidate(1, answered = $$props.answered);
    		if ("correctlyAnswered" in $$props) $$invalidate(2, correctlyAnswered = $$props.correctlyAnswered);
    		if ("correct_percent" in $$props) $$invalidate(3, correct_percent = $$props.correct_percent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*questions*/ 1) {
    			$$invalidate(4, questionsAnswered = questions.filter(e => "currentAnswer" in e));
    		}

    		if ($$self.$$.dirty & /*questionsAnswered*/ 16) {
    			$$invalidate(1, answered = questionsAnswered.length);
    		}

    		if ($$self.$$.dirty & /*questionsAnswered*/ 16) {
    			$$invalidate(2, correctlyAnswered = questionsAnswered.filter(e => e.choices[e.currentAnswer].is_correct).length);
    		}

    		if ($$self.$$.dirty & /*answered, correctlyAnswered*/ 6) {
    			$$invalidate(3, correct_percent = answered == 0
    			? 0
    			: Math.round(correctlyAnswered * 100 / answered));
    		}
    	};

    	return [
    		questions,
    		answered,
    		correctlyAnswered,
    		correct_percent,
    		questionsAnswered,
    		submit_handler,
    		input_input_handler,
    		click_handler,
    		input_change_handler,
    		$$binding_groups
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

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (123:6) {#each tags as tag}
    function create_each_block_1(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*tag*/ ctx[24] + "";
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
    			input.__value = input_value_value = /*tag*/ ctx[24];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[15][1].push(input);
    			add_location(input, file, 124, 10, 3212);
    			attr_dev(label, "class", "svelte-1320eoh");
    			add_location(label, file, 123, 6, 3194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*tagsSelected*/ ctx[2].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tags*/ 1 && input_value_value !== (input_value_value = /*tag*/ ctx[24])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*tagsSelected*/ 4) {
    				input.checked = ~/*tagsSelected*/ ctx[2].indexOf(input.__value);
    			}

    			if (dirty & /*tags*/ 1 && t1_value !== (t1_value = /*tag*/ ctx[24] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[15][1].splice(/*$$binding_groups*/ ctx[15][1].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(123:6) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (132:6) {#each sessions as session}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*session*/ ctx[21] + "";
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
    			input.__value = input_value_value = /*session*/ ctx[21];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input);
    			add_location(input, file, 133, 10, 3418);
    			add_location(label, file, 132, 6, 3400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*sessionsSelected*/ ctx[3].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler_1*/ ctx[16]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sessions*/ 2 && input_value_value !== (input_value_value = /*session*/ ctx[21])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*sessionsSelected*/ 8) {
    				input.checked = ~/*sessionsSelected*/ ctx[3].indexOf(input.__value);
    			}

    			if (dirty & /*sessions*/ 2 && t1_value !== (t1_value = /*session*/ ctx[21] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(132:6) {#each sessions as session}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let button0;
    	let t5;
    	let label0;
    	let input0;
    	let t6;
    	let t7;
    	let label1;
    	let input1;
    	let t8;
    	let t9;
    	let button1;
    	let t11;
    	let button2;
    	let t13;
    	let details;
    	let summary;
    	let t15;
    	let button3;
    	let t17;
    	let div2;
    	let input2;
    	let t18;
    	let button4;
    	let t20;
    	let exam;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*tags*/ ctx[0];
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
    			props: { questions: /*questionsSelected*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "二階國考題庫";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Start";
    			t5 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t6 = text("\n      隨機排序題目");
    			t7 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t8 = text("\n      隨機排序答案");
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Clear All On Page Answer";
    			t11 = space();
    			button2 = element("button");
    			button2.textContent = "Clear All Answer";
    			t13 = space();
    			details = element("details");
    			summary = element("summary");
    			summary.textContent = "Append/Export JSON";
    			t15 = space();
    			button3 = element("button");
    			button3.textContent = "Download JSON";
    			t17 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t18 = space();
    			button4 = element("button");
    			button4.textContent = "Append JSON";
    			t20 = space();
    			create_component(exam.$$.fragment);
    			attr_dev(h1, "class", "svelte-1320eoh");
    			add_location(h1, file, 119, 1, 3043);
    			attr_dev(div0, "class", "tags-list svelte-1320eoh");
    			add_location(div0, file, 121, 4, 3138);
    			attr_dev(div1, "class", "session-list");
    			add_location(div1, file, 130, 4, 3333);
    			attr_dev(button0, "type", "submit");
    			attr_dev(button0, "class", "svelte-1320eoh");
    			add_location(button0, file, 139, 4, 3551);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 143, 6, 3616);
    			add_location(label0, file, 142, 4, 3602);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 147, 6, 3716);
    			add_location(label1, file, 146, 4, 3702);
    			attr_dev(button1, "class", "svelte-1320eoh");
    			add_location(button1, file, 150, 4, 3800);
    			attr_dev(button2, "class", "svelte-1320eoh");
    			add_location(button2, file, 153, 4, 3905);
    			add_location(summary, file, 158, 6, 4013);
    			attr_dev(button3, "class", "svelte-1320eoh");
    			add_location(button3, file, 159, 6, 4057);
    			attr_dev(input2, "type", "textarea");
    			add_location(input2, file, 163, 8, 4168);
    			attr_dev(button4, "class", "svelte-1320eoh");
    			add_location(button4, file, 164, 8, 4231);
    			add_location(div2, file, 162, 6, 4154);
    			attr_dev(details, "class", "svelte-1320eoh");
    			add_location(details, file, 157, 4, 3997);
    			attr_dev(form, "class", "question-selection svelte-1320eoh");
    			add_location(form, file, 120, 1, 3060);
    			attr_dev(main, "class", "svelte-1320eoh");
    			add_location(main, file, 118, 0, 3035);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, form);
    			append_dev(form, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(form, t2);
    			append_dev(form, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(form, t3);
    			append_dev(form, button0);
    			append_dev(form, t5);
    			append_dev(form, label0);
    			append_dev(label0, input0);
    			input0.checked = /*shuffleQuestions*/ ctx[5];
    			append_dev(label0, t6);
    			append_dev(form, t7);
    			append_dev(form, label1);
    			append_dev(label1, input1);
    			input1.checked = /*shuffleChoices*/ ctx[6];
    			append_dev(label1, t8);
    			append_dev(form, t9);
    			append_dev(form, button1);
    			append_dev(form, t11);
    			append_dev(form, button2);
    			append_dev(form, t13);
    			append_dev(form, details);
    			append_dev(details, summary);
    			append_dev(details, t15);
    			append_dev(details, button3);
    			append_dev(details, t17);
    			append_dev(details, div2);
    			append_dev(div2, input2);
    			set_input_value(input2, /*importJSONContent*/ ctx[7]);
    			append_dev(div2, t18);
    			append_dev(div2, button4);
    			append_dev(main, t20);
    			mount_component(exam, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[17]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[18]),
    					listen_dev(button1, "click", prevent_default(/*clearAllOnPageAnswer*/ ctx[11]), false, true, false),
    					listen_dev(button2, "click", prevent_default(/*clearAllAnswer*/ ctx[12]), false, true, false),
    					listen_dev(button3, "click", prevent_default(/*downloadQBankJSON*/ ctx[9]), false, true, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(button4, "click", prevent_default(/*importJSON*/ ctx[10]), false, true, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tags, tagsSelected*/ 5) {
    				each_value_1 = /*tags*/ ctx[0];
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

    			if (dirty & /*sessions, sessionsSelected*/ 10) {
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

    			if (dirty & /*shuffleQuestions*/ 32) {
    				input0.checked = /*shuffleQuestions*/ ctx[5];
    			}

    			if (dirty & /*shuffleChoices*/ 64) {
    				input1.checked = /*shuffleChoices*/ ctx[6];
    			}

    			if (dirty & /*importJSONContent*/ 128) {
    				set_input_value(input2, /*importJSONContent*/ ctx[7]);
    			}

    			const exam_changes = {};
    			if (dirty & /*questionsSelected*/ 16) exam_changes.questions = /*questionsSelected*/ ctx[4];
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
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(exam);
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

    function saveJSONAsFile(filename, jsonToWrite) {
    	const blob = new Blob([jsonToWrite], { type: "text/json" });
    	const link = document.createElement("a");
    	link.download = filename;
    	link.href = window.URL.createObjectURL(blob);
    	link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

    	const evt = new MouseEvent("click",
    	{
    			view: window,
    			bubbles: true,
    			cancelable: true
    		});

    	link.dispatchEvent(evt);
    	link.remove();
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let qbank = [];
    	let tags, sessions;
    	let tagsSelected = [], sessionsSelected = [];
    	let questionsSelected = [];
    	let shuffleQuestions = false, shuffleChoices = false;

    	fetch("./qbank.json").then(response => response.json()).then(function (json) {
    		$$invalidate(13, qbank = json);

    		qbank.map(function (q) {
    			q.tagString = q.subject;
    		});
    	});

    	function queryQbank(specs) {
    		const { tagsSelected, sessionsSelected } = specs;
    		console.log(`tags (${tagsSelected})`);
    		console.log(`sessions (${sessionsSelected})`);
    		const result = qbank.filter(q => tagsSelected.some(tag => q.tagString.includes(tag))).filter(q => sessionsSelected.includes(q.session)).sort((a, b) => parseInt(a.no) > parseInt(b.no));
    		return result;
    	}

    	function handleSubmit() {
    		$$invalidate(4, questionsSelected = queryQbank({ tagsSelected, sessionsSelected }));

    		if (shuffleQuestions) {
    			shuffle(questionsSelected);
    		}

    		$$invalidate(4, questionsSelected = questionsSelected.map(q => {
    			q.choicesOrder = [...Array(q.choices.length).keys()];

    			if (shuffleChoices) {
    				shuffle(q.choicesOrder);
    			}

    			return q;
    		}));
    	}

    	function downloadQBankJSON() {
    		let q = JSON.parse(JSON.stringify(qbank));

    		q = q.map(function (question) {
    			delete question.subject;
    			delete question.currentAnswer;
    			delete question.choicesOrder;
    			return question;
    		});

    		q = q.map(function (question) {
    			question.tagString = question.tagString.toLowerCase();
    			return question;
    		});

    		saveJSONAsFile("qbank.json", JSON.stringify(q));
    	}

    	
    	let importJSONContent = "";

    	function importJSON() {
    		let importedQbank = JSON.parse(importJSONContent);

    		importedQbank.map(function (q) {
    			q.tagString = q.subject;
    		});

    		$$invalidate(13, qbank = qbank.concat(importedQbank));
    	}

    	function clearAllOnPageAnswer() {
    		questionsSelected.map(function (question) {
    			if ("currentAnswer" in question) {
    				delete question.currentAnswer;
    			}
    		});

    		$$invalidate(4, questionsSelected);
    	}

    	function clearAllAnswer() {
    		qbank.map(function (question) {
    			if ("currentAnswer" in question) {
    				delete question.currentAnswer;
    			}
    		});

    		$$invalidate(13, qbank);
    		$$invalidate(4, questionsSelected);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], []];

    	function input_change_handler() {
    		tagsSelected = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(2, tagsSelected);
    	}

    	function input_change_handler_1() {
    		sessionsSelected = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(3, sessionsSelected);
    	}

    	function input0_change_handler() {
    		shuffleQuestions = this.checked;
    		$$invalidate(5, shuffleQuestions);
    	}

    	function input1_change_handler() {
    		shuffleChoices = this.checked;
    		$$invalidate(6, shuffleChoices);
    	}

    	function input2_input_handler() {
    		importJSONContent = this.value;
    		$$invalidate(7, importJSONContent);
    	}

    	$$self.$capture_state = () => ({
    		Exam,
    		shuffle,
    		qbank,
    		tags,
    		sessions,
    		tagsSelected,
    		sessionsSelected,
    		questionsSelected,
    		shuffleQuestions,
    		shuffleChoices,
    		queryQbank,
    		handleSubmit,
    		downloadQBankJSON,
    		saveJSONAsFile,
    		importJSONContent,
    		importJSON,
    		clearAllOnPageAnswer,
    		clearAllAnswer
    	});

    	$$self.$inject_state = $$props => {
    		if ("qbank" in $$props) $$invalidate(13, qbank = $$props.qbank);
    		if ("tags" in $$props) $$invalidate(0, tags = $$props.tags);
    		if ("sessions" in $$props) $$invalidate(1, sessions = $$props.sessions);
    		if ("tagsSelected" in $$props) $$invalidate(2, tagsSelected = $$props.tagsSelected);
    		if ("sessionsSelected" in $$props) $$invalidate(3, sessionsSelected = $$props.sessionsSelected);
    		if ("questionsSelected" in $$props) $$invalidate(4, questionsSelected = $$props.questionsSelected);
    		if ("shuffleQuestions" in $$props) $$invalidate(5, shuffleQuestions = $$props.shuffleQuestions);
    		if ("shuffleChoices" in $$props) $$invalidate(6, shuffleChoices = $$props.shuffleChoices);
    		if ("importJSONContent" in $$props) $$invalidate(7, importJSONContent = $$props.importJSONContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*qbank*/ 8192) {
    			$$invalidate(0, tags = [...new Set(qbank.map(e => e.tagString.split(" ")).flat())]); // unique tags
    		}

    		if ($$self.$$.dirty & /*qbank*/ 8192) {
    			$$invalidate(1, sessions = [...new Set(qbank.map(e => e.session))]); // unique sessions
    		}
    	};

    	return [
    		tags,
    		sessions,
    		tagsSelected,
    		sessionsSelected,
    		questionsSelected,
    		shuffleQuestions,
    		shuffleChoices,
    		importJSONContent,
    		handleSubmit,
    		downloadQBankJSON,
    		importJSON,
    		clearAllOnPageAnswer,
    		clearAllAnswer,
    		qbank,
    		input_change_handler,
    		$$binding_groups,
    		input_change_handler_1,
    		input0_change_handler,
    		input1_change_handler,
    		input2_input_handler
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
