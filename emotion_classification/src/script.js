// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");
let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let calibrateWebcamButton;
let webcamRunning = false;
let webcamCalibrating = false;
var blendsDictionaryNeutral = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
var blendsDictionarySmile = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
var calibrationFramesNeutral = 0;
var calibrationFramesSmile = 0;
var calibrationPhase = "smile";
const videoWidth = 480;
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
async function createFaceLandmarker() {
    const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
    });
    demosSection.classList.remove("invisible");
}
createFaceLandmarker();
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
    calibrateWebcamButton = document.getElementById("calibrateButton");
    calibrateWebcamButton.addEventListener("click", calibrateCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!faceLandmarker) {
        console.log("Wait! faceLandmarker not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
function calibrateCam(event) {
    if (!faceLandmarker) {
        console.log("Wait! faceLandmarker not loaded yet.");
        return;
    }
    if (webcamCalibrating === true && calibrationPhase === "smile") {
        webcamCalibrating = false;
        calibrateWebcamButton.innerText = "START CALIBRATING";
        calibrationPhase = "smile";
    }
    else {
        if (calibrationPhase === "smile"){
            calibrateWebcamButton.innerText = "CURRENTLY NEUTRAL, CLICK TO CALIBRATE SMILE";
            blendsDictionaryNeutral = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
            calibrationPhase = "neutral";
            calibrationFramesNeutral = 0;
        } else if (calibrationPhase === "neutral") {
            calibrateWebcamButton.innerText = "CURRENTLY SMILE, CLICK TO STOP CALIBRATION";
            blendsDictionarySmile = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
            calibrationPhase = "smile"
            calibrationFramesSmile = 0;
        }   
        webcamCalibrating = true;
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", storeCalibrations);
    });
}
let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

async function predictWebcam() {
    const radio = video.videoHeight / video.videoWidth;
    video.style.width = videoWidth + "px";
    video.style.height = videoWidth * radio + "px";
    canvasElement.style.width = videoWidth + "px";
    canvasElement.style.height = videoWidth * radio + "px";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await faceLandmarker.setOptions({ runningMode: runningMode });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
    if (results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
        }
    }
    // drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
    drawPredictionOutput(videoBlendShapes, results.faceBlendshapes);
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

async function storeCalibrations() {
    const radio = video.videoHeight / video.videoWidth;
    video.style.width = videoWidth + "px";
    video.style.height = videoWidth * radio + "px";
    canvasElement.style.width = videoWidth + "px";
    canvasElement.style.height = videoWidth * radio + "px";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await faceLandmarker.setOptions({ runningMode: runningMode });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
    if (results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
        }
    }

    var blendShapes = results.faceBlendshapes;
    for (var key in blendShapes[0].categories) {
        var blendName = blendShapes[0].categories[key].categoryName;
        var blendScore = blendShapes[0].categories[key].score;
        if (calibrationPhase === "neutral"){
            if (blendName in blendsDictionaryNeutral) {
                blendsDictionaryNeutral[blendName] += blendScore;
            }
            calibrationFramesNeutral += 1;
        }
        else if (calibrationPhase === "smile"){
            if (blendName in blendsDictionarySmile) {
                blendsDictionarySmile[blendName] += blendScore;
            }
            calibrationFramesSmile += 1;
        }
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamCalibrating === true) {
        window.requestAnimationFrame(storeCalibrations);
    }
}

function drawPredictionOutput(el, blendShapes) {
    // If no blendshapes or no calibration has been done
    if (!blendShapes.length) {
        return;
    }
    if ((blendsDictionaryNeutral.hasOwnProperty("mouthPressLeft") && blendsDictionaryNeutral["mouthPressLeft"] === 0) 
    || (blendsDictionarySmile.hasOwnProperty("mouthPressLeft") && blendsDictionarySmile["mouthPressLeft"] === 0)) {
        let htmlMaker = `
        <li class="blend-shapes-item">
            <span class="blend-shapes-label">Calibrate first!</span>
        </li>
        `;
        el.innerHTML = htmlMaker;
        return;
    }

    // Calculate the spectrum between the neutral and smile state
    // Take the difference between the average of the Smile and Neutral calibration frames
    // And divide the blendscore by this
    var blendFactors = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
    for (var key in blendShapes[0].categories) {
        var blendName = blendShapes[0].categories[key].categoryName;
        var blendScore = blendShapes[0].categories[key].score;
        if (blendName in blendFactors) {
            blendFactors[blendName] += blendScore / ((blendsDictionarySmile[blendName] / calibrationFramesSmile) - (blendsDictionaryNeutral[blendName] / calibrationFramesNeutral));
        }
    }
    console.log(blendFactors)
    // Calculate the difference in factor between the neutral state and the current state
    // Prediction only on neutral calibration
    // var blendFactors = {"mouthPressLeft":0, "mouthPressRight":0, "mouthSmileLeft":0, "mouthSmileRight":0};
    // for (var key in blendShapes[0].categories) {
    //     var blendName = blendShapes[0].categories[key].categoryName;
    //     var blendScore = blendShapes[0].categories[key].score;
    //     if (blendName in blendFactors) {
    //         blendFactors[blendName] += blendScore / (blendsDictionaryNeutral[blendName] / calibrationFrames);
    //     }
    // }

    let htmlMaker = ""
    // Draw the separate values for the relevant blends
    // for (var key in blendFactors){
    //     htmlMaker += `
    //         <li class="blend-shapes-item">
    //             <span class="blend-shapes-label">${key}</span>
    //             <span class="blend-shapes-value" style="width: calc(${+blendFactors[key] * 100}% - 120px)">${(+blendFactors[key]).toFixed(4)}</span>
    //         </li>
    //     `;
    // }

    // Calculate the mood and degree
    // var mood;
    // var mouthPressFactor = (blendFactors["mouthPressLeft"] + blendFactors["mouthPressRight"]) / 4
    // if (mouthPressFactor > 1) {
    //     mood = "slight smile";
    // } else {
    //     mood = "no smile";
    // }
    
    // var mouthSmileFactor = (blendFactors["mouthSmileLeft"] + blendFactors["mouthSmileRight"]) / 250
    // if (mouthSmileFactor > 1) {
    //     mood = "big smile";
    // }

    // htmlMaker += `
    //     <li class="blend-shapes-item">
    //         <span class="blend-shapes-label">mouthPressFactor</span>
    //         <span class="blend-shapes-value">${(+mouthPressFactor).toFixed(4)}</span>
    //     </li>
    // `;
    // htmlMaker += `
    //     <li class="blend-shapes-item">
    //         <span class="blend-shapes-label">mouthSmileFactor</span>
    //         <span class="blend-shapes-value">${(+mouthSmileFactor).toFixed(4)}</span>
    //     </li>
    // `;

    // var smile_degree;
    // if (mouthSmileFactor < 1) {
    //     if (mouthPressFactor < 1) {
    //         smile_degree = 0;
    //     } else if (mouthPressFactor < 2) {
    //         smile_degree = 1;
    //     } else if (mouthPressFactor >= 2) {
    //         smile_degree = 2;
    //     }
    // } else if (mouthSmileFactor < 2) {
    //     smile_degree = 3;
    // } else if (mouthSmileFactor >= 2) {
    //     smile_degree = 4;
    // }

    // Neutral and smile
    for (var key in blendsDictionaryNeutral){
        htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">${key}</span>
                <span class="blend-shapes-value" style="width: calc(${+blendsDictionaryNeutral[key] / calibrationFramesNeutral * 10000}% - 120px)">${(+blendsDictionaryNeutral[key] / calibrationFramesNeutral).toFixed(4)}</span>
            </li>
        `;
    }

    for (var key in blendsDictionarySmile){
        htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">${key}</span>
                <span class="blend-shapes-value" style="width: calc(${+blendsDictionarySmile[key] / calibrationFramesSmile * 10000}% - 120px)">${(+blendsDictionarySmile[key] / calibrationFramesSmile).toFixed(4)}</span>
            </li>
        `;
    }

    htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">=======</span>
            </li>
        `;

    for (var key in blendFactors){
        htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">${key}</span>
                <span class="blend-shapes-value" style="width: calc(${+blendFactors[key] * 100}% - 120px)">${(+blendFactors[key]).toFixed(4)}</span>
            </li>
        `;
    }

    htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">=======</span>
            </li>
        `;

    for (var key in blendShapes[0].categories) {
        var blendName = blendShapes[0].categories[key].categoryName;
        var blendScore = blendShapes[0].categories[key].score;
        if (blendName === "mouthSmileLeft" || blendName === "mouthSmileRight") {
            htmlMaker += `
                <li class="blend-shapes-item">
                    <span class="blend-shapes-label">${blendName}</span>
                    <span class="blend-shapes-value" style="width: calc(${+blendScore * 100}% - 120px)">${(+blendScore).toFixed(4)}</span>
                </li>
            `;
        }
    }

    htmlMaker += `
            <li class="blend-shapes-item">
                <span class="blend-shapes-label">=======</span>
            </li>
        `;

    var smile_degree = ((blendFactors["mouthSmileLeft"] + blendFactors["mouthSmileRight"]) / 200);
    if (smile_degree > 1){
        smile_degree = 1;
    } else if (smile_degree < 0){
        smile_degree = 0;
    }
    
    htmlMaker += `
        <li class="blend-shapes-item">
            <span class="blend-shapes-label">Smile degree</span>
            <span class="blend-shapes-value">${smile_degree}</span>
        </li>
    `;

    // htmlMaker += `
    //     <li class="blend-shapes-item">
    //         <span class="blend-shapes-label">${mood}</span>
    //         <span class="blend-shapes-value">${smile_degree}</span>
    //     </li>
    // `;

    // htmlMaker += `
    //     <li class="blend-shapes-item">
    //         <span class="blend-shapes-label">Extra info</span>
    //         <span class="blend-shapes-value">${mouthSmileFactor}</span>
    //     </li>
    // `;

    el.innerHTML = htmlMaker; 
}