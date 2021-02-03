/**
 * chart.js v1.0.0
 * (c) 2021 Kris Huang
 * Released under the MIT License.
 */


/**
 * init canvas for histogram
 *
 * @param {HTMLCanvasElement} canvas - The canvas to draw histogram on
 * @param {dict} conf - Configurations of histogram
 */
function histogram(canvasElement, conf) {
    /**
     * default settings
     */
    var config = {
        barColor: "lightgray",
        barStrokeColor: "black",
        height: 180,
        maxWidth: 200,
        maxBarWidth: 30,
        padx: 2,
        pady: 2
    }

    for (var key in conf) {
        config[key] = key in config ? conf[key] : config[key];
    }

    var canvas = canvasElement;
    var context = canvas.getContext("2d");

    var cWidth = config["maxWidth"];
    var cHeight = config["height"];
    var barWidth = config["maxBarWidth"];

    var heightPerValue = 1;

    function max(array) {
        if (array.length === 0) return null;
        let max = array[0];
        for (val of array)
            max = val > max ? val : max
        return max
    }

    function drawLine(fromX, fromY, toX, toY) {
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    }

    function init(data) {
        let barNum = data.datas.length;
        let innerWidth = cWidth - config["padx"] * 2;
        let innerHeight = cHeight - config["pady"] * 2;

        barWidth = parseInt(barNum * barWidth > innerWidth ? innerWidth / barNum : barWidth);
        innerWidth = parseInt(barNum * barWidth > innerWidth ? innerWidth : barWidth * barNum);
        cWidth = innerWidth + config["padx"] * 2;

        canvas.width = cWidth;
        canvas.height = cHeight;

        let maxValue = max(data.datas);
        heightPerValue = innerHeight / maxValue;
    }

    function drawAxis(data) {
        context.strokeStyle = config["barStrokeColor"];
        drawLine(config.padx, cHeight - config.pady, cWidth - config.padx, cHeight - config.pady)
        for (let i = 0; i < data.datas.length; i++) {
            let x = i * barWidth + barWidth / 2;
            drawLine(x, cHeight - config.pady, x, cHeight);
        }
    }

    function mapX(bar, value) {
        return config['padx'] + bar * barWidth;
    }

    function mapY(bar, value) {
        return cHeight - config['pady'] - mapH(value);
    }

    function mapH(value) {
        return parseInt(value * heightPerValue)
    }

    function drawBars(data) {
        context.fillStyle = config["barColor"];
        context.strokeStyle = config["barStrokeColor"];
        values = data.datas;

        for (let [i, value] of values.entries()) {
            let w = barWidth - 1
            let h = mapH(value)
            let y = mapY(i, value)
            let x = mapX(i, value)
            context.strokeRect(x, y, w, h)
            context.fillRect(x, y, w, h);
        }
    }

    return {
        draw: function (data) {
            init(data);
            drawAxis(data);
            drawBars(data);
        }
    }
}
