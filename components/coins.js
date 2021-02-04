/**
 * 实验场景：抛硬币正面朝上的概率
 */
Vue.component('gh-coins', {
    template: `
        <div :style="{height: containerHeight}">
            <div class="container-left kris-scroll">
                <div class="control-panel">
                    <el-divider content-position="center">实验设置</el-divider>
                    <kris-tag-group v-model="experiment.trials" title="实验次数"></kris-tag-group>
                    <kris-num-input v-model="experiment.maxX" title="横坐标最大值" :step="10"></kris-num-input>
                    <el-divider content-position="center">柱状图属性</el-divider>
                    <kris-color-picker v-model="histogramConfig.barColor" title="填充颜色">
                    </kris-color-picker>
                    <kris-color-picker v-model="histogramConfig.barStrokeColor" title="边缘颜色">
                    </kris-color-picker>
                    <kris-num-input v-model="histogramConfig.height" title="图高度" :step="10"></kris-num-input>
                    <kris-num-input v-model="histogramConfig.maxWidth" title="图最大宽度" :step="5"></kris-num-input>
                    <kris-num-input v-model="histogramConfig.maxBarWidth" title="柱最大宽度" :step="2">
                    </kris-num-input>
                    <el-divider content-position="center">布局</el-divider>
                    <kris-slider v-model="layout.rowDistance" :title="'行间距'"></kris-slider>
                </div>
            </div>
            <div class="container-right kris-scroll">
                <div class="graph-maze">
                    <div v-for="(row, r) in dataMaze" :key="r" class="graph-maze-row">
                        <div class="graph-maze-head"></div>
                        <div v-for="(graph, c) in row" :key="coordinateKey(r, c)"
                            class="graph-maze-element-container" v-bind:style="elementStyle">
                            <canvas v-bind:class="'graph-maze-element-' + getAlign(c, row)"
                                :id="coordinateKey(r, c)"></canvas>
                        </div>
                        <div class="graph-maze-head sticky-right" style="width: 70px;">
                            {{percentageFmt(experiment.trials[r])}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            componentName: "gh-coins",
            inited: false,
            windowHeight: window.innerHeight,
            dataMaze: [],
            experiment: {
                trials: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                maxX: 70,
                probability: 0.5
            },
            histogramConfig: {
                barColor: "#409EFF",
                barStrokeColor: "#000000",
                height: 100,
                maxWidth: 1000,
                maxBarWidth: 10,
                axisXStep: 10,
                axisYStepNum: 0.05, // TODO:自适应高度
                padx: 50,
                pady: 16,
                axisXNum: true,
            },
            layout: {
                rowDistance: 10,
                marginX: 0,
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
            return r.toString() + "," + c.toString();
        },
        getAlign(c, row) {
            if (c < (row.length - 1) / 2)
                return "left";
            else if (c === (row.length - 1) / 2)
                return "center";
            else
                return "right";
        },
        percentageFmt(num) {
            return "n = " + num;
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
            for (let trial of this.experiment.trials) {
                let row = []
                let bio = binominalExperience(trial, this.experiment.probability);
                var arr = [];
                for (var n = 0; n < this.experiment.maxX; n++) {
                    arr[n] = n < bio.length ? bio[n] : 0;
                };
                row.push({
                    datas: arr
                })
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
        },
        init() {
            if (this.inited) return;
            this.display();
            this.inited = true;
        }
    },
    mounted() {
        window.addEventListener("resize", (event) => {
            this.windowHeight = window.innerHeight;
        }, false);

        this.display();
    }
})