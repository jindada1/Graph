/**
 * 实验场景：二项分布基础概念
 */
Vue.component('gh-binomial', {
    template: '\
        <canvas ref="board" :width="width" :height="height" style="background-color:gray">\
        </canvas>\
    ',
    data() {
        return {
            width: 300,
            height: 300
        }
    },
    computed: {
    },
    methods: {
    },
    mounted() {
        console.log('binomial mounted');
    }
})