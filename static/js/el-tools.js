/**
 * el-tools.js v1.1.0
 * @author Kris Huang
 * @wechat IsKrisHuang
 * 
 * 对 element-ui 控件的二层封装
 */

Vue.component('kris-color-picker', {
    template: `
        <div class="el-tools-item">
            <span class="el-tools-item-head"> {{title}} </span>
            <span style="line-height: 40px; padding-right: 20px;" v-bind:style="'color: ' + color"> {{color}} </span>
            <el-color-picker v-model="color" @change="colorChanged"/>
        </div>
    `,
    props: {
        title: String,
        value: String
    },
    data() {
        return {
            color: this.value
        }
    },
    methods: {
        colorChanged(val) {
            this.$emit('input', val);
        }
    },
    watch: {
        value(value) {
            this.color = value;
        }
    }
})

Vue.component('kris-slider', {
    template: `
        <div class="el-tools-item el-tools-item-col">
            <div>
                <span>{{title}}</span>
                <span style="float: right;">{{sliderValue}}</span>
            </div>
            <el-slider v-model="sliderValue" @input="sliderValueChanging" :show-tooltip="false"
                :min="min" :max="max" :step="step">
            </el-slider>
        </div>
    `,
    props: {
        title: String,
        value: Number,
        min: {
            default: 1,
            type: Number
        },
        max: {
            default: 100,
            type: Number
        },
        step: {
            default: 1,
            type: Number
        }
    },
    data() {
        return {
            sliderValue: this.value
        }
    },
    methods: {
        sliderValueChanging(val) {
            this.$emit('input', val);
        }
    },
    watch: {
        value(value) {
            this.sliderValue = value;
        }
    }
})

Vue.component('kris-num-input', {
    template: `
        <div class="el-tools-item">
            <span class="el-tools-item-head">{{title}}</span>
            <el-input-number v-model="numValue" 
            @change="numValueChanged" :min="min" :step="step"></el-input-number>
        </div>
    `,
    props: {
        title: String,
        value: Number,
        min: {
            default: 1,
            type: Number
        },
        step: {
            default: 1,
            type: Number
        }
    },
    data() {
        return {
            numValue: this.value
        }
    },
    methods: {
        numValueChanged(val) {
            this.$emit('input', val);
        }
    },
    watch: {
        value(value) {
            this.numValue = value;
        }
    }
})

Vue.component('kris-tag-group', {
    template: `
        <div class="el-tools-item" style="display: flex">
            <span class="el-tools-item-head">{{title}}</span>
            <div>
                <el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false"
                    @close="handleClose(tag)" class="el-tools-item-tag">
                    {{tag}}
                </el-tag>
                <el-input v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small"
                    @keyup.enter.native="handleInputConfirm" @blur="handleBlur"
                    class="el-tools-item-tag-add el-tools-item-tag">
                </el-input>
                <el-button v-else size="small" @click="showInput" 
                    class="el-tools-item-tag-add el-tools-item-tag">+ Add </el-button>
            </div>
        </div>
    `,
    props: {
        title: String,
        value: Array,
    },
    data() {
        return {
            dynamicTags: this.value,
            inputVisible: false,
            inputValue: ''
        }
    },
    methods: {
        handleClose(tag) {
            this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
            this.$emit('input', this.dynamicTags);
        },
        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (this.isValid(inputValue)) {
                this.dynamicTags.push(parseFloat(inputValue));
                this.$emit('input', this.dynamicTags);
            }
            this.inputVisible = false;
            this.inputValue = '';
        },
        handleBlur() {
            this.inputVisible = false;
        },
        isValid(val) {
            let fval = parseFloat(val);
            if (!fval || fval < 0 || fval > 1) {
                this.$message.error("请输入在 (0, 1] 范围内的概率");
                return false;
            }
            if (this.dynamicTags.indexOf(fval) > -1) {
                this.$message.error("已存在概率：" + val);
                return false;
            }
            return true
        }
    },
    watch: {
        value(value) {
            this.dynamicTags = value;
        }
    }
})


Vue.component('kris-num-input-range', {
    template: `
    <div class="el-tools-item">
        <span class="el-tools-item-head">{{title}}</span>
        <el-input v-model="from" class="el-tools-item-tag" placeholder="1" size="medium"
            @keyup.enter.native="handleInputConfirm"></el-input>
        <span style="line-height: 40px;margin: 0 10px;">-</span>
        <el-input v-model="to" class="el-tools-item-tag" placeholder="10" size="medium"
            @keyup.enter.native="handleInputConfirm"></el-input>
    </div>
    `,
    props: {
        title: String,
        value: Array,
        min: {
            default: -Infinity,
            type: Number
        },
        max: {
            default: Infinity,
            type: Number
        }
    },
    data() {
        return {
            from: this.value[0],
            to: this.value[1],
        }
    },
    methods: {
        handleInputConfirm() {
            if (this.isValid(this.from) && this.isValid(this.to)) {
                this.from = parseInt(this.from);
                this.to = parseInt(this.to);
                this.tryEmit();
            }
        },
        isValid(val) {
            let ival = parseInt(val);
            if ((!ival && ival != 0) || ival < this.min || ival > this.max) {
                this.$message.error("输入应在范围 " + this.fmtRange() + " 内");
                return false;
            }
            return true
        },
        fmtRange() {
            return "[" + (this.min === -Infinity ? "-∞" : this.min) + ", " + (this.max === Infinity ? "+∞" : this.max) + "]"
        },
        tryEmit() {
            if (this.from <= this.to) {
                this.$emit('input', [this.from, this.to]);
            }
            else
                this.$message.error("起点应该小于终点");
        }
    },
    watch: {
        value(value) {
            this.from = value[0];
            this.to = value[1];
        }
    }
})

Vue.component('kris-num-input-double', {
    template: `
    <div class="el-tools-item">
        <span class="el-tools-item-head">{{title}}</span>
        <span class="el-tools-item-head">{{names[0]}}</span>
        <el-input v-model="from" class="el-tools-item-tag" placeholder="0" size="medium"
            @keyup.enter.native="handleInputConfirm"></el-input>
        <span class="el-tools-item-head">{{names[1]}}</span>
        <el-input v-model="to" class="el-tools-item-tag" placeholder="1" size="medium"
            @keyup.enter.native="handleInputConfirm"></el-input>
    </div>
    `,
    props: {
        title: String,
        names: Array,
        value: Array
    },
    data() {
        return {
            from: this.value[0],
            to: this.value[1],
        }
    },
    methods: {
        handleInputConfirm() {
            if (this.isValid(this.from) && this.isValid(this.to)) {
                this.from = parseFloat(this.from);
                this.to = parseFloat(this.to);
                this.$emit('input', [this.from, this.to]);
            }
        },
        isValid(val) {
            let ival = parseFloat(val);
            if (!ival && ival != 0) {
                this.$message.error("输入不合法");
                return false;
            }
            return true
        }
    },
    watch: {
        value(value) {
            this.from = value[0];
            this.to = value[1];
        }
    }
})