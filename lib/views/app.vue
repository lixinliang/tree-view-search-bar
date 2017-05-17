<script>
import path from 'path';
import mousetrap from 'mousetrap';
import inputTag from 'vue-input-tag';
import { requirePackages } from 'atom-utils';
import {
    DEV,
    NAME,
} from '../module/constant';

let slice = ( elements ) => [].slice.call(elements);

export default {
    components : {
        inputTag,
    },
    computed : {
        height : {
            get () {},
            async set ( value ) {
                let [{ treeView }] = await requirePackages('tree-view');
                treeView.element.style['padding-top'] = this.$refs.app.style['height'] = `${ value }px`;
            },
        },
    },
    data () {
        return {
            NAME,
            tags : [],
            placeholder : 'type sth',
            transitionend : () => {},
        };
    },
    created () {
        this.$on('focus', () => {
            console.log('focus');
        });
        this.$on('show', () => {
            this.transitionend = () => {};
            this.height = parseInt(getComputedStyle(this.$refs.tags.$el)['height']);
        });
        this.$on('hide', ( resolve ) => {
            this.transitionend = () => {
                this.$destroy();
                resolve();
            };
            this.height = 0;
        });
    },
    mounted () {
        process.nextTick(() => {
            this.$emit('show');
        });
    },
    methods : {
        onChange () {
            console.log('onChange');
        },
    },
    destroyed () {
        if (DEV) {
            let styles = slice(document.querySelectorAll(`atom-styles style[source-path="${ __filename }"]`));
            for (let style of styles) {
                style.remove();
            }
        }
        this.$el.remove();
    },
}
</script>

<template>
    <div class="app" :name="NAME.kebab" ref="app">
        <input-tag
            ref="tags"
            :tags="tags"
            class="tags"
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
        height: 0;
        width: 100%;
        padding: 0 .4em;
        overflow: hidden;
        box-sizing: border-box;
    }
    .tags {
        border: none;
        background-color: transparent;
    }
</style>

<style lang="less">
    .app + .tree-view-resizer {
        transition: padding .4s;
    }
</style>
