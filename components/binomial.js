/**
 * 实验场景：二项分布基础概念
 */
Vue.component('gh-binomial', {
    template: '\
        <div :style="{height: containerHeight}">\
            <div class="container-left">\
                <div></div>\
            </div>\
            <div class="container-right">\
                <div id="binomial-graphs"></div>\
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