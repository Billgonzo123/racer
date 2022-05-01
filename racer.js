
let keysPressed = [];
let carDistance = 0;
let speed = 0;
function draw() {
    const canvas = document.getElementById('game-window');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        const w = 160;
        const h = 100;
        setInterval(() => {
            loop(ctx, w, h)
        }, 16.667)


    }
}

draw();

function loop(ctx, w, h) {
    if (keysPressed.includes('w'))  {
        (speed < 100) ? speed += 0.25 : speed  = 100;
    } else {
        (speed>0) ? speed -= 0.15 : speed = 0;
    }

    if (keysPressed.includes('s'))  {
        (speed>0) ? speed -- : speed = 0;
    }
    carDistance += speed;
    //draw road
    for (y = 0; y < h / 2; y++) {
        for (let x = 0; x < w; x++) {
            const perspective = y / (h / 2);
            // grass color
            const grassColor = (Math.sin(20 * Math.pow(1 - perspective, 3) + carDistance * .01) > 0) ? 'green' : 'darkgreen';
            const clipColor = (Math.sin(40 * Math.pow(1 - perspective, 2) + carDistance * .02) > 0) ? 'red' : 'white';
            let color = 'red';
            const midPoint = 0.5;
            let roadWidth = 0.1 + perspective * 0.8;
            const clipWidth = roadWidth * 0.15;
            roadWidth *= 0.5;
            const leftGrass = (midPoint - roadWidth - clipWidth) * w;
            const leftClip = (midPoint - roadWidth) * w;
            const rightGrass = (midPoint + roadWidth + clipWidth) * w;
            const rightClip = (midPoint + roadWidth) * w;
            if (x >= 0 && x < leftGrass) color = grassColor;
            if (x >= leftGrass && x < leftClip) color = clipColor;
            if (x >= leftClip && x < rightClip) color = 'grey';
            if (x >= rightClip && x < rightGrass) color = clipColor;
            if (x >= rightGrass && x < w) color = grassColor;
            const row = (h / 2) + y;
            ctx.fillStyle = color;
            ctx.fillRect(x, row, 1, 1);
        }
    }

    //draw car
    const carX = (w / 2) - 4;
    const carY = h - 20;
    ctx.fillStyle = 'blue';
    ctx.fillRect(carX, carY, 8, 10);
}

/////////////Key inputs///////////////////
const logKeyDown = (e) => {
    if (!keysPressed.includes(e.key)) keysPressed = [...keysPressed, e.key.toLowerCase()];
    console.log(keysPressed)
};

const logKeyUp = (e) => {
    const newKeys = keysPressed.filter((key) => key !== e.key.toLowerCase());
    if (newKeys !== keysPressed) keysPressed = newKeys;
    console.log(keysPressed)
};

document.addEventListener("keyup", logKeyUp);
document.addEventListener("keydown", logKeyDown);