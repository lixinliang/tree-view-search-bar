<script>
import mousetrap from 'mousetrap';
import inputTag from 'vue-input-tag';

// console.log(mousetrap);

export default {
    components : {
        inputTag,
    },
    data () {
        return {
            title : 'app',
            tags : [],
            placeholder : 'type something',
        };
    },
    created () {
        console.log('created');
        this.$on('focus', () => {
            console.log('focus');
        });
    },
    destroyed () {
        console.log('destroyed');
    },
    methods : {
        onChange () {
            console.log('onChange');
        },
    },
}
</script>

<template>
    <div class="app">
        <input-tag
            class="tags"
            :tags="tags"
            :on-change="onChange"
            :placeholder="placeholder",
        ></input-tag>
    </div>
</template>

<style lang="scss" scoped>
    .app {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 36px;
        border-bottom: 1px solid #ccc;
        z-index: 9;
    }
    .tags {

    }
</style>
