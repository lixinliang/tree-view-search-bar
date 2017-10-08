<script>
import path from 'path';
import mousetrap from 'mousetrap';
import inputTag from 'vue-input-tag';
import { requirePackages } from 'atom-utils';
import {
    DEV,
    NAME,
} from '../module/constant';

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
        // Show
        await nextTick();
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
        // Destroy
        this.$el.remove();
        if (DEV) {
            let styles = Array.from(document.querySelectorAll(`atom-styles style[source-path="${ __filename }"]`));
            for (let style of styles) {
                style.remove();
            }
        }
    },
    methods : {
        onChange () {
            // TODO: filter feature
            console.log(this.tags);
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
            :on-change="onChange"
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
        & + .tree-view {
            transition: padding .4s;
        }
    }
    .tags {
        border: none;
        background-color: transparent;
    }
</style>
