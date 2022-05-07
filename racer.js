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


// create Oscillator(s) node
// Engine 
const engSnd = audioCtx.createOscillator();
engSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
engSnd.type = 'square';
const engGain = audioCtx.createGain();
engGain.gain.value = .4;
engSnd.connect(engGain);
engGain.connect(audioCtx.destination);

engSnd.start();
// Tire skreach
const tireSnd = audioCtx.createOscillator();
tireSnd.frequency.setValueAtTime(0, audioCtx.currentTime); // value in hertz
tireSnd.type = 'sine';
const tireGain = audioCtx.createGain();
tireGain.gain.value = 1;
tireSnd.connect(tireGain);
tireGain.connect(audioCtx.destination);
tireSnd.start()

//---lap list element---//
const lapEl = document.getElementById('lapTimes');
let newLapTime = 0;
let lapAcc = 0;
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
let position = 2;
let carX = 0;
let carY = 0;
let carD = 0; //direction -1 0 1
let acc = 0;

let CPUy = 0;
let CPUx = -20; //Between -50 and 50. 0 is center track
let CPUp = 0; //CPU H-Position
let CPUcurve = CPUx / 35
let CPUd = 1590; //cpu distance -must have this offset for some reason
let CPUtd = 0; //CPU
let CPUspeed = 1;
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
// set track sections [curvatrue, dist]
const trackArray = [
    [0, 30000],
    [.5, 20000],
    [0, 5000],
    [-1, 20000],
    [0.5, 20000],
    [1.5, 10000],
    [0, 90000],
    [-.9, 12000],
    [1, 15000],
    [0, 30000],

];
//get total length of track
let trackLength = 0;
for (let i = 0; i < trackArray.length; i++) {
    trackLength += trackArray[i][1];
}

function run() {
    const canvas = document.getElementById('game-window');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d', { alpha: false });
        w = canvas.width;
        h = canvas.height;
        mid = h / 2;
        imageData = ctx.createImageData(w, h)
        window.requestAnimationFrame(loop)
    }
}

function loop() {
    setInterval(() => {
        //console.log(keysPressed)
        let carPosH = (playerCurve - trackCurve);
        var time = Date.now();
        seconds = ((time - initTime) / 1000);
        frame++;
        //frame rate counter and timer
        if (time - startTime > 1000) {
            //console.clear();
            //console.log('FPS:', (frame / ((time - startTime) / 1000)).toFixed(1));
            startTime = time;
            frame = 0;
        }
        //--------------------------//
        //   Pre-draw calculations  //
        //--------------------------//

        if (keysPressed.includes('z')) {
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
            speed += acc;

        } else {
            speed -= 0.2;
        }
        CPUspeed += CPUacc - Math.abs(currentCurve / 10)

        if (keysPressed.includes('x')) {
            speed -= 1;
            if (speed > 188) {
                tireGain.gain.value = .3;
                speed -= 5;
            }
        }
        //init car direction
        carD = 0;
        if (keysPressed.includes('arrowleft') && speed > 0) {
            carD = -1;
            playerCurve -= (.015);
            if (Math.abs(targetCurve - currentCurve) > .2 && speed > 160) tireGain.gain.value = .3;
        } else {
            if (!keysPressed.includes('arrowright') && !keysPressed.includes('x')) {
                tireGain.gain.value = 0;
            }
        }

        if (keysPressed.includes('arrowright') && speed > 0) {
            carD = 1;
            playerCurve += (.015);
            if (Math.abs(targetCurve - currentCurve) > .2 && speed > 160) tireGain.gain.value = .3;
        } else {
            if (!keysPressed.includes('arrowleft') && !keysPressed.includes('x')) {
                tireGain.gain.value = 0;
            }
        }

        if (Math.abs(targetCurve - currentCurve) < .2 || speed <= 160) {
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
        let CPUoffset = 0;
        let CPUtrackSection = 0;
        while (CPUtrackSection < trackArray.length && CPUoffset <= CPUd) {
            CPUoffset += trackArray[CPUtrackSection][1];
            CPUtrackSection++;
        }
        //find the target track curve for CPU after fi
        let CPUtargetCurve = trackArray[CPUtrackSection - 1][0];
        CPUspeed -= Math.abs(CPUtargetCurve/7);//slow CPU down on curvs


        //if you cross the finish line
        if (trackSection === trackArray.length && carDistance > offSet) {
            const lapTime = document.createElement('li');
            newLapTime = seconds - lapAcc;
            lapAcc += newLapTime;
            lapEl.appendChild(lapTime);
            lapTime.textContent = `Lap ${lap}: ${Math.round(1000 * newLapTime) / 1000}s`;
            carDistance = 0;
            lap++;
        }
        //find the target track curve after finding trackSection index
        targetCurve = trackArray[trackSection - 1][0];
        const curveDiff = (targetCurve - currentCurve) * (speed / 14000);
        currentCurve += curveDiff;



        //change this float to adjust how hard the car is pushed in the opposite direction of the curve
        trackCurve += currentCurve * (.00019 * (speed));

        //car positions

        carW = 36;
        carM = (carW / 2) - 1
        carX = (w / 2) + ((w * carPosH) / 2) - carM;
        carY = h - 20;


        //--------------------------//
        //      Begin Draw          //
        //--------------------------//
        for (y = mid; y < h; y++) {

            // make track calculations
            dk = (seconds < 160) ? seconds : 160;//to darken color over time
            const gY = y * 2;//to create a gradient color
            const perspective = (y - mid) / (mid);

            const midPoint = 0.5 + currentCurve * Math.pow(1 - perspective, 3);
            let roadWidth = 0.1 + perspective * 0.8;
            const clipWidth = roadWidth * 0.15;

            //create a color variable
            let color = [255, 0, 0];
            const startLine = Math.pow(1 - perspective, 2) + ((trackLength - carDistance) * .02);
            const CPU = Math.pow(1 - perspective, 2) + ((CPUd - carDistance) * .02)//this is how we make CPU players appear  
            //get half of road width. makes calculations easier for symetrical track
            roadWidth *= 0.5;
            const leftGrass = (midPoint - roadWidth - clipWidth) * w;
            const leftClip = (midPoint - roadWidth) * w;
            const rightGrass = (midPoint + roadWidth + clipWidth) * w;
            const rightClip = (midPoint + roadWidth) * w;

            for (let x = 0; x < w; x++) {
                //--------------------------//
                ///Draw  Top (hills and sky)//
                //--------------------------//
                const hillHeight = Math.floor(Math.abs(Math.sin(x * 0.01 + trackCurve) * 16.0));
                const pixelindexTop = (((y - (mid)) * w + x) * 4);//Find RGBA pixel index for imageData
                let colorB = (y > (h) - hillHeight) ? [55 - y * perspective - (dk / 5), 155 - y * perspective - (dk / 5), 55 - y * perspective - (dk / 10)] : [100 + (y * 2) - dk, 100 - dk, 255 - dk];
                //hill border color
                if (y === (h) - hillHeight) colorB =
                    [245 - dk / 1.6, 130 - dk, 230 - dk / 1.3];
                //[-80 + gY*2 * perspective + dk / 4,  -50 + gY * perspective - dk / 6, -80 + gY*2 * perspective + dk / 4];
                //-------Set Pixel Data-------//
                imageData.data[pixelindexTop] = colorB[0];     // Red
                imageData.data[pixelindexTop + 1] = colorB[1]; // Green
                imageData.data[pixelindexTop + 2] = colorB[2];  // Blue
                imageData.data[pixelindexTop + 3] = 255;   // Alpha


                //--------------------------//
                //       Draw Bottom        //
                //--------------------------//
                const pixelindex = (y * w + x) * 4; //find RGBA pixel index for imageData

                //create head lights
                let circleBound = Math.sqrt(Math.pow(x - (carX + (carD * 11) + carM - 1), 2) + Math.pow(y - carY, 2));
                if (y > carY - 6 + (Math.abs(carD) * 4)) circleBound = circleBound * perspective + 15.5 - (Math.abs(carD * 3));

                const l = (dk > 60 && y < carY + 3 && 31 - (Math.abs(carD)) > circleBound) ? dk : 0;

                // Grass color
                const grassColor = (Math.sin(20 * Math.pow(1 - perspective, 3) + carDistance * .008) > 0) ?
                    [0, 10 + gY - dk + l, 0] : [0, 50 + gY - dk + l, 0];

                // clip color
                const clipColor = (Math.sin(40 * Math.pow(1 - perspective, 2) + carDistance * .02) > 0) ?
                    [80 + gY - dk + l, 0, 0] : [80 + gY - dk + l, 80 + gY - dk + l, 80 + gY - dk + l];

                //----Road Color----//
                if (x >= leftClip && x < rightClip) color = (y < 100 - startLine + (20 * perspective) && y > 100 - startLine)
                    ? [255, 255, 255] : [(gY - dk + l), (gY - dk + l), (gY - dk + l)];

                //----Determine if pixel is not road----//
                //----Set color based on this data-----//
                if (x >= 0 && x < leftGrass) color = grassColor;
                if (x >= leftGrass && x < leftClip) color = clipColor;
                if (x >= rightClip && x < rightGrass) color = clipColor;
                if (x >= rightGrass && x < w) color = grassColor;

                //--------CPU x,y coord-----------//
                if (y === Math.round(100 - CPU + (20 * perspective))) {
                    CPUy = y;
                    let scale = Math.pow(CPUy, 2 + (CPUy / 70)) / 1000000;
                    if (CPUy >= 80) {
                        //CPUp -= CPUx*((y-80))
                        CPUp = w / 2;

                    } else {

                        CPUp = ((w) / 2) + (((currentCurve) * (w))) - (scale * currentCurve * w)
                    }




                }

                //--------Set Pixel Data---------//
                imageData.data[pixelindex] = color[0]      // Red
                imageData.data[pixelindex + 1] = color[1]  // Green
                imageData.data[pixelindex + 2] = color[2]   // Blue
                imageData.data[pixelindex + 3] = 255;   // Alpha

            }

        }

        //--------------------------//
        //   Render Entire Image    //
        //--------------------------//
        ctx.putImageData(imageData, 0, 0);
        //-------------------------//
        //----Calculate CPU scale and speed-------//
        //------------------------//
        if (CPUd >= trackLength) CPUd = 0;
        CPUd += Math.round(1000 * CPUspeed) / 1000; //Add current track distance
        CPUtd += Math.round(1000 * CPUspeed) / 1000; //add to total distance CPU
        let newMax = maxSpd;
        if (CPUtd < totalDistance) {
            position = 1;
        } else {
            position = 2;
            //if (CPUspeed> newMax) CPUspeed-=.4
        }
        //newMax -= Math.abs(currentCurve*90)
        //if (CPUtd-totalDistance>25000 ) CPUspeed = 0;
        //if(newMax<maxSpd) newMax = maxSpd;

        //if (CPUspeed < newMax) CPUspeed += .4


        switch (true) {
            case (CPUspeed < 45):
                CPUacc = .41;
                break;
            case (CPUspeed >= 45 && CPUspeed < 80):
                CPUacc = .355;
                break;
            case (CPUspeed >= 80 && CPUspeed < 121):
                CPUacc = .27;
                break;
            case (CPUspeed >= 121 && CPUspeed < 181):
                CPUacc = .22;
                break;
            case (CPUspeed >= 181 && CPUspeed < 210):
                CPUacc = .165;
                break;
            case (CPUspeed >= 210 && CPUspeed < 219):
                CPUacc = .11;
                break;
            case (CPUspeed >= 219 && CPUspeed < 255):
                CPUacc = .085;
                break;
            case (CPUspeed >= 255):
                CPUacc = 0;
                break;
            default:
                CPUacc = .25
        }

        //CPUspeed += CPUacc-Math.abs(currentCurve/1000);
        const scale = Math.pow(CPUy, 2 + (CPUy / 70)) / 1000000
        console.log(CPUd)

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
        ctx.fillStyle = '#00000055';
        ctx.fillRect(0,1,160,2)
        ctx.fillRect(0,4,160,2)
        ctx.fillStyle = "blue";
        ctx.fillRect(Math.round((carDistance/trackLength)*160),1,4,2)
        ctx.fillStyle = "red";
        ctx.fillRect(Math.round(((CPUd-1590)/trackLength)*160),4,4,2)
        



        //--------------------------//
        //        Draw Hud          //
        //--------------------------//

        hudEl.innerHTML = `Lap: ${lap} 
        Time: ${Math.round(seconds)} sec
        Speed: ${Math.round(speed)} mph
        Pos: ${position}${(position === 1) ? "st" : "nd"}`
        //end loop
        //loop();
        //window.requestAnimationFrame(loop);
        //----------------------//
        //--------Sounds--------//
        //----------------------//
        const gear = (speed >= 181) ? (speed / 1064) : acc;
        engSnd.frequency.setValueAtTime(speed * (3 * gear), audioCtx.currentTime); // value in hertz
        const tireFeq = (Math.floor(carDistance) % 2)
        tireSnd.frequency.setValueAtTime(920 + (50 * tireFeq), audioCtx.currentTime)

    }, 16.667)

}

/////////////Key inputs///////////////////
const logKeyDown = (e) => {

    audioCtx.resume();//must resume audio context with user input
    if (!keysPressed.includes(e.key)) keysPressed = [...keysPressed, e.key.toLowerCase()];
    //console.log(keysPressed)
};

const logKeyUp = (e) => {
    const newKeys = keysPressed.filter((key) => key !== e.key.toLowerCase());
    if (newKeys !== keysPressed) keysPressed = newKeys;
    //console.log(keysPressed)
};

document.addEventListener("keyup", logKeyUp);
document.addEventListener("keydown", logKeyDown);

run();


