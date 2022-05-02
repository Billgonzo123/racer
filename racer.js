
let keysPressed = [];
let carDistance = 0;
let speed = 0;
let currentCurve = 0;
let trackCurve = 0;
let playerCurve = 0;
let lap = 1;

// set track sections [curvatrue, dist]
const trackArray = [
    [0, 100],
    [0, 20000],
    [1, 20000],
    [0, 20000],
    [-1, 20000],
    [-0.5, 20000],
    [0.5, 20000],
    [0, 50000],
];
function draw() {
    const canvas = document.getElementById('game-window');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        const w = 160;
        const h = 100;
        loop(ctx, w, h)
        setTimeout(() => {
            draw();
        }, 16.667)


    }
}

draw();

function loop(ctx, w, h) {
    if (keysPressed.includes('w')) {
        speed += 0.25;
    } else {
      speed -= 0.17 ;
    }
    if (keysPressed.includes('s')) {
        speed -= 1;
    }
    if(keysPressed.includes('a') && speed > 0) playerCurve -= (.015);
    if(keysPressed.includes('d') && speed > 0) playerCurve += (.015);

    //if you are outside the track, force slow down
    if (Math.abs(playerCurve-trackCurve) >= 0.75) speed -= 1;

    //set speed limits
    if (speed<0) speed=0;
    if (speed>140) speed=140;
    //keep track of how far car has traveled
    carDistance += speed;
    //keep track of where we are on the track
    let offSet = 0;
    let trackSection = 0;
    //find the current track section based off the car distance
    //will result in trackSection-1 being the desired index
    while (trackSection < trackArray.length && offSet <= carDistance) {
        offSet += trackArray[trackSection][1];
        trackSection++;
    }
    if (trackSection === trackArray.length && carDistance > offSet) {
        carDistance = 0;
        lap++;
    }
    //find the target track curve after finding trackSection index
    const targetCurve = trackArray[trackSection - 1][0];
    const curveDiff = (targetCurve - currentCurve) * (speed/14000);
    currentCurve += curveDiff;

    //change this float to adjust how hard the car is pushed in the opposite direction of the curve
    trackCurve += currentCurve * (.00022*(speed));
    

    // console.log('Lap: ', lap);
    // console.log('Curve: ', trackCurve);
    // console.log('Section: ', trackSection-1);
    // console.log('Speed: ', speed);
    // console.log('Distance: ', carDistance/140000);
    // console.log('OffSet: ', offSet/140000);
  
    //draw track
    for (y = 0; y < h / 2; y++) {
        for (let x = 0; x < w; x++) {
            const perspective = y / (h / 2);
            // grass color
            const grassColor = (Math.sin(20 * Math.pow(1 - perspective, 3) + carDistance * .01) > 0) ? 'green' : 'darkgreen';
            const clipColor = (Math.sin(40 * Math.pow(1 - perspective, 2) + carDistance * .02) > 0) ? 'red' : 'white';
            let color = 'red';
            const midPoint = 0.5+currentCurve * Math.pow(1 - perspective, 3);
            let roadWidth = 0.1 + perspective * 0.8;
            const clipWidth = roadWidth * 0.15;
            //get half of road width. makes calculations easier for symetrical track
            roadWidth *= 0.5;
            const leftGrass = (midPoint - roadWidth - clipWidth) * w;
            const leftClip = (midPoint - roadWidth) * w;
            const rightGrass = (midPoint + roadWidth + clipWidth) * w;
            const rightClip = (midPoint + roadWidth) * w;
            if (x >= 0 && x < leftGrass) color = grassColor;
            if (x >= leftGrass && x < leftClip) color = clipColor;
            if (x >= leftClip && x < rightClip) color = (carDistance<1000 && y<10+carDistance*.07 && y>0+carDistance*.07 ) ? 'white':'grey';
            if (x >= rightClip && x < rightGrass) color = clipColor;
            if (x >= rightGrass && x < w) color = grassColor;
            const row = (h / 2) + y;
            ctx.fillStyle = color;
            ctx.fillRect(x, row, 1, 1);
        }
    }

    //
    const carPosH =  playerCurve-trackCurve;
    const carX = (w / 2) + ((w*carPosH)/2) - 4;
    const carY = h - 20;
    //draw car
    ctx.fillStyle = 'blue';
    ctx.fillRect(carX, carY, 8, 10);
}

/////////////Key inputs///////////////////
const logKeyDown = (e) => {
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