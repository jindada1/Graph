Vue.component('gh-normalCI', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">${Lang.normalCI.section_distribution_name}</el-divider>
                <kris-num-input title="${Lang.normalCI.avg}" v-model="experiment.avg" :step="1"></kris-num-input>
                <kris-num-input title="${Lang.normalCI.std}" v-model="experiment.std" :step="1"></kris-num-input>
                <el-divider content-position="center">${Lang.normalCI.section_experiment_name}</el-divider>
                <kris-num-input title="${Lang.normalCI.sample_num}" v-model="experiment.sampleNum" :step="10"></kris-num-input>
                <kris-num-input title="${Lang.normalCI.try_times}" v-model="experiment.epoch" :step="10"></kris-num-input>
                <kris-button :title="btnText" :click="display"></kris-button>
                
                <el-divider content-position="center">${Lang.normalCI.confidence_interval_config}</el-divider>
                <kris-num-input v-model="graphConfig.level" :min="0.5" :max="0.99" :step="0.01" title="${Lang.normalCI.confidence_level}"></kris-num-input>
                <kris-button title="${Lang.normalCI.view_table}" type="text" :click="showTable"></kris-button>
                <el-dialog class="kris-table-dialog" title="${Lang.normalCI.table_name}" :visible.sync="dialogTableVisible">
                    <kris-table :title="table.title" :header="table.header" :rows="table.rows"></kris-table>
                </el-dialog>

                <el-divider content-position="center">${Lang.normalCI.display_props}</el-divider>
                <kris-slider v-model="layoutConfig.formulaWidth" :min="400" :max="800" title="${Lang.normalCI.formula_size}"></kris-slider>
                <kris-color-picker v-model="layoutConfig.safeColor" title="${Lang.normalCI.interval_safe_color}"></kris-color-picker>
                <kris-color-picker v-model="layoutConfig.dangerColor" title="${Lang.normalCI.interval_danger_color}"></kris-color-picker>
                <kris-slider v-model="layoutConfig.intervalHeight" :max="30" title="${Lang.normalCI.interval_height}"></kris-slider>
                <kris-slider v-model="layoutConfig.intervalGap" :max="30" title="${Lang.normalCI.interval_gap}"></kris-slider>
            </template>
            <template v-slot:right>
                <div style="height: 100%;">
                    <div class="formula-holder" style="height: 220px;">
                        ${ Lang.normalCI.confidence_interval_formula }
                        <img src='./static/images/normal_confidence_interval.svg' 
                            alt="${Lang.normalCI.confidence_interval_formula}"
                            :width="layoutConfig.formulaWidth + 'px'"
                        />
                        <div class="equations">
                            <div>
                                <img src='./static/images/1-alpha.svg' />
                                <div> {{graphConfig.level}} </div>
                            </div>
                            <div>
                                <img src='./static/images/1-1_2alpha.svg' />
                                <div> {{ alpha }} </div>
                            </div>
                            <div>
                                <img src='./static/images/t_1-1_2alpha.svg'/>
                                <div style="margin-bottom: 6px;"> {{ t }} </div>
                            </div>
                        </div>
                    </div>
                    <div style="position: relative; height: calc(100% - 220px)">
                        <div v-if="results.length" style="height: 100%;">
                            <kris-intervals :intervals="results"
                                :height="layoutConfig.intervalHeight"
                                :gap="layoutConfig.intervalGap"
                                :hittedColor="layoutConfig.safeColor"
                                :unhittedColor="layoutConfig.dangerColor"
                            ></kris-intervals>
                            <div class="kris-intervals-result-panel">
                                <div> ${Lang.normalCI.safe_description}{{safeNum}} </div>
                                <div> ${Lang.normalCI.unsafe_description}{{unsafeNum}} </div>
                            </div>
                        </div>
                        <div v-else class="tips">
                            <el-empty description="${Lang.normalCI.no_result_tips}">
                                <el-button @click="display"> {{btnText}} </el-button>
                            </el-empty>
                        </div>
                    </div>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-normalCI",
            updateLock: false,
            inited: false,
            table: {
                title: "\\",
                header: [],
                rows: []
            },
            dialogTableVisible: false,
            results: [],
            safeNum: "",
            unsafeNum: "",
            alpha: "",
            t: "",
            btnText: Lang.normalCI.start_btn_text,
            experiment: {
                avg: 0,
                std: 1,
                sampleNum: 50,  // 样本容量
                precise: 0.1,   // 采样精度
                epoch: 50       // 采样次数
            },
            graphConfig: {
                level: 0.95
            },
            layoutConfig: {
                formulaWidth: 500,
                safeColor: "#88C3FF",
                dangerColor: "#ff7979",
                intervalHeight: 10,
                intervalGap: 10,
            },
            storageList: [
                "experiment",
                "layoutConfig"
            ]
        }
    },
    watch: {
        graphConfig: {
            handler: function (v) {
                this.calculateParams()
            },
            deep: true
        },
        layoutConfig: {
            handler: function () {
                this.storeSettings()
            },
            deep: true
        },
    },
    methods: {
        plotId(name, id = "") {
            return `${this.componentName}-${name}-${id}`;
        },
        showTable() {
            this.dialogTableVisible = true
        },
        // 生成样本的采样函数
        sample() {
            let bm = BoxMuller();
            const {sampleNum, avg, std} = this.experiment
            let samples = [];
            
            for (let index = 0; index < sampleNum; index++) {
                let n = bm(avg, std);
                samples.push(n)
            }
            return samples
        },
        display() {
            this.calculateParams()
            this.calculateData()
        },
        calculateParams() {
            const val = this.graphConfig.level
            const n = parseFloat(val);
            const alpha = n / 2 + 0.5
            this.alpha = alpha.toFixed(4);
            this.t = this.searchTable(alpha);
        },
        // 采样并计算数据，下游是渲染
        calculateData() {
            const {epoch, avg} = this.experiment;
            let results = []
            let safeNum = 0;
            // 采样 epoch 次
            for (let index = 0; index < epoch; index++) {
                const samples = this.sample();
                // 计算此次采样的均值
                const mean = meanOfArray(samples)
                // 此次采样的方差
                const variance = samples.reduce((s, x) => s + (mean - x) * (mean - x), 0) / (samples.length - 1);
                // 标准差
                const s = Math.sqrt(variance);
                // 标准化
                const std_x = (mean - avg) / s;
                // 一侧的宽度
                const oneSide = this.t * s / Math.sqrt(samples.length)
                // 看看是否包含真值
                if (std_x - oneSide < avg && avg < std_x + oneSide) {
                    safeNum += 1;
                }
                results.push({
                    width: 2 * oneSide,
                    position: std_x,
                })
            }
            this.results = results
            this.safeNum = safeNum
            this.unsafeNum = this.experiment.epoch - safeNum
        },
        // 反向查找正态分布表
        searchTable(num) {
            for (let r = 0; r < this.table.rows.length; r++) {
                const row = this.table.rows[r].data;
                for (let c = 0; c < row.length; c++) {
                    if (row[c] >= num ) {
                        let res = r * 0.1 + c * 0.01
                        return parseFloat(res.toFixed(2))
                    }
                }
            }
            return 3
        },
        // 计算标准正态分布表
        calcTable() {
            const cs = 0.099, rs = 3.01

            let header = []
            for (let c = 0; c < cs; c += 0.01) {
                header.push(c.toFixed(2))
            }

            let rows = []
            for (let r = 0; r < rs; r += 0.1) {
                let row = {
                    h: r.toFixed(1),
                    data: []
                }
                
                for (let c = 0; c < cs; c += 0.01) {
                    const p = definiteIntegralofGaussian(0, 1, 0, r + c);
                    row.data.push((p  + 0.5).toFixed(4))
                }
                rows.push(row);
            }

            this.table = {
                title: 'z',
                header,
                rows
            }
        },
        storeSettings() {
            localStorage.setItem(this.componentName, JSON.stringify(this.$data))
        },
        init() {
            if (this.inited) return;
            this.inited = true;
            this.calcTable();
            this.display()
        },
    },
    mounted() {
        this.$refs.frame.loadData(this);
    }
})