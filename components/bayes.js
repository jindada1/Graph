/**
 * 实验场景：贝叶斯
 */

Vue.component('gh-bayers', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>

            </template>
            <template v-slot:right>
                <div>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-bayers",
            updateLock: false,
            inited: false
        }
    },
    watch: {
        experiment: {
            handler: function () {
                this.display();
            },
            deep: true
        },
    },
    computed: {
    },
    methods: {
        display() {
            
        },
        storeSettings() {
            localStorage.setItem(this.componentName, JSON.stringify(this.$data))
        },
        init() {
            if (this.inited) return;
            this.display();
            this.inited = true;
        }
    },
    mounted() {
        this.$refs.frame.loadData(this);
    }
})