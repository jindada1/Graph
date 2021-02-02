/**
 * 实验场景：100次实验，成功次数的概率分布
 */
Vue.component('gh-hundred', {
    template: '\
        <div :style="{height: containerHeight}">\
            <div class="container-left">\
                <div></div>\
            </div>\
            <div class="container-right">\
                <div id="hundred-graphs"></div>\
            </div>\
        </div>\
    ',
    data() {
        return {
            windowHeight: window.innerHeight
        }
    },
    computed: {
        containerHeight: function () {
            return (this.windowHeight - 70) + 'px';
        }
    },
    mounted() {
        window.addEventListener("resize", (event) => {
            this.windowHeight = window.innerHeight;
        }, false);
    }
})