<template>
  <div class="s-canvas" @click="refreshCode">
    <canvas
        ref="canvasRef"
        :width="contentWidth"
        :height="contentHeight"
    ></canvas>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch, withDefaults, defineProps, defineEmits} from "vue";

// 定义props类型
interface CodeProps {
  /** 默认验证码 */
  defaultCode?: string;
  /** 容器宽度 */
  contentWidth?: number;
  /** 容器高度 */
  contentHeight?: number;
  /** 最大干扰线，0时无干扰线 */
  maxLine?: number;
  /** 最大干扰点，0时无干扰点 */
  maxDot?: number;
  /** 字体最小值 */
  fontSizeMin?: number;
  /** 字体最大值 */
  fontSizeMax?: number;
}

// props默认值
const props = withDefaults(defineProps<CodeProps>(), {
  defaultCode: '',
  contentWidth: 112,
  contentHeight: 40,
  fontSizeMin: 25,
  fontSizeMax: 35,
  maxLine: 5,
  maxDot: 20,
});

const emit = defineEmits(["update:modelValue"]);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// 生成一个随机数
const randomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min)
}

// 生成一个随机的颜色
const randomColor = (min: number, max: number) => {
  let r = randomNum(min, max)
  let g = randomNum(min, max)
  let b = randomNum(min, max)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

// 生成验证码
const makeCode = (len = 4) => {
  let code = "";
  const codeLength = len;
  const identifyCodes = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  for (let i = 0; i < codeLength; i++) {
    code += identifyCodes[randomNum(0, identifyCodes.length)];
  }
  return code;
};

const verifyCode = ref('');

// 绘制图片
const drawPic = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.textBaseline = 'bottom';
  // 绘制背景
  ctx.fillStyle = randomColor(220, 255);
  ctx.fillRect(0, 0, props.contentWidth, props.contentHeight);
  // 绘制文字
  for (let i = 0; i < verifyCode.value.length; i++) {
    drawText(ctx, verifyCode.value[i], i);
  }
  drawLine(ctx);
  drawDot(ctx);
}

const drawText = (ctx: CanvasRenderingContext2D, txt: string, i: number) => {
  ctx.fillStyle = randomColor(50, 160); // 随机生成字体颜色
  ctx.font = randomNum(props.fontSizeMin, props.fontSizeMax) + 'px SimHei'; // 随机生成字体大小
  let x = (i + 1) * (props.contentWidth / (verifyCode.value.length + 1));
  let y = randomNum(props.fontSizeMax, props.contentHeight - 5);
  var deg = randomNum(-30, 30);
  // 修改坐标原点和旋转角度
  ctx.translate(x, y);
  ctx.rotate(deg * Math.PI / 180);
  ctx.fillText(txt, 0, 0);
  // 恢复坐标原点和旋转角度
  ctx.rotate(-deg * Math.PI / 180);
  ctx.translate(-x, -y);
}

const drawLine = (ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < props.maxLine; i++) {
    ctx.strokeStyle = randomColor(100, 200);
    ctx.beginPath();
    ctx.moveTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight));
    ctx.lineTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight));
    ctx.stroke();
  }
}

const drawDot = (ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < props.maxDot; i++) {
    ctx.fillStyle = randomColor(0, 255);
    ctx.beginPath();
    ctx.arc(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight), 1, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// 刷新验证码
const refreshCode = () => {
  verifyCode.value = makeCode();
  emit("update:modelValue", verifyCode.value);
}

onMounted(() => {
  refreshCode();
});

watch(verifyCode, () => {
  drawPic();
});

</script>

<style scoped>
.s-canvas {
  cursor: pointer;
  border-radius: 5px;
}
</style>
