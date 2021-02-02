/**
 * 实验场景：100次实验，成功次数的概率分布
 */
Vue.component('gh-hundred', {
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
        console.log('hundred mounted');
    }
})