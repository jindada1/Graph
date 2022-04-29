Vue.component('gh-zeroone', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">${Lang.zeroone.section_experiment_name}</el-divider>
                <kris-num-input title="${Lang.zeroone.p}" v-model="p" :min="0" :max="1" :step="0.01"></kris-num-input>
                <kris-num-input title="${Lang.zeroone.sample_num}" v-model="experiment.sampleNum" :step="10"></kris-num-input>
                <kris-num-input title="${Lang.zeroone.try_times}" v-model="experiment.epoch" :step="10"></kris-num-input>
                <kris-button :title="btnText" :click="calculateNewData"></kris-button>
            
                <el-divider content-position="center">${Lang.zeroone.distribution_props}</el-divider>
                <kris-color-picker v-model="distributionConfig.barColor" title="${Lang.zeroone.bars_color}"></kris-color-picker>
                
                <el-divider content-position="center">${Lang.zeroone.bars_props}</el-divider>
                <kris-color-picker v-model="barConfig.barColor" title="${Lang.zeroone.bars_color}"></kris-color-picker>
                <kris-slider v-model="layoutConfig.gap" title="${Lang.zeroone.bars_gap}"></kris-slider>
            </template>
            <template v-slot:right>
                <div style="height: 100%; min-height: 720px;">
                    <div class="top">
                        <div :id="plotId('distribution')" style="width: 400px; height: 100%; margin: auto"></div>
                    </div>
                    <div class="down kris-scroll">
                        <div v-if="results.length" class="columns-container">
                            <div class="columns" :style="columnsStyle">
                                <div v-for="(res, index) in results" :key="index" class="column column-graph">
                                    <div style="padding: 0 40px; height: 110px">
                                        <el-descriptions :column="2" :title="'${Lang.zeroone.experiment} ' + index + ' | p = ' + p">
                                            <el-descriptions-item label="${Lang.zeroone.sample_num}">{{ res.sampleNum }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.zeroone.avg}">{{ res.avg }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.zeroone.try_times}">{{ res.epoch }}</el-descriptions-item>
                                            <el-descriptions-item label="${Lang.zeroone.variance}">{{ res.variance }}</el-descriptions-item>
                                        </el-descriptions>
                                    </div>
                                    <div class="graph">
                                        <div :id="plotId('bar', index)" style="width: 100%; height: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="tips">
                            <el-empty description="${Lang.zeroone.no_result_tips}">
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
            componentName: "gh-zeroone",
            updateLock: false,
            inited: false,
            results: [],
            btnText: Lang.zeroone.start_btn_text,
            p: 0.7,
            experiment: {
                sampleNum: 50,  // 样本容量
                epoch: 50,      // 采样次数
                precise: 0.02
            },
            barConfig: {
                barColor: "#88C3FF",
                maxBarWidth: 30,
            },
            distributionConfig: {
                barColor: "#88C3FF",
            },
            layoutConfig: {
                gap: 10,
            },
            storageList: [
                "experiment",
                "barConfig",
                "distributionConfig"
            ]
        }
    },
    watch: {
        p() {
            this.renderTop();
            this.storeSettings()
        },
        distributionConfig: {
            handler: function () {
                this.renderTop();
                this.storeSettings()
            },
            deep: true
        },
        barConfig: {
            handler: function () {
                this.display();
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
            const x = [-1, 0, 1, 2]
            const y = [0, 1 - this.p, this.p, 0]
            const distribution = {
                x, y,
                type: 'bar',
                marker: {
                    color: this.distributionConfig.barColor
                }
            }
            Plotly.newPlot(this.plotId('distribution'), [distribution], this.layout(Lang.zeroone.distribution_graph_name), {
                displayModeBar: false
            });
        },
        renderBottom() {
            for (let index = 0; index < this.results.length; index++) {
                const data = this.results[index];
                const {x, y} = data.bars;
                Plotly.newPlot(this.plotId('bar', index), [this.barData(x, y)], this.layout(Lang.zeroone.bars_graph_name), {
                    displayModeBar: false
                });
            }
        },
        // 只渲染，数据计算在上游
        render() {
            this.renderTop();
            this.renderBottom();
            this.storeSettings()
        },
        group(num) {
            const { precise } = this.experiment
            const group = parseInt(num / precise)

            return parseFloat((group * precise).toFixed(2))
        },
        // 生成样本的采样函数
        sample() {
            let samples = [];
            const { sampleNum } = this.experiment;
            for (let index = 0; index < sampleNum; index++) {
                samples.push(Math.random() > this.p ? 0 : 1)
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
            this.display();
            this.inited = true;
        },
    },
    mounted() {
        this.$refs.frame.loadData(this);
    }
})