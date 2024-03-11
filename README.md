# Retro Racer
  [![project-languages-used](https://img.shields.io/github/languages/count/ChrisKurz098/NASAteroids?color=important)](https://github.com/ChrisKurz098/racer)
  [![project-top-language](https://img.shields.io/github/languages/top/ChrisKurz098/NASAteroids?color=blueviolet)](https://github.com/ChrisKurz098/racer)  
<img width="407" alt="image" src="https://user-images.githubusercontent.com/90714216/177853724-f883b7a2-72ec-4f08-8069-da783de1bf24.png">

## Description  
This is a retro arcade style racer in the vein of Pol Position. Race against a CPU player on 4 different tracks!
## [Check out the current build!]([https://chriskurz098.github.io/racer/](https://billgonzo123.github.io/racer/))

## Features
- Day to Night cycle
- Personal scores saved locally
- Competitive AI
- 4 unique tracks

## Controls  
| Key(s) | Action |  
| :-------------: | :-------------:  
| Left/Right Arrows | Turn Left or Right |  
| Z/X | Accelerate and Break respectively |  

## Engine Details
The inspiration behind this project was to build something that worked like a retro game engine. To me, this means tile based or pixel rasterization; I chose the ladder.  Unfortunately, calculating each pixel individually has some serious performance drawbacks, especially in an interpreted language like JS. To overcome these performance limitations I did 3 things:

- Extracted the pixel data as a one-dimensional array to prevent rendering to canvas more than once a frame
- Utilized a web worker to calculate pixel data for half of the screen
- Precalculated Math heavy pixel data

The result is an engine that runs at least 10 times faster than it would without utilizing these performance improvements. The rendering resolution could be set much higher, but I opted for a very low resolution of just 160x100, both for the retro pixelated aesthetic as well as ensuring decent performance on older smartphones. In addition, I render the cars, signs and the traffic light as bitmap images rendered on top of the rasterized image to save on performance and code complexity.

This game engine is based off  [OneLoneCoders](https://github.com/OneLoneCoder) command prompt game "Console Racer", which was originally written in C++. 



## License
  ![](https://img.shields.io/badge/license-MIT-blue)
