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
                
                <el-divider content-position="center">切面</el-divider>
                <kris-num-input title="X" v-model="slices.x" :step="0.01" :min="range.x[0]" :max="range.x[1]"></kris-num-input>
                <kris-num-input title="Y" v-model="slices.y" :step="0.01" :min="range.y[0]" :max="range.y[1]"></kris-num-input>
                <kris-switch title="显示切面" v-model="showSlice"></kris-switch>

                <el-divider content-position="center">图像属性</el-divider>
                <kris-slider v-model="plotConfig.precise" title="绘图误差" :min="0.01" :max="0.2" :step="0.01">
                </kris-slider>
                <kris-color-picker v-model="plotConfig.maxColor" title="最大值颜色"></kris-color-picker>
                <kris-color-picker v-model="plotConfig.minColor" title="最小值颜色"></kris-color-picker>
                <kris-switch title="透视视角" v-model="isPerspective"></kris-switch>
                
                <el-divider content-position="center">初始视角</el-divider>
                <kris-slider v-model="eye.x" title="X" :min="-2" :max="2" :step="0.1"></kris-slider>
                <kris-slider v-model="eye.y" title="Y" :min="-2" :max="2" :step="0.1"></kris-slider>
                <kris-slider v-model="eye.z" title="Z" :min="-2" :max="2" :step="0.1"></kris-slider>
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
                x: 0,
                y: 0,
            },
            layout: {
                scene: {
                    camera: {
                        eye: this.eye,
                        projection: {
                            type: this.isPerspective
                        }
                    },
                    xaxis: {
                        showspikes: false,
                        spikesides: false
                    },
                    yaxis: {
                        showspikes: false,
                        spikesides: false
                    },
                    zaxis: {
                        showspikes: false,
                        spikesides: false
                    },
                    annotations: []
                },
                hoverinfo: 'skip',
                hovermode: false,
            },
            eye: {
                x: 1.87,
                y: 0.88,
                z: 0.64
            },
            isPerspective: true,
            showSlice: true,
            annotation: {
                textangle: 0,
                ax: 0,
                ay: -75,
                font: {
                    color: "black",
                    size: 12
                },
                arrowcolor: "black",
                arrowsize: 3,
                arrowwidth: 1,
                arrowhead: 1
            },
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
        },
        showSlice() {
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
        shadowLine(lName) {
            return {
                x: [],
                y: [],
                z: [],
                type: "scatter3d",
                mode: "lines",
                name: lName,
            }
        },
        sliceData() {
            return {
                x: [],
                y: [],
                z: [],
                type: 'surface',
                colorbar: {
                    ticklabelposition: "inside"
                },
                showscale: false // whether or not a colorbar is displayed for this trace.
            }
        },
        surfaceData() {
            return {
                x: [],
                y: [],
                z: [],
                type: 'surface',
                colorscale: [[0, this.plotConfig.minColor], [1, this.plotConfig.maxColor]],
                colorbar: {
                    ticklabelposition: "inside"
                },
                showscale: false,
                contours: {
                    x: { highlight: true },
                    y: { highlight: true },
                    z: { highlight: false }
                },
                opacity: this.showSlice ? 0.8 : 1
            }
        },
        annotationData(x, y, z, text) { 
            return { x, y, z, text } 
        },
        sliceX(x) {
            let datas = this.sliceData();
            datas.x = [x, x];
            for (let y = this.range.y[0]; y < this.range.y[1]; y += this.plotConfig.precise) {
                datas.y.push(y);
                datas.z.push([this.jointGaussian(x, y), 0])
            }
            this.graphs.push(datas);
        },
        sliceY(y) {
            let datas = this.sliceData();
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
            let shadowLine = this.shadowLine(`x = ${x}`);
            // let px = x > 0 ? this.range.x[1] : this.range.x[0];
            let px = this.range.x[0];
            let area = 0;
            for (let y = this.range.y[0]; y < this.range.y[1]; y += this.plotConfig.precise) {
                shadowLine.x.push(px)
                shadowLine.y.push(y);
                let z = this.jointGaussian(x, y);
                shadowLine.z.push(z)
                area += this.plotConfig.precise * z
            }
            this.graphs.push(shadowLine);

            let y = this.gaussian.y[0];
            let z = this.jointGaussian(x, y);
            let xyzt = this.annotationData(px, y, z, area);
            
            this.layout.scene.annotations.push({
                ...xyzt,
                ...this.annotation
            })
        },
        shadowSliceY(y) {
            // 切片的时候限制 x 和 y 的取值，取值必须大于平均值
            if (y < this.gaussian.y[0]) {
                return;
            }
            let shadowLine = this.shadowLine(`y = ${y}`);
            // let py = y > 0 ? this.range.y[1] : this.range.y[0];
            let py = this.range.y[0];
            let area = 0;
            for (let x = this.range.x[0]; x < this.range.x[1]; x += this.plotConfig.precise) {
                shadowLine.x.push(x);
                shadowLine.y.push(py);
                let z = this.jointGaussian(x, y);
                shadowLine.z.push(z)
                area += this.plotConfig.precise * z
            }
            this.graphs.push(shadowLine);

            let x = this.gaussian.x[0];
            let z = this.jointGaussian(x, y);
            let xyzt = this.annotationData(x, py, z, area);
            
            this.layout.scene.annotations.push({
                ...xyzt,
                ...this.annotation
            })
        },
        calcMainGraph() {
            let datas = this.surfaceData();
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
            this.layout.scene.annotations.length = 0;
            if (this.showSlice) {
                this.sliceX(this.slices.x);
                this.sliceY(this.slices.y);
                this.shadowSliceX(this.slices.x);
                this.shadowSliceY(this.slices.y);
            }
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