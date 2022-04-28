Vue.component('gh-normal', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">总体分布</el-divider>
                <kris-num-input title="均值" v-model="experiment.avg" :step="1"></kris-num-input>
                <kris-num-input title="标准差" v-model="experiment.std" :step="1"></kris-num-input>
                <el-divider content-position="center">实验设置</el-divider>
                <kris-num-input title="样本容量" v-model="experiment.sampleNum" :step="10"></kris-num-input>
                <kris-num-input title="重复次数" v-model="experiment.epoch" :step="10"></kris-num-input>
                <kris-button title="开始实验并记录结果" :tips="'重复 ' + experiment.epoch + ' 次'" :click="calculateNewData"></kris-button>
            
                <el-divider content-position="center">分布图属性</el-divider>
                <kris-color-picker v-model="curveConfig.lineColor" title="线条颜色"></kris-color-picker>
                <kris-num-input-range v-model="curveConfig.range" title="x"></kris-num-input-range>
                <kris-slider v-model="curveConfig.precise" title="绘图误差" :min="0.01" :max="0.2" :step="0.01">
                </kris-slider>
                
                <el-divider content-position="center">直方图属性</el-divider>
                <kris-color-picker v-model="barConfig.barColor" title="填充颜色"></kris-color-picker>
                <kris-slider v-model="layoutConfig.gap" title="列间距"></kris-slider>
            </template>
            <template v-slot:right>
                <div style="height: 100%; min-height: 720px;">
                    <div class="top">
                        <div :id="plotId('curve')" style="width: 100%; height: 100%;"></div>
                    </div>
                    <div class="down kris-scroll">
                        <div class="columns-container">
                            <div class="columns" :style="columnsStyle">
                                <div v-for="(res, index) in results" :key="index" class="column column-graph">
                                    <div style="padding: 0 40px; height: 110px">
                                        <el-descriptions :column="2" :title="'实验 ' + index">
                                            <el-descriptions-item label="样本容量">{{ res.sampleNum }}</el-descriptions-item>
                                            <el-descriptions-item label="均值">{{ res.avg }}</el-descriptions-item>
                                            <el-descriptions-item label="重复次数">{{ res.epoch }}</el-descriptions-item>
                                            <el-descriptions-item label="方差">{{ res.variance }}</el-descriptions-item>
                                        </el-descriptions>
                                    </div>
                                    <div class="graph">
                                        <div :id="plotId('bar', index)" style="width: 100%; height: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-normal",
            updateLock: false,
            inited: false,
            results: [],
            experiment: {
                avg: 0,
                std: 1,
                sampleNum: 50,  // 样本容量
                precise: 0.1,   // 采样精度
                epoch: 50       // 采样次数
            },
            barConfig: {
                barColor: "#88C3FF",
                maxBarWidth: 30,
            },
            curveConfig: {
                lineColor: "#88C3FF",
                precise: 0.1,
                range: [-3, 3]
            },
            layoutConfig: {
                gap: 10,
            },
            storageList: [
                "experiment",
                "barConfig"
            ]
        }
    },
    watch: {
        curveConfig: {
            handler: function () {
                this.render();
            },
            deep: true
        },
        barConfig: {
            handler: function () {
                this.render();
            },
            deep: true
        },
    },
    computed: {
        columnsStyle: function () {
            return {
                columnGap: this.layoutConfig.gap + "px "
            }
        },
    },
    methods: {
        plotId(name, id = "") {
            return `${this.componentName}-${name}-${id}`;
        },
        barData(x, y) {
            return {
                x, y,
                type: 'bar',
                marker: {
                    color: this.barConfig.barColor
                }
            }
        },
        curveData() {
            let x = [];
            let y = [];
            let [from, to] = this.curveConfig.range;
            let normalFunc = Gaussian(this.experiment.avg, this.experiment.std)
            for (let _x = from; _x < to; _x += this.curveConfig.precise) {
                x.push(_x);
                y.push(normalFunc.get(_x))
            }
            return {
                x,
                y,
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: this.curveConfig.lineColor,
                    width: 1
                }
            }
        },
        layout(title = "") {
            return {
                title: {
                    text: title,
                    font: {
                        size: 14
                    },
                }
            }
        },
        // 只渲染，数据计算在上游
        render() {
            Plotly.newPlot(this.plotId('curve'), [this.curveData()], this.layout("总体分布"));
            for (let index = 0; index < this.results.length; index++) {
                const data = this.results[index];
                Plotly.newPlot(this.plotId('bar', index), data.bars, this.layout("样本均值的直方图"),  {
                    displayModeBar: false
                });
            }
            this.storeSettings()
        },
        group(num) {
            //     avg
            //      ↓
            // |----.----|
            // |_precise_|
            const {avg, precise} = this.experiment
            const left  = avg - (precise / 2);
            const right = avg + (precise / 2);

            let group;
            if (num > left) {
                group = parseInt((num - left) / precise)
            }
            else {
                group = -parseInt((right - num) / precise)
            }

            return parseFloat((avg + group * precise).toFixed(2))
        },
        // 生成样本的采样函数
        sample() {
            let bm = BoxMuller();
            const {sampleNum, avg, std} = this.experiment
            let samples = [];
            
            for (let index = 0; index < sampleNum; index++) {
                let n = bm(avg, std);
                samples.push(this.group(n))
            }
            return samples
        },
        multiSamples() {
            const { epoch } = this.experiment;
            let means = []
            for (let index = 0; index < epoch; index++) {
                const samples = this.sample();
                const mean = meanOfArray(samples)
                means.push(this.group(mean))
            }
            return means
        },
        toBars(samples) {
            let sampleCount = {};
            for (sn of samples) {
                sampleCount[sn] = sampleCount[sn] ? sampleCount[sn] + 1 : 1;
            }
            
            let bars = {
                x: [],
                y: [],
            }
            for (const [num, count] of Object.entries(sampleCount)) {
                bars.x.push(num);
                bars.y.push(count);
            }
            return bars
        },
        // 采样并计算数据，下游是渲染
        calculateNewData() {
            const {sampleNum, epoch} = this.experiment;
            const samples = this.multiSamples();
            const avg = meanOfArray(samples).toFixed(2);
            const variance = (samples.reduce((s, x) => s + (avg - x) * (avg - x), 0) / (samples.length - 1)).toFixed(9);
            const {x, y} = this.toBars(samples);
            const bars = [this.barData(x, y)];
            this.results.push({avg, variance, bars, sampleNum, epoch})
            this.display()
        },
        display() {
            if (this.updateLock) return;
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
        // this.$refs.frame.loadData(this);
    }
})