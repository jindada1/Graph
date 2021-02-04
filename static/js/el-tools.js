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
            <el-slider v-model="sliderValue" :min="1" :max="100" @input="sliderValueChanging" :show-tooltip="false">
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
                this.$message.error("请输入在 [0, 1] 范围内的概率");
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
            @keyup.enter.native="handleInputConfirmFrom"></el-input>
        <span style="line-height: 40px;margin: 0 10px;">-</span>
        <el-input v-model="to" class="el-tools-item-tag" placeholder="10" size="medium"
            @keyup.enter.native="handleInputConfirmTo"></el-input>
    </div>
    `,
    props: {
        title: String,
        value: Array,
    },
    data() {
        return {
            from: this.value[0],
            to: this.value[1],
        }
    },
    methods: {
        handleInputConfirmFrom() {
            let inputValue = this.from;
            if (this.isValid(inputValue)) {
                this.from = parseInt(inputValue);
                this.tryEmit();
            }
        },
        handleInputConfirmTo() {
            let inputValue = this.to;
            if (this.isValid(inputValue)) {
                this.to = parseInt(inputValue);
                this.tryEmit();
            }
        },
        isValid(val) {
            let ival = parseInt(val);
            if (!ival || ival < 1) {
                this.$message.error("请输入大于 0 的自然数");
                return false;
            }
            return true
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