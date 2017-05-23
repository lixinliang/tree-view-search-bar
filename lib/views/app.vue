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
        // Bind
        this.$on('focus', () => {
            console.log('focus');
        });
        this.$on('show', async ( resolve = () => {} ) => {
            this.updateView();
            await this.transitionend();
            this.active = true;
            resolve();
        });
        this.$on('hide', async ( resolve = () => {} ) => {
            this.active = false;
            await nextTick();
            this.height = 0;
            await this.transitionend();
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
            console.log(this.tags);
        },
        updateView () {
            this.height = this.$el.offsetHeight;
        },
        transitionend () {
            return new Promise(( resolve ) => {
                let handler = () => {
                    this.$treeView.element.removeEventListener('transitionend', handler, false);
                    resolve();
                };
                this.$treeView.element.addEventListener('transitionend', handler, false);
            });
        },
    },
}
</script>

<template>
    <div class="app" :name="NAME.kebab" :style="style">
        <input-tag
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
        width: 100%;
        padding: 0 .4em;
        box-sizing: border-box;
        & + .tree-view-resizer {
            transition: padding .4s;
        }
    }
    .tags {
        border: none;
        background-color: transparent;
    }
</style>
