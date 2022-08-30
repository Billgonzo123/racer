
// create web audio api context
let audioCtx
try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
}
catch (e) {
    alert('Web Audio API is not supported in this browser');
}

const worker = new Worker("worker.js");; //webworker

let screenSize = window.innerWidth;
const init_scale = (window.innerWidth) / (1920);
document.getElementById('game-container').style.transform = `scale(${init_scale})`;


// create Oscillator(s) node
// Engine 
var biquadFilter = audioCtx.createBiquadFilter();
biquadFilter.type = "highpass";
biquadFilter.frequency.value = 80;

biquadFilter.connect(audioCtx.destination)

const engSnd = audioCtx.createOscillator();
engSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
engSnd.type = 'triangle';
const engGain = audioCtx.createGain();
engGain.gain.value = .6;
engSnd.connect(engGain);
engGain.connect(biquadFilter);
engSnd.start();
// CpuEngine 
const CPUSnd = audioCtx.createOscillator();
CPUSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
CPUSnd.type = 'triangle';
const CPUGain = audioCtx.createGain();
CPUGain.gain.value = .2;
CPUSnd.connect(CPUGain);
CPUGain.connect(biquadFilter);
CPUSnd.start();

// Tire skreach
const tireSnd = audioCtx.createOscillator();
tireSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
tireSnd.type = 'sine';
const tireGain = audioCtx.createGain();
tireGain.gain.value = .3;
tireSnd.connect(tireGain);
tireGain.connect(audioCtx.destination);
tireSnd.start()

//---lap list element---//
const lapEl = document.getElementById('lapTimes');
let newLapTime = 0;
let lapAcc = 0;
let hold = 400;
//---------Game Vars--------//
let keysPressed = [];
let carDistance = 0;
let totalDistance = 0;
let speed = 0;
let currentCurve = 0;
let trackCurve = 0;
let targetCurve = 0;
let playerCurve = .2;
let lap = 1;
const laps = 3;
let position = 2;
let carX = 0;
let carY = 0;
let carD = 0; //direction -1 0 1
let acc = 0;
let scale = 0;

let CPUy = 0;
let CPUx = -20; //Between -50 and 50. 0 is center track
let CPUp = 0; //CPU H-Position
let CPUcurve = CPUx / 35
let CPUd = 1587; //cpu distance -must have this offset for some reason
let CPUtd = 0; //CPU
let CPUspeed = 0;
let CPUacc = 0;
let maxSpd = 160;
let CPUlap = 0;

const rightImg = new Image();
rightImg.src = './img/right.png';
const leftImg = new Image();
leftImg.src = './img/left.png';
const upImage = new Image();
upImage.src = './img/up.png';
const CPUImage = new Image();
CPUImage.src = './img/CPU_1.png';
let turnSign = new Image(); //turn sign
//create a color variable
let color = [255, 0, 0];

let img = upImage;
const myFont = new FontFace('myFont', 'url(./tiny.ttf)');
const hudEl = document.getElementById('hudStats');
let ctx = 0;
let w = 0;
let h = 0;
let mid = 50
let imageData = 0;
let seconds = 0;
let dk = 0; //day\night effect
var startTime = Date.now();
let initTime = Date.now();
var frame = 0;
let halfImage = [];

let hillArray = [];
if (localStorage.getItem("currentTrack") === null) {
    localStorage.setItem('currentTrack', 0);
}
if (localStorage.getItem("racingStats") === null) {
    localStorage.setItem('racingStats', JSON.stringify([]));
}
let currentTrack = localStorage.getItem("currentTrack");

// Get track sections from current track
const trackArray = tracks[currentTrack];

//will hold current track length
let trackLength = 0;


function run() {
    const canvas = document.getElementById('game-window');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d', { alpha: false });
        ctx.imageSmoothingEnabled = false;
        w = canvas.width;
        h = canvas.height;
        mid = h / 2;
        //preCalculate hills 
        for (let i = 0; i < 10000; i++) {
            let hillY = 0;
            if (currentTrack % 2) {
                hillY = Math.floor(Math.abs(Math.sin(i * 0.01) * 16.0));
            } else {
                hillY = Math.floor(Math.abs(Math.sin(i * 0.01) * Math.sin(i * 0.02) * 30.0))
            }

            hillArray.push(hillY)

        }
  
        imageData = ctx.createImageData(w, h)

        const half = 32000;

        const imgArray = Array.from(imageData.data);
        halfImage = imgArray.splice(-half)
        //convert the array back to Uint8ClampedArray
        //doing so hear has HUGe performance gains in Chrome
        halfImage = new Uint8ClampedArray(halfImage)
        //if on filan lap run endGameScreen loop
        if (localStorage.getItem("currentTrack") > tracks.length - 1) {
            window.requestAnimationFrame(endGameScreen)
        } else {
            //get total length of track
            for (let i = 0; i < trackArray.length; i++) {
                trackLength += trackArray[i][1];
            }
            window.requestAnimationFrame(loop)
        }
    }
}

function loop() {
    const gameLoop = setInterval(() => {
        //check screen size
        if (screenSize !== window.innerWidth) {
            screenSize = window.innerWidth;
            const new_scale = (window.innerWidth) / (1920);
            document.getElementById('game-container').style.transform = `scale(${new_scale})`;

        }

   
        let carPosH = (playerCurve - trackCurve);
        var time = Date.now();
        if (hold > 100) initTime = Date.now();
        seconds = ((time - initTime) / 1000);
        frame++;
        //frame rate counter and timer
        if (time - startTime > 1000) {
            startTime = time;
            frame = 0;
        }
        //--------------------------//
        //   Pre-draw calculations  //
        //--------------------------//

        //-----------------------------------------//
        //keep track of the section of track we are on
        //----------------------------------------//
        let offSet = 0;
        let trackSection = 0;
        //find the current track section based off the car distance
        //will result in trackSection-1 being the desired index
        while (trackSection < trackArray.length && offSet <= carDistance) {
            offSet += trackArray[trackSection][1];
            trackSection++;
        }
        //set turn sign sprite based off next turn
        const curTurn = trackArray[trackSection - 1][0];
        const curLength = trackArray[trackSection - 1][1]


        switch (trackSection < trackArray.length) {
            case (curTurn > 0 && curTurn < .5):
                turnSign.src = './img/softRight.png'
                break;
            case (curTurn < 0 && curTurn > -.5):
                turnSign.src = './img/softLeft.png'
                break;

            case (curTurn >= .5 && curTurn <= 1 && curLength < 20000):
                turnSign.src = './img/softRight.png'
                break;
            case (curTurn <= -.5 && curTurn >= -1 && curLength < 20000):
                turnSign.src = './img/softLeft.png'
                break;

            case (curTurn >= .5 && curTurn <= 1 && curLength >= 20000):
                turnSign.src = './img/hardRight.png'
                break;
            case (curTurn <= -.5 && curTurn >= -1 && curLength >= 20000):
                turnSign.src = './img/hardLeft.png'
                break;
            case (curTurn > 1):
                turnSign.src = './img/utrunRight.png'
                break;
            case (curTurn < -1):
                turnSign.src = './img/uturnLeft.png'
                break;


            default: turnSign.src = './img/blank.png'
        }

        //------Get CPU position on track-----------//
        let CPUoffset = 0;
        let CPUtrackSection = 0;
        while (CPUtrackSection < trackArray.length && CPUoffset <= CPUd) {
            CPUoffset += trackArray[CPUtrackSection][1];
            CPUtrackSection++;
        }
        //find the target track curve for CPU after fi
        let CPUtargetCurve = trackArray[CPUtrackSection - 1][0];
        if (CPUspeed > 190 && CPUtargetCurve <= 1) CPUspeed -= Math.abs(CPUtargetCurve / 2);//slow CPU down on curvs
        if (CPUspeed > 68 && CPUtargetCurve > 1) CPUspeed -= Math.abs(CPUtargetCurve * 2);//slow CPU down on curvs

        //if you cross the finish line
        //  speed=CPUspeed
        if (trackSection === trackArray.length && carDistance > offSet) {

            const lapTime = document.createElement('li');
            newLapTime = seconds - lapAcc;
            lapAcc += newLapTime;
            lapEl.appendChild(lapTime);
            lapTime.textContent = `Lap ${lap}: ${Math.round(1000 * newLapTime) / 1000}s`;
            carDistance = 0;
            //When you pass the finish line
            if (lap === laps) {
                lap = 0;
                const timesList = document.querySelectorAll('li');
                const timesArray = [...timesList];
                const times = timesArray.map(e => e.outerText);
                let stats = JSON.parse(localStorage.getItem('racingStats'));
                let data = {
                    position: position,
                    times: times
                }
                stats.push(data)
                localStorage.setItem('racingStats', JSON.stringify(stats));

                localStorage.setItem('currentTrack', parseInt(currentTrack) + 1);
                clearInterval(gameLoop)
                audioCtx.close();
                setTimeout(() => window.location.reload(), 4000)
            } else {
                lap++;
            }

        }
        //find the target track curve after finding trackSection index
        targetCurve = trackArray[trackSection - 1][0];
        const curveDiff = (targetCurve - currentCurve) * (speed / 14000);
        currentCurve += curveDiff;

        //change this float to adjust how hard the car is pushed in the opposite direction of the curve
        trackCurve += currentCurve * (.00019 * (speed));

        //--------------------------//
        //----------Inputs---------//
        //-------------------------//

        if (keysPressed.includes('z') || tpCache.includes('accBtn')) {
            switch (true) {
                case (speed < 45):
                    acc = .45;
                    break;
                case (speed >= 45 && speed < 80):
                    acc = .35;
                    break;
                case (speed >= 80 && speed < 121):
                    acc = .27;
                    break;
                case (speed >= 121 && speed < 181):
                    acc = .22;
                    break;
                case (speed >= 181 && speed < 210):
                    acc = .17;
                    break;
                case (speed >= 210 && speed < 219):
                    acc = .11;
                    break;
                case (speed >= 219 && speed < 255):
                    acc = .09;
                    break;
                case (speed >= 255):
                    acc = .02;
                    break;
                default:
                    acc = .25
            }
            if (hold < 100) speed += acc;

        } else {
            speed -= 0.1;
        }

        //accelerate CPU and lower acc on curves
        if (hold < 100) CPUspeed += CPUacc;

   

        if (keysPressed.includes('x') || tpCache.includes('breakBtn')) {
            speed -= 1;
            if (speed > 188) {
                tireGain.gain.value = .2;
                speed -= 5;
            }
        }
        //init car direction
        carD = 0;
        const c = Math.abs(targetCurve - currentCurve);
        if (keysPressed.includes('arrowleft') || tpCache.includes('leftBtn')) {
            if (speed > 0) {
                carD = -1;
                playerCurve -= (.015);
                if (c > .2 && speed > 160) tireGain.gain.value = .1;
            }
        } else {
            if (!keysPressed.includes('arrowright') && tpCache.includes('rightBtn') && !keysPressed.includes('x')) {
                tireGain.gain.value = 0;
            }
        }

        if (keysPressed.includes('arrowright') || tpCache.includes('rightBtn')) {
            if (speed > 0) {
                carD = 1;
                playerCurve += (.015);
                if (c > .2 && speed > 160) tireGain.gain.value = .1
            }
        } else {
            if (!keysPressed.includes('arrowleft') && tpCache.includes('leftBtn') && !keysPressed.includes('x')) {
                tireGain.gain.value = 0;
            }
        }

        if (c < .2 || speed <= 160) {
            if (!keysPressed.includes('x') || speed < 50) tireGain.gain.value = 0;
        }

        switch (carD) {
            case 0:
                img = upImage;
                break;
            case 1:
                img = rightImg;
                break;
            case -1:
                img = leftImg;
                break;
        }
        //----------------------------------------------//
        //if you are outside the track, force slow down //
        //----------------------------------------------//
        if (Math.abs(playerCurve - trackCurve) >= 0.55) speed -= .01 * speed;

        //set speed limits
        if (speed < 0) speed = 0;

        //keep track of how far car has traveled
        carDistance += speed;
        totalDistance += speed;


        //car positions

        carW = 36;
        carM = (carW / 2) - 1
        carX = (w / 2) + ((w * carPosH) / 2) - carM;
        carY = h - 20;


        //send web worker to work
        worker.postMessage({ halfImage, w, h, mid, seconds, currentCurve, carDistance, trackLength, carD, carX, carY, carM });

        //--------------------------//
        //      Begin Draw          //
        //--------------------------//
        for (y = mid; y < h; y++) {
            
            // make track calculations
            dk = (seconds < 250) ? seconds : 250;//to darken color over time

            const perspective = (y - mid) / (mid);

            const perspectivePow = Math.pow(1 - perspective, 2);

            const CPU = perspectivePow + ((CPUd - carDistance) * .02)//this is how we make CPU players appear  
            //--------CPU x,y coord-----------//
            if (y === Math.round(100 - CPU + (20 * perspective))) {
                CPUy = y;
                if (CPUy >= 80) {
                    //CPUp -= CPUx*((y-80)
                    CPUp = w / 2;
                } else {
                    CPUp = ((w) / 2) + (((currentCurve) * (w))) - (scale * currentCurve * w)
                }

            }

            for (let x = 0; x < w; x++) {
                //--------------------------//
                ///Draw  Top (hills and sky)//
                //--------------------------//
                hillHeight = hillArray[5000 + Math.round(x + 100 * trackCurve)]

                const pixelindexTop = (((y - (mid)) * w + x) * 4);//Find RGBA pixel index for imageData


                let colorB = (y > (h) - hillHeight) ? [55 - y * perspective - (dk / 5), 155 - y * perspective - (dk / 5), 55 - y * perspective - (dk / 10)] : [100 + (y * 2) - dk, 100 - dk, 255 - dk];
                //hill border color
                if (y === (h) - hillHeight) colorB =
                    [245 - dk / 1.2, 130 - dk, 230 - dk / 1.3];
                //[-80 + gY*2 * perspective + dk / 4,  -50 + gY * perspective - dk / 6, -80 + gY*2 * perspective + dk / 4];
                //-------Set Pixel Data-------//
                halfImage[pixelindexTop] = colorB[0];     // Red
                halfImage[pixelindexTop + 1] = colorB[1]; // Green
                halfImage[pixelindexTop + 2] = colorB[2];  // Blue
                halfImage[pixelindexTop + 3] = 255;   // Alpha

            }
        }

        //--------------------------//
        //   Render Entire Image    //
        //--------------------------//
        worker.onmessage = function (event) {

            imageData.data.set(halfImage);

            ctx.putImageData(imageData, 0, 1);
            imageData.data.set(event.data);

            ctx.putImageData(imageData, 0, mid);






            //-------------------------//
            //----Calculate CPU scale and speed-------//
            //------------------------//
            if (CPUd >= trackLength) CPUd = 0;
            const addSpd = Math.round(1000 * CPUspeed) / 1000;
            CPUd += addSpd; //Add current track distance
            CPUtd += addSpd; //add to total distance CPU
            if ((CPUtd - 1) < totalDistance) {
                position = 1;
            } else {
                position = 2;
            }


            switch (true) {
                case (CPUspeed < 45):
                    CPUacc = .45;
                    break;
                case (CPUspeed >= 45 && CPUspeed < 80):
                    CPUacc = .35;
                    break;
                case (CPUspeed >= 80 && CPUspeed < 121):
                    CPUacc = .27;
                    break;
                case (CPUspeed >= 121 && CPUspeed < 181):
                    CPUacc = .21;
                    break;
                case (CPUspeed >= 181 && CPUspeed < 210):
                    CPUacc = .17;
                    break;
                case (CPUspeed >= 210 && CPUspeed < 219):
                    CPUacc = .115;
                    break;
                case (CPUspeed >= 219 && CPUspeed < 255):
                    CPUacc = .1;
                    break;
                case (CPUspeed >= 255):
                    CPUacc = .0205;
                    break;
                default:
                    CPUacc = .25
            }

            //CPUspeed += CPUacc-Math.abs(currentCurve/1000);
            scale = Math.pow(CPUy, 2 + (CPUy / 70)) / 1000000


            //--------------------------//
            //   Calculate Car Pos      //
            //--------------------------//
            carX = Math.round(carX);
            carY = Math.round(carY);

            //--------------------------//
            //--Car & CPU Render functions--//
            CPUx = Math.round(CPUx);
            const renderPlyr = () => ctx.drawImage(img, carX, carY - 12)
            const renderCPU = () => { if (CPUy > 60 && CPUy < h - 2) ctx.drawImage(CPUImage, CPUp + (-17 + CPUx) * scale, CPUy - 12, 36 * scale, 24 * scale); }

            //-- which to render first--//
            if (CPUy < 80) {
                renderCPU();
                renderPlyr();
            } else {

                renderPlyr();
                renderCPU();
            }
            //draw relative car positions
            ctx.fillStyle = '#00000055';
            ctx.fillRect(0, 1, 160, 2)
            ctx.fillRect(0, 4, 160, 2)
            ctx.fillStyle = "blue";
            ctx.fillRect(Math.round((carDistance / trackLength) * 160), 1, 4, 2)
            ctx.fillStyle = "red";
            ctx.fillRect(Math.round(((CPUd - 1587) / trackLength) * 160), 4, 4, 2)

            //drawTurnSign
            ctx.drawImage(turnSign, w / 2 - 16, 10)

            if (!lap) {
                ctx.font = "12px tiny";
                ctx.fillText("Finish!", 45, 50);
            }
            if (hold > 0) {
                hold--;
                const image = new Image();
                let lightColor = '';
                switch (true) {
                    case (hold > 300): lightColor = './img/red.png'
                        break;
                    case (hold > 200): lightColor = './img/orange.png'
                        break;
                    case (hold > 100): lightColor = './img/yellow.png'
                        break;
                    case (hold > 0): lightColor = './img/green.png'
                        break;
                }

                image.src = lightColor;
                ctx.drawImage(image, w / 2 - 6, h / 2 - 16)
            }

            //--------------------------//
            //        Draw Hud          //
            //--------------------------//

            hudEl.innerHTML = `
            Track: ${parseInt(currentTrack) + 1} |
            Lap: ${lap}/${laps} |
            Pos: ${position}${(position === 1) ? "st" : "nd"} |
            Time: ${Math.round(seconds)}sec`
                + "<br /><br/>" +
                `Speed: ${Math.round(speed)}mph`

            //----------------------//
            //--------Sounds--------//
            //----------------------//
            const gear = (speed >= 181) ? (speed / 1064) : acc;
            engSnd.frequency.setValueAtTime((speed * 3 * gear), audioCtx.currentTime); // value in hertz

            const tireFeq = (Math.floor(carDistance) % 2)
            tireSnd.frequency.setValueAtTime(920 + (50 * tireFeq), audioCtx.currentTime)
            ///cpu sound
            const CPUdComp = CPUd - 1587;
            const CPUgear = (CPUspeed >= 181) ? (CPUspeed / 1064) : CPUacc;
            if ((CPUdComp - carDistance < 3000) && (CPUdComp - carDistance > -3000) && CPUspeed > 0) {
                CPUGain.gain.value = .3 - Math.abs((CPUdComp - carDistance) / 10000);
                CPUSnd.frequency.setValueAtTime(30 + (CPUspeed * 3 * CPUgear) - Math.abs((CPUdComp - carDistance) / 1000), audioCtx.currentTime); // value in hertz
            } else {
                CPUSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
            }

        };

    }, 1000 / 60)

}

//////////////------------------End Game Screen---------------/////////////
function endGameScreen() {
    const stats = JSON.parse(localStorage.getItem('racingStats'));
    const totalPos = stats.map(e => e.position);
    let finalRank = totalPos.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
    }, 0);
    finalRank = Math.round(finalRank / stats.length);
    const contEl = document.getElementById('controls')
    contEl.innerHTML = `Press "Z' to restart game!`
    hudEl.style = 'position: fixed; top: 5vh; overflow: auto; height:80%; width: 70%;'
    hudEl.innerHTML = `----------------- Rank: ${finalRank}${(finalRank === 1) ? "st" : "nd"} -----------------`
        + "<br />" +
        `${stats.map((e, i) => `<br/><br/>---------------------------<br/>Track: ${i + 1} - Finished: ${e.position}${(e.position === 1) ? "st" : "nd"} 
        ${e.times.map(t => `<br/><br/>${t}`)}`)}`

    setInterval(() => {
        if (keysPressed.includes('z') || tpCache.includes('accBtn')) {
            localStorage.setItem('racingStats', JSON.stringify([]));
            localStorage.setItem('currentTrack', 0);
            document.location.reload();

        }
    }, 16.667)
}

/////////////Key inputs///////////////////
const logKeyDown = (e) => {
    audioCtx.resume();//must resume audio context with user input
    if (!keysPressed.includes(e.key)) keysPressed = [...keysPressed, e.key.toLowerCase()];
};

const logKeyUp = (e) => {
    const newKeys = keysPressed.filter((key) => key !== e.key.toLowerCase());
    if (newKeys !== keysPressed) keysPressed = newKeys;
};


document.addEventListener("keyup", logKeyUp);
document.addEventListener("keydown", logKeyDown);

// Touch Point cache
let tpCache = [];
const mobileButtons = document.getElementById("mobile-buttons");
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    //is mobile
} else {
    mobileButtons.style.display = 'none';
    //not mobile
}


window.addEventListener('touchstart', function (event) {

    getTouch(event)
}, false);
window.addEventListener('touchmove', function (event) {

    //getTouch (event)
}, false);

window.addEventListener('touchend', function (event) {

    if (event.target.id==='FullScreen'){
        toggleFullscreen()
    } else {
    getTouch(event)
    }
}, false);

function getTouch(event) {
    audioCtx.resume();//must resume audio context with user input
    const e = event.touches;
    tpCache = [];
    for (let i = 0; i < event.touches.length; i++) {
        tpCache.push(e[i].target.id)
    }
}



run();


