/**
 * 实验场景：联合概率密度
 */
Vue.component('gh-jointdensity', {
    template: '\
        <div :style="{height: containerHeight}">\
            <div class="container-left">\
                <div></div>\
            </div>\
            <div class="container-right">\
                <div id="jointdensity-graphs"></div>\
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