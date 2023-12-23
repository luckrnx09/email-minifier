<template>
    <h2 class="title">EmailMinifier Playground</h2>
    <p class="document">See document at 
        <a class="github" href="https://github.com/luckrnx09/email-minifier">Github</a>
    </p>
    <div class="area-container">
        <div>
            <div class="text-area">
                <p>Original Email HTML<span v-if="origin?.length>0"> - {{(origin.length/1024).toFixed(2)}}kb</span></p>
                <textarea v-model="origin" placeholder="Put in your mail."></textarea>
            </div>
            <div class="html-area">
                <p>Original Email Preview</p>
                <section v-html="origin"></section>
            </div>
        </div>
        <div>
            <button @click="clickToMinified" :disabled="buttonStatus >= 2">
                <span v-show="buttonStatus === 1">Minify Email</span>
                <span v-show="buttonStatus === 2">Processing</span>
                <span v-show="buttonStatus === 3">Complete</span>
                <span v-show="buttonStatus === 4">Failed</span>
            </button>
            <p :show="warning" :style="{ visibility: warning ? 'visible' : 'hidden' }">Please input your email.</p>
        </div>
        <div>
            <div class="text-area">
                <div class="text-area-title">
                    <p>Minified Email HTML<span v-if="minified?.length>0"> - {{(minified.length/1024).toFixed(2)}}kb</span></p>
                    <div v-if="false">
                        <span>Compress: </span>
                        <div class="progress"></div>
                        <span>20%</span>
                    </div>
                </div>
                <textarea v-model="minified" readonly></textarea>
            </div>
            <div class="html-area">
                <p>Minified Email Preview</p>
                <section v-html="minified"></section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { EmailMinifier } from 'email-minifier';

const buttonStatus = ref(1);
const origin = ref("")
const minified = ref("")
const warning = ref(false)

const clickToMinified = async () => {
    if (buttonStatus.value >= 3) {
        buttonStatus.value = 1
    } else {
        if (!origin.value) {
            warning.value = true
            buttonStatus.value = 4
            setTimeout(() => {
                buttonStatus.value = 1
                warning.value = false
            }, 3000)
        } else {
            buttonStatus.value += 1
            const result = await new EmailMinifier(origin.value).minify()
            console.log(result);
            if (result.minified) {
                minified.value = result.minified
                buttonStatus.value += 1
                setTimeout(() => {
                    buttonStatus.value = 1
                }, 3000)
            } else {
                buttonStatus.value = 4
                setTimeout(() => {
                    buttonStatus.value = 1
                }, 3000)
            }
        }
    }
}

watch(origin, () => {
    minified.value = '';
});

</script>

<style scoped>

.title{
    font-size: 32px;
    text-align: center;
    margin: 20px;
}

.document{
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
    padding: 24px;
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

.area-container textarea,
.area-container section {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 8px;
    box-shadow: hwb(0 0% 100% / 0.05) 0px 0px 0px 1px;
    overflow-y: auto;
    box-sizing: border-box;
}

.area-container textarea::-webkit-scrollbar,
.area-container section::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.area-container textarea::-webkit-scrollbar {
    text-align: justify;
}

.area-container textarea::-webkit-scrollbar-thumb,
.area-container section::-webkit-scrollbar {
    border-radius: 3px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    background-color: hwb(0 76% 24% / 0.5);
}

.area-container textarea:hover::-webkit-scrollbar-thumb,
.area-container section::-webkit-scrollbar {
    background-color: hwb(0 76% 24% / 0.8);
    cursor: default;
}

.area-container textarea::-webkit-scrollbar-track,
.area-container section::-webkit-scrollbar {
    background-color: transparent;
}

.area-container textarea {
    resize: none;
    border: none;
    oultline: none;
}

.area-container textarea:focus {
    outline-color: hwb(0 0% 100% / 0.2);
}

.area-container .text-area,
.area-container .html-area {
    flex: 1;
    display: flex;
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

.area-container .text-area-title .progress {
    width: 18em;
    height: 8px;
    background-color: hwb(0 9% 13% / 0.05);
    border-radius: 4px;
    position: relative;
}

.area-container .text-area-title .progress::after {
    content: '';
    display: block;
    width: 80%;
    height: 8px;
    background-color: hsl(101, 63%, 60%);
    background: repeating-linear-gradient(-45deg, hwb(145 18% 20%) 25%, hwb(145 15% 32%) 0, hwb(145 15% 32%) 50%,
            hwb(145 18% 20%) 0, hwb(145 18% 20%) 75%, hwb(145 15% 32%) 0);
    background-size: 16px 16px;
    border-radius: 4px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
}

button {
    flex-shrink: 0;
    width: 12em;
    height: 3em;
    border: none;
    background: transparent;
    border-radius: 4px;
    position: relative;
}

button span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    background: hwb(192 93% 5%);
    transition: all 0.2s;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
    border-radius: 4px;
}

button span::before {
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

@keyframes panoramic {
    to {
        background-position: 200% 0;
    }
}

button span:nth-of-type(1) {
    cursor: pointer;
}

button span:nth-of-type(1):hover::before {
    width: 100%;
    background: hwb(204 20% 14%);
}

button span:nth-of-type(2) {
    color: #fff;
    background: repeating-linear-gradient(-45deg, hwb(204 20% 14%) 25%, hwb(204 16% 27%) 0, hwb(204 16% 27%) 50%,
            hwb(204 20% 14%) 0, hwb(204 20% 14%) 75%, hwb(204 16% 27%) 0);
    background-size: 16px 16px;
    animation: panoramic 20s linear infinite;
    cursor: no-drop;
}

button span:nth-of-type(3) {
    color: #fff;
    background: hwb(145 18% 20%);
}

button span:nth-of-type(4) {
    color: #fff;
    background: hwb(6 24% 9%);
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

@keyframes btn_botton {
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

button span:nth-of-type(3):before,
button span:nth-of-type(3):after {
    content: "";
    width: 140%;
    height: 100%;
    position: absolute;
    left: -20%;
    z-index: 3;
    background-repeat: no-repeat;
    display: none;
}

button span:nth-of-type(3):before {
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

button span:nth-of-type(3):after {
    display: block;
    animation: btn_botton 1s 1 forwards;
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

button:hover span {
    color: #fff;
}

button:hover::before {
    width: 100%;
}

@media screen and (max-width: 1366px) {
    .area-container>div {
        flex-direction: column;
    }

    .area-container .text-area,
    .area-container .html-area {
        height: 50%;
    }
}
</style>