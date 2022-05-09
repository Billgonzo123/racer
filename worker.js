
self.onmessage = (message) => {
 
    let { halfImage, w, h, mid, seconds, currentCurve, carDistance, trackLength, carD, carX, carY,  carM } = message.data
    let color = [255,0,0]
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

        const perspectivePow = Math.pow(1 - perspective, 2);
        const grassSpace = Math.sin(20 * perspectivePow + carDistance * .008)
        const clipSpace = Math.sin(40 * perspectivePow + carDistance * .02);

        const startLine = perspectivePow + ((trackLength - carDistance) * .02);
        //get half of road width. makes calculations easier for symetrical track
        roadWidth *= 0.5;
        const leftGrass = (midPoint - roadWidth - clipWidth) * w;
        const leftClip = (midPoint - roadWidth) * w;
        const rightGrass = (midPoint + roadWidth + clipWidth) * w;
        const rightClip = (midPoint + roadWidth) * w;


        for (let x = 0; x < w; x++) {
            //--------------------------//
            //       Draw Bottom        //
            //--------------------------//
            const pixelindex = ((y-mid) * w + x) * 4; //find RGBA pixel index for imageData

            //create head lights
            let circleBound = Math.sqrt(Math.pow(x - (carX + (carD * 11) + carM - 1), 2) + Math.pow(y - carY, 2));
            if (y > carY - 6 + (Math.abs(carD) * 4)) circleBound = circleBound * perspective + 15.5 - (Math.abs(carD * 3));

            const l = (dk > 60 && y < carY + 3 && 31 - (Math.abs(carD)) > circleBound) ? dk : 0;

            // Grass color
            const grassColor = (grassSpace > 0) ?
                [0, 10 + gY - dk + l, 0] : [0, 50 + gY - dk + l, 0];

            // clip color
            const clipColor = (clipSpace > 0) ?
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

            
            //--------Set Pixel Data---------//
            halfImage[pixelindex] = color[0]      // Red
            halfImage[pixelindex + 1] = color[1]  // Green
            halfImage[pixelindex + 2] = color[2]   // Blue
            halfImage[pixelindex + 3] = 255;   // Alpha
        }
    }
    postMessage(halfImage)
}

