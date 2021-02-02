/**
 * 实验场景：联合概率密度
 */
Vue.component('gh-jointdensity', {
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
        console.log('joint density mounted');
    }
})