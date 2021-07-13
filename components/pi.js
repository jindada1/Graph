/**
 * 实验场景：圆周率 pi 的模拟
 */

Vue.component('gh-pi', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">实验设置</el-divider>
                <kris-num-input title="实验点数量" v-model="experiment.pointNum" :step="100" :min="100"></kris-num-input>
                <kris-num-input title="圆的半径（像素）" v-model="radius" :step="10" :min="50"></kris-num-input>
                <el-divider content-position="center">统计结果</el-divider>
                <kris-switch title="自动记录统计结果" v-model="storeResult"></kris-switch>
                <kris-progress title="圆内点占比" :total="result.totalNum" :value="result.insideNum"></kris-progress>
                <kris-form-item title="圆周率估算值" :value="result.pi"></kris-form-item>
                <el-divider content-position="center">实验结果记录</el-divider>
                <kris-table :tableData="historyResult" :height="300"></kris-table>
                <el-divider content-position="center">图像属性</el-divider>
                <kris-color-picker v-model="plotConfig.insideColor" title="圆内颜色"></kris-color-picker>
                <kris-color-picker v-model="plotConfig.outsideColor" title="圆外颜色"></kris-color-picker>
            </template>
            <template v-slot:right>
                <div class="graph-transparent-background graph-canvas-container">
                    <kris-canvas ref="playground" :width="radius * 2" :height="radius * 2"></kris-canvas>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-pi",
            updateLock: false,
            inited: false,
            experiment: {
                pointNum: 1000,
            },
            radius: 280,
            plotConfig: {
                insideColor: "#FF6D24",
                outsideColor: "#409EFF",
            },
            points: [],
            storageList: [
                "radius",
                "experiment",
                "plotConfig",
                "storeResult"
            ],
            result: {
                totalNum: 0,
                insideNum: 0,
                pi: "-"
            },
            precise: 8,
            storeResult: false,
            historyResult: []
        }
    },
    watch: {
        experiment: {
            handler: function () {
                this.generatePoints();
                this.display();
            },
            deep: true
        },
        plotConfig: {
            handler: function () {
                this.display();
            },
            deep: true
        },
        radius() {
            Vue.nextTick(() => {
                this.generatePoints();
                this.display();
            })
        }
    },
    computed: {
    },
    methods: {
        generatePoints() {
            let i = 0;
            this.points.length = 0;
            while (i < this.experiment.pointNum) {
                i++;
                let x = Math.random() * this.radius * 2;
                let y = Math.random() * this.radius * 2;
                this.points.push([parseInt(x), parseInt(y)]);
            }
            this.count()
        },
        count() {
            const insides = this.points.filter(point => this.inside(point[0], point[1]));
            let result = {
                totalNum: this.experiment.pointNum,
                insideNum: insides.length,
                pi: (4 * insides.length / this.experiment.pointNum).toFixed(this.precise).toString()
            }
            this.result = result;
            if (this.storeResult) {
                this.historyResult.push(result)
            }
        },
        display() {
            if (this.updateLock) return;
            this.$refs.playground.refresh();
            for (const point of this.points) {
                let color = this.inside(point[0], point[1]) ? this.plotConfig.insideColor : this.plotConfig.outsideColor;
                this.$refs.playground.point(point[0], point[1], 3, color);
            }
            this.storeSettings();
        },
        inside(x, y) {
            let r = this.radius;
            let disq = Math.pow(x - r, 2) + Math.pow(y - r, 2);
            return disq < Math.pow(this.radius, 2)
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