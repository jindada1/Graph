/**
 * 实验场景：二项分布基础概念
 */
Vue.component('gh-binomial', {
    template: `
        <div :style="{height: containerHeight}">
            <div class="container-left kris-scroll">
                <div class="control-panel">
                    <el-divider content-position="center">实验设置</el-divider>
                    <kris-tag-group v-model="experiment.probabilities" title="成功率数组"></kris-tag-group>
                    <kris-num-input-range v-model="experiment.trialsRange" title="实验数范围"></kris-num-input-range>
                    <el-divider content-position="center">柱状图属性</el-divider>
                    <kris-color-picker v-model="histogramConfig.barColor" title="填充颜色"></kris-color-picker>
                    <kris-color-picker v-model="histogramConfig.barStrokeColor" title="边缘颜色"></kris-color-picker>
                    <kris-num-input v-model="histogramConfig.height" title="图高度" :step="10"></kris-num-input>
                    <kris-num-input v-model="histogramConfig.maxWidth" title="图最大宽度" :step="5"></kris-num-input>
                    <kris-num-input v-model="histogramConfig.maxBarWidth" title="柱最大宽度" :step="2"></kris-num-input>
                    <el-divider content-position="center">布局</el-divider>
                    <kris-slider v-model="layout.rowDistance" :title="'行间距'"></kris-slider>
                    <kris-slider v-model="layout.marginX" :title="'列间距'"></kris-slider>
                </div>
            </div>
            <div class="container-right kris-scroll">
                <div class="graph-maze">
                    <div class="graph-maze-row graph-maze-sticky-head-top">
                        <div class="graph-maze-head sticky-left"></div>
                        <div v-for="(p, c) in experiment.probabilities" class="graph-maze-element-container" v-bind:style="elementStyle">
                            <div v-bind:style="'text-align: ' + getAlign(c, experiment.probabilities)">
                                {{p}}
                            </div>
                        </div>
                    </div>
                    <div v-for="(row, r) in dataMaze" :key="r" class="graph-maze-row">
                        <div class="graph-maze-head sticky-left">{{r + experiment.trialsRange[0]}}</div>
                        <div v-for="(graph, c) in row" :key="coordinateKey(r, c)"
                            class="graph-maze-element-container" v-bind:style="elementStyle">
                            <canvas v-bind:class="'graph-maze-element-' + getAlign(c, row)" :id="coordinateKey(r, c)"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            componentName: "gh-binomial",
            windowHeight: window.innerHeight,
            dataMaze: [],
            experiment: {
                probabilities: [0.125, 0.25, 0.5, 0.75, 0.875],
                trialsRange: [1, 8]
            },
            histogramConfig: {
                barColor: "#409EFF",
                barStrokeColor: "#000000",
                height: 180,
                maxWidth: 200,
                maxBarWidth: 30,
                axisY: false,
            },
            layout: {
                marginX: 10,
                rowDistance: 10,
            }
        }
    },
    watch: {
        histogramConfig: {
            handler: function () {
                this.render(this.histogramConfig);
            },
            deep: true
        },
        experiment: {
            handler: function () {
                this.display();
            },
            deep: true
        },
    },
    computed: {
        containerHeight: function () {
            return (this.windowHeight - 70) + "px";
        },
        elementStyle: function () {
            return {
                margin: this.layout.rowDistance + "px " + this.layout.marginX + "px"
            }
        },
    },
    methods: {
        coordinateKey(r, c) {
            return this.componentName + r.toString() + "," + c.toString();
        },
        getAlign(c, row) {
            if (c < (row.length - 1) / 2)
                return "left";
            else if (c === (row.length - 1) / 2)
                return "center";
            else
                return "right";
        },
        render(config = {}) {
            for (let [r, row] of this.dataMaze.entries()) {
                for (let [c, data] of row.entries()) {
                    histogram(document.getElementById(this.coordinateKey(r, c)), config).draw(data);
                }
            }
            this.storeSettings()
        },
        calculateData() {
            var data = [];
            for (let trial = this.experiment.trialsRange[0]; trial <= this.experiment.trialsRange[1]; trial++) {
                let row = []
                for (let p of this.experiment.probabilities) {
                    row.push({
                        datas: binominalExperience(trial, p)
                    })
                }
                data.push(row);
            }
            return data;
        },
        display() {
            this.dataMaze = this.calculateData();
            Vue.nextTick(() => {
                this.render(this.histogramConfig);
            })
        },
        storeSettings() {
            /** Cookie */
        }
    },
    mounted() {
        window.addEventListener("resize", (event) => {
            this.windowHeight = window.innerHeight;
        }, false);

        this.display();
    }
})