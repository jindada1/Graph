/**
 * 实验场景：抛硬币正面朝上的概率
 */
Vue.component('gh-coins', {
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
        console.log('canvas mounted');
    }
})