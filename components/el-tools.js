/**
 * el-tools.js v1.1.0
 * @author Kris Huang
 * @wechat IsKrisHuang
 * 
 * 对 element-ui 控件的二层封装
 */

Vue.component('kris-color-picker', {
    template: `
        <div style="padding: 5px 0;">
            <span style="line-height: 40px;"> {{title}}： </span>
            <span style="line-height: 40px;" v-bind:style="'color: ' + color"> {{color}} </span>
            <el-color-picker style="float: right" v-model="color" @change="colorChanged"/>
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