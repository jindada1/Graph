/**
 * 实验场景：贝叶斯
 */

Vue.component('gh-bayes', {
    template: `
        <kris-layout ref="frame">
            <template v-slot:left>
                <el-divider content-position="center">实验设置</el-divider>
                <kris-num-input title="总人数" v-model="experiment.total" :step="100" :min="0"></kris-num-input>
                <kris-num-input title="阳性人数" v-model="experiment.positive" :step="5" :min="0" :max="experiment.total"></kris-num-input>
                <div style="margin: 20px 0 0 0;"></div>
                <kris-slider title="实际是阴性诊断成阴性的概率" v-model="experiment.NN" :min="0" :max="1" :step="0.01" :fix="precise"></kris-slider>
                <kris-form-item title="实际是阴性但诊断成阳性的概率" :value="NP.toString()"></kris-form-item>
                <div style="margin: 20px 0 0 0;"></div>
                <kris-slider title="实际是阳性诊断成阳性的概率" v-model="experiment.PP" :min="0" :max="1" :step="0.01" :fix="precise"></kris-slider>
                <kris-form-item title="实际是阳性但诊断成阴性的概率" :value="PN.toString()"></kris-form-item>
                <kris-button title="开始模拟" tips="根据已有参数模拟一次诊断" :click="display"></kris-button>
            
                <el-divider content-position="center">图像属性</el-divider>
                <kris-color-picker v-model="plotConfig.diagnosedColor" title="诊断为阳性的颜色"></kris-color-picker>
                <kris-color-picker v-model="plotConfig.unDiagnosedColor" title="诊断为阴性的颜色"></kris-color-picker>
                <kris-color-picker v-model="plotConfig.barColor" title="柱的颜色"></kris-color-picker>
                <kris-slider v-model="plotConfig.barWidth" title="柱的宽度" :min="10" :max="100" :step="1"></kris-slider>
                <kris-slider v-model="plotConfig.maxBarHeight" title="柱的最大高度" :min="100" :max="600" :step="10"></kris-slider>
            </template>
            <template v-slot:right>
                
                <el-row class="kris-icons-row">
                    <el-col :span="12"> 诊断为阳性 </el-col>
                    <el-col :span="12"> 诊断为阴性 </el-col>
                </el-row>
                <el-row class="kris-icons-row">
                    <el-col v-for="(dp, index) in order" :key="index" :span="6">
                        <kris-user :diagnosed="dp[0]" :positive="dp[1]" 
                            :highlight="plotConfig.diagnosedColor" 
                            :normal="plotConfig.unDiagnosedColor">
                        </kris-user>
                    </el-col>
                </el-row>
                <el-row class="kris-icons-row">
                    <el-col :span="6" v-for="(n, i) in result" :key="i"> {{n}} </el-col>
                </el-row>
                <el-row class="kris-icons-row" :style="'height:'+ plotConfig.maxBarHeight +'px'">
                    <el-col :span="6" v-for="(h, index) in barHeights" :key="index">
                        <div class="kris-col-bar" :style="
                            'height:'+ h +'px;' +  
                            'background-color:'+ plotConfig.barColor + ';' + 
                            'width:' + plotConfig.barWidth + 'px'
                        "></div>
                    </el-col>
                </el-row>
            </template>
        </kris-layout>
    `,
    data() {
        return {
            componentName: "gh-bayes",
            updateLock: false,
            inited: false,
            experiment: {
                total: 1000,    // 一共 N 个人
                positive: 100,  // 其中有 K 个阳性
                NN: 0.9,        // 实际是阴性诊断成阴性的概率
                PP: 0.9,        // 实际是阳性诊断成阳性的概率
            },
            plotConfig: {
                diagnosedColor: "#409EFF",
                unDiagnosedColor: "#DDDDDD",
                barWidth: 40,
                barColor: "#79BBFF",
                maxBarHeight: 200,
            },
            order: [
                [true, true],
                [true, false],
                [false, true],
                [false, false],
            ],
            precise: 2,
            result: [],
            storageList: [
                "experiment",
                "plotConfig"
            ],
        }
    },
    watch: {
        experiment: {
            handler: function () {
                if (this.experiment.total < this.experiment.positive) {
                    this.experiment.positive = this.experiment.total;
                }

                this.display();
            },
            deep: true
        },
        plotConfig: {
            handler: function () {
                if (this.updateLock) return;
                this.storeSettings();
            },
            deep: true
        }
    },
    computed: {
        barHeights() {
            let result = Object.values(this.result)
            let MH =  Math.max(...result);
            return result.map(num => parseInt(this.plotConfig.maxBarHeight * num / MH));
        },
        NN() { return this.experiment.NN.toFixed(this.precise) },
        NP() { return (1 - this.experiment.NN).toFixed(this.precise) },  // 实际是阴性但诊断成阳性的概率
        PP() { return this.experiment.PP.toFixed(this.precise) },
        PN() { return (1 - this.experiment.PP).toFixed(this.precise) },  // 实际是阳性但诊断成阴性的概率
    },
    methods: {
        display() {
            if (this.updateLock) return;
            this.emulate();
            this.storeSettings();
        },
        emulate() {
            // N 个人
            let N = this.experiment.total;
            // K 个阳性
            let K = this.experiment.positive;

            // 试图诊断阴性
            let NNums = this.divide(K, this.NN)
            // 试图诊断阴性
            let PNums = this.divide(N - K, this.PP)
            
            this.result = [NNums[1], NNums[0], ...PNums];
        },
        divide(num, p) {
            let hit = 0
            for (let i = 0; i < num; i++) {
                hit += Math.random() < p
            }
            return [hit, num - hit]
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