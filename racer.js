

function draw() {
    const canvas = document.getElementById('game-window');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        const w = 160;
        const h = 100;
        setInterval(() => {
            loop(ctx, w, h)
        }, 200)


    }
}

draw();

function loop(ctx, w, h) {

    //draw road
    for (y = 0; y < h/2 ; y++) {
        for (let x = 0; x < w; x++) {
            const perspective = y/(h/2);
            let color = 'red';
            const midPoint = 0.5;
            let roadWidth = 0.1 + perspective * 0.8;
            const clipWidth = roadWidth * 0.15;
            roadWidth *= 0.5;
            const leftGrass = (midPoint - roadWidth - clipWidth) * w;
            const leftClip = (midPoint - roadWidth) * w;
            const rightGrass = (midPoint + roadWidth + clipWidth) * w;
            const rightClip = (midPoint + roadWidth) * w;
            if (x >= 0 && x < leftGrass) color = 'green';
            if (x >= leftGrass && x < leftClip) color = 'red';
            if (x >= leftClip && x < rightClip) color = 'grey';
            if (x >= rightClip && x < rightGrass) color = 'red';
            if (x >= rightGrass && x < w) color = 'green';
            const row = (h/2) + y;
            ctx.fillStyle = color;
            ctx.fillRect(x, row, 1, 1);
        }
    }

    //draw car
    const carX = (w / 2) - 4;
    const carY = h-20;
    ctx.fillStyle = 'blue';
    ctx.fillRect(carX, carY, 8, 10);
}
