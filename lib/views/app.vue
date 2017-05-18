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
let sleep = ( delay ) => new Promise(( resolve ) => setTimeout(resolve, delay));

export default {
    components : {
        inputTag,
    },
    computed : {
        height : {
            get () {},
            async set ( value ) {
                let [{ treeView }] = await requirePackages('tree-view');
                treeView.element.style['padding-top'] = `${ value }px`;
            },
        },
    },
    data () {
        return {
            NAME,
            tags : [],
            placeholder : 'type sth',
        };
    },
    created () {
        this.$on('focus', () => {
            console.log('focus');
        });
        this.$on('show', ( resolve ) => {
            this.height = parseInt(getComputedStyle(this.$refs.tags.$el)['height']);
            resolve();
        });
        this.$on('hide', async ( resolve ) => {
            this.height = 0;
            await sleep(600);
            this.$destroy();
            resolve();
        });
    },
    mounted () {
        process.nextTick(() => {
            this.$emit('show', () => {});
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
    <div class="app" :name="NAME.kebab">
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
        width: 100%;
        padding: 0 .4em;
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
