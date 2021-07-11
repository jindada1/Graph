/**
 * 实验场景：联合概率密度
 */

Vue.component('gh-jointdensity', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">取值范围</el-divider>
                <kris-num-input-range v-model="range.x" title="X："></kris-num-input-range>
                <kris-num-input-range v-model="range.y" title="Y："></kris-num-input-range>
                <el-divider content-position="center">高斯分布</el-divider>
                <kris-num-input-double v-model="gaussian.x" :names="gaussian.names" title="X：">
                </kris-num-input-double>
                <kris-num-input-double v-model="gaussian.y" :names="gaussian.names" title="Y：">
                </kris-num-input-double>
                <el-divider content-position="center">图像属性</el-divider>
                <kris-slider v-model="plotConfig.precise" title="绘图误差" :min="0.05" :max="0.3" :step="0.01">
                </kris-slider>
                <kris-color-picker v-model="plotConfig.maxColor" title="最大值颜色"></kris-color-picker>
                <kris-color-picker v-model="plotConfig.minColor" title="最小值颜色"></kris-color-picker>
                <kris-switch title="透视视角" v-model="isPerspective"></kris-switch>
                <el-divider content-position="center">初始视角</el-divider>
                <kris-slider v-model="eye.x" title="X" :min="-2" :max="2" :step="0.1"></kris-slider>
                <kris-slider v-model="eye.y" title="Y" :min="-2" :max="2" :step="0.1"></kris-slider>
                <kris-slider v-model="eye.z" title="Z" :min="-2" :max="2" :step="0.1"></kris-slider>
                <el-divider content-position="center">函数切片</el-divider>
                <kris-tag-group v-model="slices.x" title="X 取值"></kris-tag-group>
                <kris-tag-group v-model="slices.y" title="Y 取值"></kris-tag-group>
            </template>
            <template v-slot:right>
                <div style="height: 100%;">
                    <div :id="plotId()" style="height: 100%;"></div>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-jointdensity",
            updateLock: false,
            inited: false,
            graphs: [],
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
            },
            slices: {
                x: [],
                y: [],
            },
            layout: {
                scene: {
                    camera: {
                        eye: this.eye,
                        projection: {
                            type: this.isPerspective
                        }
                    }
                }
            },
            eye: {
                x: 1.87,
                y: 0.88,
                z: 0.64
            },
            isPerspective: false,
            storageList: [
                "plotConfig",
                "range",
                "gaussian",
                "slices",
                "eye",
                "isPerspective"
            ]
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
        },
        eye: {
            handler: function () {
                this.layout.scene.camera.eye = this.eye
                this.display();
            },
            deep: true
        },
        isPerspective(val) {
            this.layout.scene.camera.projection.type = val ? "perspective" : "orthographic"
            this.display();
        }
    },
    methods: {
        plotId() {
            return this.componentName + "-plot";
        },
        render() {
            Plotly.newPlot(this.plotId(), this.graphs, this.layout);
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
        plotlyDatas() {
            return {
                x: [],
                y: [],
                z: [],
                type: 'surface',
                colorscale: [[0, this.plotConfig.minColor], [1, this.plotConfig.maxColor]],
                colorbar: {
                    ticklabelposition: "inside"
                },
                showscale: false // whether or not a colorbar is displayed for this trace.
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
        shadowSliceX(x) {
            // 切片的时候限制 x 和 y 的取值，取值必须大于平均值
            if (x < this.gaussian.x[0]) {
                return;
            }
            let datas = this.plotlyDatas();
            datas.type = "scatter3d";
            datas.mode = "lines";
            datas.name = `x = ${x}`;
            // let px = x > 0 ? this.range.x[1] : this.range.x[0];
            let px = this.range.x[0];
            for (let y = this.range.y[0]; y < this.range.y[1]; y += this.plotConfig.precise) {
                datas.x.push(px)
                datas.y.push(y);
                datas.z.push(this.jointGaussian(x, y))
            }
            this.graphs.push(datas);
        },
        shadowSliceY(y) {
            // 切片的时候限制 x 和 y 的取值，取值必须大于平均值
            if (y < this.gaussian.y[0]) {
                return;
            }
            let datas = this.plotlyDatas();
            datas.type = "scatter3d";
            datas.mode = "lines";
            datas.name = `y = ${y}`;
            // let py = y > 0 ? this.range.y[1] : this.range.y[0];
            let py = this.range.y[0];
            for (let x = this.range.x[0]; x < this.range.x[1]; x += this.plotConfig.precise) {
                datas.x.push(x);
                datas.y.push(py);
                datas.z.push(this.jointGaussian(x, y));
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
            // this.slices.x.map(x => this.sliceX(x));
            // this.slices.y.map(y => this.sliceY(y));
            this.slices.x.map(x => this.shadowSliceX(x));
            this.slices.y.map(y => this.shadowSliceY(y));
            this.calcMainGraph();
        },
        display() {
            if (this.updateLock) return;
            this.calculateData();
            Vue.nextTick(() => {
                this.render();
            })
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