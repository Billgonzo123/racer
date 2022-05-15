 const generateTrack = () => {
    //random length- Minimum 10 segmnets
    const sections = 10 + Math.floor(Math.random()* 30);
    const newTrack = [[0,30000]];
    let curve

    for (let i = 0; i < sections; i++) {
        const direction = (Math.random()<.5) ? 1 : -1;
        curve = (newTrack[i][0] > .5) ? 0 : Math.random()*direction ;

        if (Math.abs(curve) < .1) curve = 0;
       const minLength = (curve>.5) ? 1 : 15;
       const length = (minLength + Math.floor(Math.random()* 30))*1000;
       newTrack.push([curve, length]);
    }
    //add stright strip at end
    newTrack.push([0, 30000]);
    console.log(newTrack)
    return newTrack;
}

const tracks = [
    [
        [0, 30000],
        [.5, 20000],
        [0, 5000],
        [-1, 20000],
        [0.5, 20000],
        [1.2, 10000],
        [0, 90000],
        [-.9, 12000],
        [1, 15000],
        [0, 30000],
    
    ],
    [
        [0, 30000],
        [.5, 20000],
        [0.6, 5000],
        [0, 20000],
        [-1, 10000],
        [0, 90000],
        [-.9, 15000],
        [.5, 19000],
        [.1, 19000],
        [0, 10000],
        [-1, 16000],
        [0, 30000],
    
    ],
    [
        [0, 50000],
        [.2, 20000],
        [.6, 20000],
        [1.2, 7000],
        [0, 5000],
        [-1, 30000],
        [0.1, 20000],
        [2, 13000],
        [0, 90000],
        [-.9, 12000],
        [1, 15000],
        [-1, 17000],
        [0, 50000],
    
    ],
    [
        [0, 60000],
        [-.5, 20000],
        [0, 5000],
        [.8, 22000],
        [0.5, 20000],
        [1.5, 10000],
        [0, 90000],
        [-.9, 12000],
        [1, 15000],
        [-1, 15000],
        [1, 15000],
        [-1, 15000],
        [1, 20000],
        [0, 30000],
        [-1, 22000],
        [-1.2, 10000],
        [0, 30000],
    
    ]

]
