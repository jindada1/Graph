/**
 * 实验场景：联合概率密度
 */
Vue.component('gh-jointdensity', {
    template: `
        <div :style="{height: containerHeight}">
            <div class="container-left kris-scroll">
                <div class="control-panel">
                    <el-divider content-position="center">取值范围</el-divider>
                    <kris-num-input-range v-model="range.x" title="X："></kris-num-input-range>
                    <kris-num-input-range v-model="range.y" title="Y："></kris-num-input-range>
                    <el-divider content-position="center">高斯分布</el-divider>
                    <kris-num-input-double v-model="gaussian.x" :names="gaussian.names" title="X：">
                    </kris-num-input-double>
                    <kris-num-input-double v-model="gaussian.y" :names="gaussian.names" title="Y：">
                    </kris-num-input-double>
                    <el-divider content-position="center">图像属性</el-divider>
                    <kris-slider v-model="plotConfig.precise" title="绘图精度" :min="0.1" :max="1" :step="0.1">
                    </kris-slider>
                    <kris-color-picker v-model="plotConfig.maxColor" title="最大值颜色">
                    </kris-color-picker>
                    <kris-color-picker v-model="plotConfig.minColor" title="最小值颜色">
                    </kris-color-picker>
                </div>
            </div>
            <div class="container-right kris-scroll">
                <div style="height: 100%;">
                    <div :id="plotId()" style="height: 100%;"></div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            componentName: "gh-jointdensity",
            inited: false,
            windowHeight: window.innerHeight,
            plotlyDatas: {
                x: [],
                y: [],
                z: []
            },
            range: {
                x: [-4, 4],
                y: [-4, 4]
            },
            gaussian: {
                names: ["均值", "标准差"],
                x: [0, 1],
                y: [0, 1]
            },
            plotConfig: {
                precise: 0.1,
                minColor: "#D9ECFF",
                maxColor: "#409EFF",
            }
        }
    },
    watch: {
        plotConfig: {
            handler: function () {
                this.display();
            },
            deep: true
        },
        range: {
            handler: function () {
                this.display();
            },
            deep: true
        },
        gaussian: {
            handler: function () {
                this.display();
            },
            deep: true
        },
    },
    computed: {
        containerHeight: function () {
            return (this.windowHeight - 70) + "px";
        }
    },
    methods: {
        plotId() {
            return this.componentName + "-plot";
        },
        render() {
            Plotly.newPlot(this.plotId(), [{
                x: this.plotlyDatas.x,
                y: this.plotlyDatas.y,
                z: this.plotlyDatas.z,
                type: 'surface',
                colorscale: [[0, this.plotConfig.minColor], [1, this.plotConfig.maxColor]],
                colorbar: {
                    ticklabelposition: "inside"
                }
            }]);
            this.storeSettings()
        },
        rangeToArray(range, step = 1) {
            var arr = [];
            for (let num = range[0]; num < range[1]; num += step) {
                arr.push(num);
            }
            return arr;
        },
        jointGaussian(x, y) {
            return Gaussian(this.gaussian.x[0], this.gaussian.x[1]).get(x) * Gaussian(this.gaussian.y[0], this.gaussian.y[1]).get(y);
        },
        calculateData() {
            this.plotlyDatas.x = this.rangeToArray(this.range.x, this.plotConfig.precise)
            this.plotlyDatas.y = this.rangeToArray(this.range.y, this.plotConfig.precise)
            this.plotlyDatas.z = [];
            for (let y of this.plotlyDatas.y) {
                let rowx = []
                for (let x of this.plotlyDatas.x) {
                    rowx.push(this.jointGaussian(x, y));
                }
                this.plotlyDatas.z.push(rowx);
            }
        },
        display() {
            this.calculateData();
            Vue.nextTick(() => {
                this.render();
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
    }
})