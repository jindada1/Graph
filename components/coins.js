/**
 * 实验场景：抛硬币正面朝上的概率
 */
Vue.component('gh-coins', {
    template: '\
        <div :style="{height: containerHeight}">\
            <div class="container-left">\
                <div></div>\
            </div>\
            <div class="container-right">\
                <div id="coins-graphs"></div>\
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