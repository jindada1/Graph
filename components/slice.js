/**
 * 实验场景：二元函数切片
 */
Vue.component('gh-slice', {
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
                    <el-divider content-position="center">切片</el-divider>
                    <kris-tag-group v-model="slices.x" title="X 取值"></kris-tag-group>
                    <kris-tag-group v-model="slices.y" title="Y 取值"></kris-tag-group>
                    <el-divider content-position="center">图像属性</el-divider>
                    <kris-slider v-model="plotConfig.precise" title="绘图误差" :min="0.1" :max="1" :step="0.1">
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
            componentName: "gh-slice",
            inited: false,
            windowHeight: window.innerHeight,
            graphs:[],
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
                precise: 0.2,
                minColor: "#D9ECFF",
                maxColor: "#409EFF",
            },
            slices: {
                x: [-2, -1, 0, 1, 2],
                y: [1, 2],
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
        slices: {
            handler: function () {
                this.display();
            },
            deep: true
        }
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
            Plotly.newPlot(this.plotId(), this.graphs);
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
        plotlyDatas(){
            return {
                x: [],
                y: [],
                z: [],
                type: 'surface',
                colorscale: [[0, this.plotConfig.minColor], [1, this.plotConfig.maxColor]],
                colorbar: {
                    ticklabelposition: "inside"
                }
            }
        },
        sliceX(x) {
            let datas = this.plotlyDatas();
            datas.x = [x, x];
            for (let y = this.range.y[0]; y < this.range.y[1]; y += this.plotConfig.precise) {
                datas.y.push(y);
                datas.z.push([this.jointGaussian(x, y), 0])
            }
            this.graphs.push(datas);
        },
        sliceY(y) {
            let datas = this.plotlyDatas();
            datas.y = [y, y];
            datas.z = [[], []];
            for (let x = this.range.x[0]; x < this.range.x[1]; x += this.plotConfig.precise) {
                datas.x.push(x);
                datas.z[0].push(this.jointGaussian(x, y));
                datas.z[1].push(0);
            }
            this.graphs.push(datas);
        },
        calcMainGraph() {
            let datas = this.plotlyDatas();
            datas.x = this.rangeToArray(this.range.x, this.plotConfig.precise)
            datas.y = this.rangeToArray(this.range.y, this.plotConfig.precise)
            datas.z = [];
            for (let y of datas.y) {
                let rowx = []
                for (let x of datas.x) {
                    rowx.push(this.jointGaussian(x, y));
                }
                datas.z.push(rowx);
            }
            this.graphs.push(datas)
        },
        calculateData() {
            this.graphs.length = 0;
            this.slices.x.map(x => this.sliceX(x));
            this.slices.y.map(y => this.sliceY(y));
            // this.calcMainGraph();
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