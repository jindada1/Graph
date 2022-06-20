 Vue.component('gh-normalSL', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">${Lang.normalSL.section_distribution_name}</el-divider>
                <kris-num-input title="${Lang.normalSL.null_hypotheses}" v-model="experiment.avg" :step="1"></kris-num-input>
                <kris-form-item title="${Lang.normalSL.alternative_hypotheses}" :value="'μ ≠ ' + experiment.avg.toString()" :step="1"></kris-form-item>
                <el-divider content-position="center">${Lang.normalSL.section_experiment_name}</el-divider>
                <kris-num-input title="${Lang.normalSL.sample_num}" v-model="experiment.sampleNum" :step="10"></kris-num-input>
                <kris-num-input v-model="graphConfig.level" :min="0.5" :max="0.99" :step="0.01" title="${Lang.normalSL.significant_level}"></kris-num-input>
                <kris-num-input title="${Lang.normalSL.try_times}" v-model="experiment.epoch" :step="10"></kris-num-input>
                <kris-button title="${Lang.normalSL.view_table}" type="text" :click="showTable"></kris-button>
                <el-dialog class="kris-table-dialog" title="${Lang.normalSL.table_name}" :visible.sync="dialogTableVisible">
                    <kris-table :title="table.title" :header="table.header" :rows="table.rows"></kris-table>
                </el-dialog>

                <el-divider content-position="center">${Lang.normalSL.display_props}</el-divider>
                <kris-slider v-model="layoutConfig.formulaHeight" :min="50" :max="90" title="${Lang.normalSL.formula_size}"></kris-slider>
            </template>
            <template v-slot:right>
                <div style="height: 100%; margin: 0 30px;">
                    <div style="height: 220px;">
                        <div> ${ Lang.normalSL.formula_description } </div>
                        <div style="display: flex; align-items: center; margin: 30px 0;"> 
                            ${ Lang.normalSL.deny_area }
                            <img src='./static/images/deny_area.svg' :height="layoutConfig.formulaHeight + 'px'" />
                            <div style="flex: 1"></div>
                            <img src='./static/images/s.svg' :height="layoutConfig.formulaHeight + 'px'" />
                            <div style="flex: 1"></div>
                        </div>
                        <div style="justify-content: space-between" class="equations">
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
                            <div> </div>
                        </div>
                    </div>
                    <div style="position: relative; height: calc(100% - 220px); min-height: 400px">
                        <el-descriptions class="margin-top" title="${Lang.normalSL.result1_title}" :column="2" border>
                            <template slot="extra">
                                <el-button type="primary" size="small" @click="calculateData">
                                    ${Lang.normalSL.result_btn_text}
                                </el-button>
                            </template>
                            <el-descriptions-item label="${Lang.normalSL.result1_accept}">
                                {{result.a}}
                            </el-descriptions-item>
                            <el-descriptions-item label="${Lang.normalSL.result1_deny}">
                                {{experiment.epoch - result.a}}
                            </el-descriptions-item>
                            <el-descriptions-item label="${Lang.normalSL.result1_frequency}">
                                {{((experiment.epoch - result.a) / 100).toFixed(2)}}
                            </el-descriptions-item>
                            <el-descriptions-item label="注">
                                ${Lang.normalSL.result1_tips_1}
                                {{experiment.avg}}
                                ${Lang.normalSL.result1_tips_2} 
                                {{Math.abs(experiment.avg) / 10}}
                                ${Lang.normalSL.result1_tips_3} 
                            </el-descriptions-item>
                        </el-descriptions>
                        <div style="height: 50px"></div>
                        <el-descriptions class="margin-top" title="${Lang.normalSL.result2_title}" :column="2" border>
                            <template slot="extra">
                                <el-button type="primary" size="small" @click="calculateData">
                                    ${Lang.normalSL.result_btn_text}
                                </el-button>
                            </template>
                            <el-descriptions-item label="${Lang.normalSL.result2_accept}">
                                {{result.a}}
                            </el-descriptions-item>
                            <el-descriptions-item label="${Lang.normalSL.result2_deny}">
                                {{experiment.epoch - result.a}}
                            </el-descriptions-item>
                            <el-descriptions-item label="${Lang.normalSL.result2_frequency}">
                                {{((experiment.epoch - result.a) / 100).toFixed(2)}}
                            </el-descriptions-item>
                            <el-descriptions-item label="注">
                                ${Lang.normalSL.result2_tips_1}
                                {{experiment.avg}}
                                ${Lang.normalSL.result2_tips_2} 
                                {{Math.abs(experiment.avg) / 10}}
                                ${Lang.normalSL.result2_tips_3} 
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-normalSL",
            updateLock: false,
            inited: false,
            table: {
                title: "\\",
                header: [],
                rows: []
            },
            dialogTableVisible: false,
            result: {
                a: 0,
                b: 0,
            },
            alpha: "",
            t: "",
            experiment: {
                avg: 4,
                sampleNum: 50,  // 样本容量
                precise: 0.1,   // 采样精度
                epoch: 50       // 采样次数
            },
            graphConfig: {
                level: 0.05
            },
            layoutConfig: {
                formulaHeight: 50,
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
        calcStd() {
            // 方差为 |均值| / 10
            let avg = this.experiment.avg;
            avg = avg < 0 ? -avg : avg;
            return Math.sqrt(avg / 10);
        },
        // 生成样本的采样函数
        sample() {
            let bm = BoxMuller();
            const {sampleNum, avg} = this.experiment
            let samples = [];
            
            for (let index = 0; index < sampleNum; index++) {
                let n = bm(avg, this.calcStd());
                samples.push(n)
            }
            return samples
        },
        display() {
            this.calculateParams()
            this.calculateData()
        },
        calculateParams() {
            const { level } = this.graphConfig
            const n = parseFloat(level);
            const alpha = 1 - (n / 2);
            this.alpha = alpha.toFixed(4);
            this.t = this.searchTable(alpha);
        },
        // 采样并计算数据，下游是渲染
        calculateData() {
            const {epoch, avg} = this.experiment;
            let a = 0;
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
                const std_mean = math.abs(mean - avg) / s;
                // 左边
                const left = Math.sqrt(samples.length) * std_mean;
                // 右边
                const right = this.t
                if (left < right) {
                    a += 1
                }
            }
            this.result.a = a
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