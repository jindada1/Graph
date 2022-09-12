Vue.component('gh-normal', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">${Lang.normal.section_distribution_name}</el-divider>
                <kris-num-input title="${Lang.normal.avg}" v-model="experiment.avg" :step="1"></kris-num-input>
                <kris-num-input title="${Lang.normal.std}" v-model="experiment.std" :step="1"></kris-num-input>
                <el-divider content-position="center">${Lang.normal.section_experiment_name}</el-divider>
                <kris-num-input title="${Lang.normal.sample_num}" v-model="experiment.sampleNum" :step="10"></kris-num-input>
                <kris-num-input title="${Lang.normal.try_times}" v-model="experiment.epoch" :step="10"></kris-num-input>
                <kris-button :title="btnText" :click="calculateNewData"></kris-button>
            
                <el-divider content-position="center">${Lang.normal.curve_props}</el-divider>
                <kris-color-picker v-model="curveConfig.lineColor" title="${Lang.normal.curve_color}"></kris-color-picker>
                <kris-num-input-range v-model="curveConfig.range" title="x ${Lang.normal.curve_range}"></kris-num-input-range>
                <kris-num-input-range v-model="curveConfig.xbarRange" title="x̄ ${Lang.normal.curve_range}"></kris-num-input-range>
                <kris-slider v-model="curveConfig.precise" title="${Lang.normal.curve_precise}" :min="0.01" :max="0.2" :step="0.01">
                </kris-slider>
                
                <el-divider content-position="center">${Lang.normal.bars_props}</el-divider>
                <kris-color-picker v-model="barConfig.barColor" title="${Lang.normal.bars_color}"></kris-color-picker>
                <kris-slider v-model="layoutConfig.gap" title="${Lang.normal.bars_gap}"></kris-slider>
            </template>
            <template v-slot:right>
                <div style="height: 100%; min-height: 720px;">
                    <div class="top" style="display:flex" :id="plotId('resizeable')">
                        <div :id="plotId('curve-left')" style="width: 50%; height: 100%;"></div>
                        <div :id="plotId('curve-right')" style="width: 50%; height: 100%;"></div>
                    </div>
                    <div class="down kris-scroll">
                        <div v-if="results.length" class="columns-container">
                            <div class="columns" :style="columnsStyle">
                                <div v-for="(res, index) in results" :key="index" class="column column-graph">
                                    <div style="padding: 0 40px; height: 200px">
                                        <el-descriptions :column="1" :title="'${Lang.normal.experiment} ' + index">
                                            <el-descriptions-item label="${Lang.normal.sample_num}">{{ res.sampleNum }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.normal.avg}">{{ res.avg }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.normal.try_times}">{{ res.epoch }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.normal.variance}">{{ res.variance }}</el-descriptions-item>
                                        </el-descriptions>
                                    </div>
                                    <div style="height: calc(100% - 200px);">
                                        <div :id="plotId('bar', index)" style="width: 100%; height: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="tips">
                            <el-empty description="${Lang.normal.no_result_tips}">
                                <el-button @click="calculateNewData"> {{btnText}} </el-button>
                            </el-empty>
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
            btnText: Lang.normal.start_btn_text,
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
                range: [-3, 3],
                xbarRange: [-0.5, 0.5],
            },
            layoutConfig: {
                gap: 10,
            },
            storageList: [
                "experiment",
                "barConfig",
                "curveConfig",
                "layoutConfig",
            ]
        }
    },
    watch: {
        curveConfig: {
            handler: function () {
                this.renderTop();
                this.storeSettings()
            },
            deep: true
        },
        barConfig: {
            handler: function () {
                this.renderBottom();
                this.storeSettings()
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
        curve2Data() {
            let x = [];
            let y = [];
            let [from, to] = this.curveConfig.xbarRange;
            const std = this.experiment.std / Math.sqrt(this.experiment.sampleNum)
            let normalFunc = Gaussian(this.experiment.avg, std)
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
        renderTop() {
            Plotly.newPlot(this.plotId('curve-left'), [this.curveData()], this.layout(Lang.normal.curve_graph_name));
            Plotly.newPlot(this.plotId('curve-right'), [this.curve2Data()], this.layout(Lang.normal.curve_2_graph_name));
        },
        renderBottom() {
            for (let index = 0; index < this.results.length; index++) {
                const data = this.results[index];
                const {x, y} = data.bars
                Plotly.newPlot(this.plotId('bar', index), [this.barData(x, y)], this.layout(Lang.normal.bars_graph_name),  {
                    displayModeBar: false
                });
            }
        },
        // 只渲染，数据计算在上游
        render() {
            this.renderTop();
            this.renderBottom();
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
            const variance = (samples.reduce((s, x) => s + (avg - x) * (avg - x), 0) / (samples.length - 1)).toFixed(4);
            const {x, y} = this.toBars(samples);
            const bars = {x, y};
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
            this.observeSize()
            this.display();
            this.inited = true;
        },
        observeSize() {
            const elm = document.getElementById(this.plotId('resizeable'));
            const resizeObserver = new ResizeObserver(
                debounce(()=>{
                    this.renderTop();
                })
            );
            resizeObserver.observe(elm);
        }
    },
    mounted() {
        this.$refs.frame.loadData(this);
    }
})