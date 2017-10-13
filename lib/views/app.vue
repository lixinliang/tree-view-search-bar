<script>
import path from 'path';
import mousetrap from 'mousetrap';
import inputTag from 'vue-input-tag';
import filter from '../module/filter';
import { requirePackages } from 'atom-utils';
import {
    DEV,
    NAME,
} from '../module/constant';

let observer = null;
let sleep = ( delay ) => new Promise(( resolve ) => setTimeout(resolve, delay));
let nextTick = () => new Promise(( resolve ) => process.nextTick(resolve));

export default {
    components : {
        inputTag,
    },
    computed : {
        height : {
            get () {},
            async set ( value ) {
                this.$treeView.element.style['padding-top'] = `${ value }px`;
            },
        },
        style () {
            return this.active ? {
                // HACK: just right large than the treeView panel
                'z-index' : 3,
            } : {};
        },
        moduleId () {
            if (this.$el) {
                for (let attribute of Object.keys(this.$el.dataset)) {
                    if (/^v-/.test(attribute)) {
                        return `data-${ attribute }`;
                    }
                }
            }
            return '';
        },
    },
    data () {
        return {
            NAME,
            tags : [],
            active : false,
            placeholder : 'Type...',
        };
    },
    async mounted () {
        // SetAttribute
        if (this.moduleId) {
            this.$treeView.element.setAttribute(this.moduleId, '');
        }
        let input = this.$refs.tags.$el.querySelector('input');
        // Bind
        this.$on('focus', () => {
            input.focus();
        });
        this.$on('show', async ( resolve = () => {} ) => {
            this.updateView();
            await sleep(400);
            this.active = true;
            resolve();
        });
        this.$on('hide', async ( resolve = () => {} ) => {
            this.active = false;
            await nextTick();
            this.height = 0;
            await sleep(400);
            this.$destroy();
            resolve();
        });
        // Use Mutation to Observer Dom update
        observer = new MutationObserver(( mutations ) => {
            this.filter();
        });
        observer.observe(this.$treeView.element, { childList : true, subtree : true });
        // Overwrite
        // TODO: rewrite scrollToEntry scrollToBottom etc. methods of treeView when searching sth.
        const { prototype } = this.$treeView.constructor;
        // Show
        await nextTick();
        this.filter();
        this.$emit('show');
    },
    updated () {
        this.updateView();
    },
    destroyed () {
        // RemoveAttribute
        if (this.moduleId) {
            this.$treeView.element.removeAttribute(this.moduleId);
        }
        // Unbind
        this.$off();
        observer.disconnect();
        observer = null;
        // Destroy
        this.$el.remove();
        // HACK: it seems can not be inject twice in atom 1.21 after remove
        // if (DEV) {
        //     let styles = Array.from(document.querySelectorAll(`atom-styles style[source-path="${ __filename }"]`));
        //     for (let style of styles) {
        //         style.remove();
        //     }
        // }
    },
    methods : {
        filter () {
            const attributeName = 'tree-view-search-bar-display';

            const {
                tags,
                $treeView,
            } = this;

            const {
                hidden,
                visible,
            } = filter({
                tags,
                $treeView,
            });

            for (let item of hidden) {
                let target;
                if (item.matches('.project-root > .list-tree .header')) {
                    target = item.parentElement;
                } else {
                    target = item;
                }
                target.setAttribute(this.moduleId, '');
                target.setAttribute(attributeName, 'none');
            }

            for (let item of visible) {
                let target;
                if (item.matches('.project-root > .list-tree .header')) {
                    target = item.parentElement;
                } else {
                    target = item;
                }
                target.setAttribute(this.moduleId, '');
                target.removeAttribute(attributeName);
            }

            if (hidden.length) {
                for (let item of visible.reverse()) {
                    let target;
                    if (item.matches('.project-root > .list-tree .header')) {
                        target = item.parentElement;
                    } else {
                        target = item;
                    }
                    try {
                        let current = target;
                        while (current) {
                            current = (() => {
                                let next = current.parentElement.parentElement;
                                if (next.matches('.project-root > .list-tree .entry') && next.hasAttribute(attributeName)) {
                                    next.removeAttribute(attributeName);
                                    return next;
                                }
                                return false;
                            })();
                        }
                    } catch (e) {

                    }
                }
            }
        },
        change () {
            this.filter();
        },
        updateView () {
            this.height = this.$el.offsetHeight;
        },
    },
}
</script>

<template>
    <div class="app" :name="NAME.kebab" :style="style">
        <input-tag
            ref="tags"
            class="tags"
            :tags="tags"
            :on-change="change"
            :placeholder="placeholder"
        ></input-tag>
    </div>
</template>

<style lang="less" scoped>
    .app {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: auto;
        width: 100%;
        padding: 0 .4em;
        box-sizing: border-box;
        backdrop-filter: blur(2px);
        background-color: rgba(255,255,255,.2);
        & + .tree-view {
            transition: padding .4s;
            .entry {
                transition: height .4s, margin .4s, padding .4s;
                &[tree-view-search-bar-display="none"] {
                    display: none;
                    // height: 0;
                    // padding-top: 0;
                    // padding-bottom: 0;
                    // margin-top: 0;
                    // margin-bottom: 0;
                    // overflow: hidden;
                }
            }
        }
    }
    .tags {
        border: none;
        background-color: transparent;
    }
</style>
