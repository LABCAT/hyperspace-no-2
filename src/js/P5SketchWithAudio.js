import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import AnimatedShape from './classes/AnimatedShape.js';

import audio from "../audio/hyperspace-no-2.ogg";
import midi from "../audio/hyperspace-no-2.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.tempo = 102;

        p.secondsPerBar = 60 / p.tempo * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[0].notes.filter(note => [36, 37].includes(note.midi)); // Redrum 1 - Dublab BrushKit3
                    const noteSet2 = result.tracks[4].notes; // Maelstrom 1 - Zerolizer
                    const noteSet3 = result.tracks[5].notes; // Maelstrom 2 - Wood Arp
                    const controlChanges = Object.assign({},result.tracks[7].controlChanges); // Filter 1 - Maelstrom 3 - 1FingerFun
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
                    p.scheduleCueSet(controlChanges[Object.keys(controlChanges)[0]], 'executeCueSet4');
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                    p.audioLoaded = true;
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.rotationOptions = [0, 15, 30, 45, 60, 75];

        p.currentRotation = 0;

        p.clockwiseRotation = true; 

        p.canRotate = false;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.grid = p.createGraphics(p.canvasWidth * 2, p.canvasWidth * 2);
            p.rectMode(p.CENTER);
            p.angleMode(p.DEGREES);
            p.grid.rectMode(p.CENTER);
            p.frameRate(30);
            p.strokeWeight(8);
            //glow
            p.drawingContext.shadowBlur = 32;
            p.drawingContext.shadowColor = '#00ffff';
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.clear();
                p.translate(p.width / 2, p.height / 2);
                p.rotate(p.currentRotation);
                p.image(p.grid, -p.width, -p.height);
                p.noFill();
                if(p.innerSquareColour){
                    p.stroke(p.innerSquareColour);
                    p.rect(0, 0, p.width / 16, p.width / 16);
                }
                for (let i = 0; i < p.bassLineShapes.length; i++) {
                    const shape = p.bassLineShapes[i];
                    shape.draw();
                    shape.update();
                }
                if(p.canRotate){
                    p.currentRotation = p.clockwiseRotation ? p.currentRotation + 1 : p.currentRotation - 1;
                }
            }
        }

        p.drawGrid = (alphaAmount) => {
            const shapeSize = p.width / 16,
                linesPerSide = 6,
                alphaLevel = Math.floor(alphaAmount),
                root = document.documentElement,
                gridColour = getComputedStyle(root).getPropertyValue("--grid-colour-" + p.gridVersion),
                strokeColour = p.color(gridColour);
            p.drawingContext.shadowColor = gridColour;
            p.grid.clear();
            p.grid.strokeWeight(8);
            p.grid.fill(27, 17, 77, alphaLevel);
            strokeColour.setAlpha(alphaLevel)
            p.grid.stroke(strokeColour);
            p.grid.rect(p.width, p.height, p.width / 16, p.width / 16);
            p.grid.noFill();
            for (let i = 0; i < linesPerSide; i++) {
                // //top
                p.grid.line(
                    p.width - shapeSize / 2 + (shapeSize / linesPerSide * i), 
                    p.height - shapeSize / 2, 
                    0 + (p.width * 2 / linesPerSide * i), 
                    p.height - p.width
                );

                //right
                p.grid.line(
                    p.width + shapeSize / 2, 
                    p.height - shapeSize / 2 + (shapeSize / linesPerSide * i), 
                    p.width * 2, 
                    p.height - p.width  + (p.width * 2 / linesPerSide * i)
                );

                // //bottom
                p.grid.line(
                    p.width + shapeSize / 2  - (shapeSize / linesPerSide * i), 
                    p.height + shapeSize / 2, 
                    p.width * 2 - (p.width * 2 / linesPerSide * i),
                    p.height + p.width
                );

                //left
                p.grid.line(
                    p.width - shapeSize / 2, 
                    p.height + shapeSize / 2 - (shapeSize / linesPerSide * i), 
                    0, 
                    p.height + p.width - (p.width * 2 / linesPerSide * i)
                );
            }
            
            for (let i = 0; i < 48; i++) {
                const rectSize = p.width / 16 + (p.width / 32 * i); 
                p.grid.rect(p.width, p.height, rectSize, rectSize);
            }
        }

        p.innerSquareColour = false;

        p.executeCueSet1 = (note) => {
            const { midi } = note;
            p.innerSquareColour = midi === 36 ? p.color('#1B114D') : p.color('#ff0cb8');
        }

        p.bassLineColour = p.color('#f7de74');

        p.bassLineShapes = [];

        p.gridVersion = 1;

        p.executeCueSet2 = (note) => {
            const { currentCue } = note;
            const r = p.random(255),
                g = p.random(255),
                b = p.random(255),
                rOptionsCopy = p.rotationOptions.slice();
            rOptionsCopy.splice(p.rotationOptions.indexOf(p.currentRotation), 1)
            p.currentRotation = p.random(rOptionsCopy);
            p.canRotate = Math.random() < 0.5;
            p.clockwiseRotation = Math.random() < 0.5;
            p.bassLineColour = p.color(r, g, b);
            p.bassLineShapes.push(
                new AnimatedShape(
                    p,
                    p.color(r, g, b, 127),
                    p.width / 16, 
                    p.secondsPerBar / 2,
                    p.width / 16 + p.width / 8,
                )
            );
            
            if(currentCue % 6 === 1) {
                const root = document.documentElement,
                    gridOptions = [1,2,3,4,5,6];
                gridOptions.splice(p.gridVersion - 1, 1);
                p.gridVersion= p.random(gridOptions);
                root.style.setProperty("--canvas-bg", "var(--bg-gradient-" + p.gridVersion + ')');
                p.drawGrid();
            }
        }

        p.executeCueSet3 = (note) => {
            p.bassLineShapes.push(
                new AnimatedShape(
                    p,
                    p.bassLineColour,
                    p.width / 16, 
                    p.secondsPerBar / 2
                )
            );
        }

        p.executeCueSet4 = (note) => {
            const { value } = note,
                alphaLevel = p.map(value, 0.49, 1, 0, 255);
            if(value < 1) {
                p.drawGrid(alphaLevel);
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
