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
                <kris-slider title="实际是阴性诊断成阴性的概率" v-model="experiment.NN" :min="0" :max="1" :step="0.01" :fix="2"></kris-slider>
                <kris-form-item title="实际是阴性但诊断成阳性的概率" :value="NP"></kris-form-item>
                <kris-slider title="实际是阳性诊断成阳性的概率" v-model="experiment.PP" :min="0" :max="1" :step="0.01" :fix="2"></kris-slider>
                <kris-form-item title="实际是阳性但诊断成阴性的概率" :value="PN"></kris-form-item>
            </template>
            <template v-slot:right>
                <el-row class="kris-icons-row">
                    <el-col :span="12"> 诊断为阳性 </el-col>
                    <el-col :span="12"> 诊断为阴性 </el-col>
                </el-row>
                <el-row class="kris-icons-row">
                    <el-col :span="6">
                        <kris-user :diagnosed="true"  :positive="true" ></kris-user>
                    </el-col>
                    <el-col :span="6">
                        <kris-user :diagnosed="true"  :positive="false"></kris-user>
                    </el-col>
                    <el-col :span="6">
                        <kris-user :diagnosed="false" :positive="true" ></kris-user>
                    </el-col>
                    <el-col :span="6">
                        <kris-user :diagnosed="false" :positive="false"></kris-user>
                    </el-col>
                </el-row>
                <el-row class="kris-icons-row">
                    <el-col :span="6" v-for="(n, i) in result" :key="i"> {{n}} </el-col>
                </el-row>
                <el-row class="kris-icons-row" :style="'height:'+ maxBarHeight +'px'">
                    <el-col :span="6" v-for="(h, index) in barHeights" :key="index">
                        <div class="kris-col-bar" :style="'height:'+ h +'px'"></div>
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
            maxBarHeight: 200,
            result: [],
            storageList: [
                "experiment"
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
    },
    computed: {
        barHeights() {
            let result = Object.values(this.result)
            let MH =  Math.max(...result);
            return result.map(num => parseInt(this.maxBarHeight * num / MH));
        },
        NP() { 
            // 实际是阴性但诊断成阳性的概率
            return (1 - this.experiment.NN).toString()
        },
        PN() {
            // 实际是阳性但诊断成阴性的概率
            return (1 - this.experiment.PP).toString()
        }
    },
    methods: {
        display() {
            if (this.updateLock) return;
            let N = this.experiment.total;
            let K = this.experiment.positive;
            
            this.result = [
                K * this.NP,
                K * this.experiment.NN,
                (N - K) * this.experiment.PP,
                (N - K) * this.PN
            ];
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