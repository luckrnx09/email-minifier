<template>
    <h2 class="title">EmailMinifier Playground</h2>
    <p class="document">See document at
        <a class="github" href="https://github.com/luckrnx09/email-minifier">Github</a>
    </p>
    <div class="area-container">
        <div>
            <div class="text-area">
                <p>Original Email HTML<span v-if="origin?.length > 0"> - {{ (origin.length / 1024).toFixed(2) }}kb</span>
                </p>
                <Codemirror ref="originRef" v-model:value="origin" :options="orgOptions" border
                    placeholder="Paste your email here." />

            </div>
            <div class="html-area">
                <p>Original Email Preview</p>
                <section v-html="origin"></section>
            </div>
        </div>
        <div>
            <div class="btns">
                <button @click="clickToMinified" :disabled="buttonStatus >= 2">
                    <span v-show="buttonStatus === 1">Minify Email</span>
                    <span v-show="buttonStatus === 2">Compressing</span>
                    <span v-show="buttonStatus === 3">Complete</span>
                    <span v-show="buttonStatus === 4">Failed</span>
                </button>
                <button v-if="origin" @click="clearContent"><span>Clear</span></button>
            </div>
            <p :show="warning" :style="{ visibility: warning ? 'visible' : 'hidden' }">Please paste your email.</p>
        </div>
        <div>
            <div class="text-area">
                <div class="text-area-title">
                    <p>Minified Email HTML<span v-if="minified?.length > 0"> - {{ (minified.length / 1024).toFixed(2) }}kb</span>
                    </p>
                </div>
            <Codemirror ref="minifiedRef" v-model:value="minified" :options="minOptions" border
                    placeholder="Minified in your mail." />
            </div>
            <div class="html-area">
                <p>Minified Email Preview</p>
                <section v-html="minified"></section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref, Ref, watch } from "vue";
import { EmailMinifier } from 'email-minifier';

import Codemirror, { CmComponentRef } from "codemirror-editor-vue3"
import "codemirror/mode/htmlmixed/htmlmixed.js"
import "codemirror/addon/scroll/simplescrollbars.js";
import 'codemirror/addon/scroll/simplescrollbars.css'

const CodemirrorNormalOptions = reactive({
    mode: "text/html",
    lineWrapping: true,
    scrollbarStyle: "simple",
    lineNumbers: false
})

const originRef = ref<CmComponentRef>()
const orgOptions = reactive(CodemirrorNormalOptions)

const minifiedRef = ref<CmComponentRef>()
const minOptions = reactive({ ...CodemirrorNormalOptions, readOnly: true })

const buttonStatus = ref(1);
const origin = ref("");
const minified = ref("");
const warning = ref(false);
const clickToMinified = async () => {
    if (buttonStatus.value >= 3) {
        buttonStatus.value = 1
    } else {
        if (!origin.value) {
            warning.value = true
            buttonStatus.value = 4
            buttonStatusControl(1)
        } else {
            buttonStatus.value += 1
            const result = await new EmailMinifier(origin.value).minify()
            console.log(result);
            if (result.minified) {
                minified.value = result.minified
                buttonStatus.value += 1
                buttonStatusControl(1)
            } else {
                buttonStatus.value = 4
                buttonStatusControl(1)
            }
        }
    }
}

const timer: Ref<number | null> = ref(null);
const buttonStatusControl = (val: number) => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = window.setTimeout(() => {
        buttonStatus.value = val;
        warning.value = false;
    }, 3000)
}
const clearTimer = () => {
    if (timer.value) {
        clearTimeout(timer.value);
        timer.value = null;
    }
}

const clearContent = () => {
    origin.value = "";
    minified.value = "";
}

watch(origin, () => {
    minified.value = '';
});

onUnmounted(() => {
    clearTimer();
})
</script>

<style scoped>
.title {
    font-size: 32px;
    text-align: center;
    margin: 20px;
}

.document {
    text-align: center;
    margin-bottom: 14px;
}

.area-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    height: 100%;
    padding: 48px 24px;
    box-sizing: border-box;
    font-size: 14px;
    color: #333;
}

.area-container>div {
    display: flex;
    gap: 18px;
    width: 100%;
    height: 45%;
}

.area-container>div:nth-of-type(2) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    height: auto;
}

@keyframes flashing {
    0%,
    40%,
    80% {
        color: #333;
    }

    20%,
    60%,
    100% {
        color: #e84e3d;
    }
}

.area-container>div:nth-of-type(2) p {
    font-size: 12px;
    font-weight: bold;
}

.area-container>div:nth-of-type(2) p[show="true"] {
    animation: flashing 1s ease-in-out forwards;
}

.area-container .Codemirror,
.area-container section {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 8px;
    box-shadow: hwb(0 0% 100% / 0.05) 0px 0px 0px 1px;
    overflow-y: auto;
    box-sizing: border-box;
}

.area-container .Codemirror::-webkit-scrollbar,
.area-container section::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.area-container .Codemirror::-webkit-scrollbar {
    text-align: justify;
}

.area-container .Codemirror::-webkit-scrollbar-thumb,
.area-container section::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: hwb(0 76% 24% / 0.5);
}

.area-container .Codemirror:hover::-webkit-scrollbar-thumb,
.area-container section:hover::-webkit-scrollbar-thumb {
    background-color: hwb(0 76% 24% / 0.8);
}

.area-container .Codemirror::-webkit-scrollbar-track,
.area-container section::-webkit-scrollbar {
    background-color: transparent;
}

.area-container .Codemirror {
    resize: none;
    border: none;
}

.area-container .Codemirror:focus {
    outline-color: hwb(0 0% 100% / 0.1);
}

.area-container .text-area,
.area-container .html-area {
    flex: 1;
    display: flex;
    width: 48%;
    flex-direction: column;
    gap: 8px;
}

.area-container .text-area-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.area-container .text-area-title>div {
    display: flex;
    align-items: center;
    gap: 18px;
}


.area-container .btns {
    display: flex;
    align-items: center;
    gap: 18px;
}

.area-container .btns button {
    flex-shrink: 0;
    width: 12em;
    height: 3em;
    border: none;
    background: transparent;
    border-radius: 4px;
    position: relative;
}

.area-container .btns button span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    background: hwb(204 20% 14% / 0.1);
    transition: all 0.2s;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    cursor: pointer;
}

.area-container .btns button span::before {
    content: "";
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0%;
    height: 100%;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    transition: all 0.2s;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    border-radius: 4px;
}

.area-container .btns button:nth-of-type(2) span::before {
    left: unset;
    right: 0;
}

@keyframes panoramic {
    to {
        background-position: 200% 0;
    }
}

.area-container .btns button:hover span:nth-of-type(1)::before {
    width: 100%;
    background: hwb(204 20% 14%);
}

.area-container .btns button span:nth-of-type(2) {
    color: #fff;
    background: repeating-linear-gradient(-45deg, hwb(204 20% 14%) 25%, hwb(204 16% 27%) 0, hwb(204 16% 27%) 50%,
            hwb(204 20% 14%) 0, hwb(204 20% 14%) 75%, hwb(204 16% 27%) 0);
    background-size: 16px 16px;
    animation: panoramic 20s linear infinite;
    cursor: no-drop;
}

.area-container .btns button span:nth-of-type(3) {
    color: #fff;
    background: hwb(145 18% 20%);
    cursor: no-drop;
}

.area-container .btns button span:nth-of-type(4) {
    color: #fff;
    background: hwb(6 24% 9%);
    cursor: no-drop;
}


@keyframes btn_top {
    0% {
        background-position: 5% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%, 55% 90%, 70% 90%;
    }

    50% {
        background-position: 0% 80%, 20% 0%, 30% 30%, 22% 50%, 50% 50%, 65% 20%, 90% 30%;
    }

    100% {
        background-position: 0% 70%, 20% -10%, 30% 20%, 22% 40%, 50% 40%, 65% 10%, 90% 20%;
        background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
    }
}

@keyframes btn_bottom {
    0% {
        background-position: 10% -10%, 30% 10%, 55% -10%, 70% -10%, 85% -10%, 70% -10%, 70% 0%;
    }

    50% {
        background-position: 0% 80%, 20% 80%, 45% 60%, 60% 100%, 75% 70%, 95% 60%, 105% 0%;
    }

    100% {
        background-position: 0% 90%, 20% 90%, 45% 70%, 60% 110%, 75% 80%, 95% 70%, 110% 10%;
        background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
    }
}

.area-container .btns button span:nth-of-type(3):before,
.area-container .btns button span:nth-of-type(3):after {
    content: "";
    width: 140%;
    height: 100%;
    position: absolute;
    left: -20%;
    z-index: 3;
    background-repeat: no-repeat;
    display: none;
}

.area-container .btns button span:nth-of-type(3):before {
    display: block;
    animation: btn_top 1s 1 forwards;
    top: -50%;
    background-image: radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, transparent 10%, #ff0081 15%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%);
    background-size: 10% 10%, 20% 20%, 18% 18%, 10% 10%, 15% 15%, 10% 10%, 18% 18%;
}

.area-container .btns button span:nth-of-type(3):after {
    display: block;
    animation: btn_bottom 1s 1 forwards;
    bottom: -50%;
    background-image: radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, transparent 10%, #ff0081 15%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%),
        radial-gradient(circle, #ff0081 20%, transparent 20%);
    background-size: 15% 15%, 20% 20%, 18% 18%, 20% 20%, 15% 15%, 10% 10%, 20% 20%;
}

.area-container .btns button:hover span {
    color: #fff;
}

.area-container .btns button:hover::before {
    width: 100%;
}

.area-container .btns button:nth-of-type(2) span {
    background: hwb(210 20% 63% / 0.1);
}

.area-container .btns button:nth-of-type(2):hover span::before {
    background: hwb(210 20% 63%);
}

@media screen and (max-width: 1366px) {
    .area-container>div {
        flex-direction: column;
    }

    .area-container .text-area,
    .area-container .html-area {
        width: 100%;
        height: 50%;
    }
}</style>
