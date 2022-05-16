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

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.grid = p.createGraphics(p.canvasWidth, p.canvasHeight);
            p.rectMode(p.CENTER);
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
                p.image(p.grid, 0, 0);
                p.noFill();
                if(p.innerSquareColour){
                    p.stroke(p.innerSquareColour);
                    p.rect(p.width / 2, p.height / 2, p.width / 16, p.width / 16);
                }
                for (let i = 0; i < p.bassLineShapes.length; i++) {
                    const shape = p.bassLineShapes[i];
                    shape.draw();
                    shape.update();
                }
            }
        }

        p.drawGrid = (alphaAmount) => {
            const shapeSize = p.width / 16,
                linesPerSide = 6,
                alphaLevel = Math.floor(alphaAmount);
            p.grid.clear();
            p.grid.strokeWeight(8);
            p.grid.fill(27, 17, 77, alphaLevel);
            p.grid.stroke(0, 255, 255, alphaLevel);
            p.grid.rect(p.width / 2, p.height / 2, p.width / 16, p.width / 16);
            p.grid.noFill();
            for (let i = 0; i < linesPerSide; i++) {
                //top
                p.grid.line(
                    p.width / 2 - shapeSize / 2 + (shapeSize / linesPerSide * i), 
                    p.height / 2 - shapeSize / 2, 
                    0 + (p.width / linesPerSide * i), 
                    p.height / 2 - p.width / 2
                );

                //right
                p.grid.line(
                    p.width / 2 + shapeSize / 2, 
                    p.height / 2 - shapeSize / 2 + (shapeSize / linesPerSide * i), 
                    p.width, 
                    p.height / 2 - p.width / 2  + (p.width / linesPerSide * i)
                );

                //bottom
                p.grid.line(
                    p.width / 2 + shapeSize / 2  - (shapeSize / linesPerSide * i), 
                    p.height / 2 + shapeSize / 2, 
                    p.width - (p.width / linesPerSide * i),
                    p.height / 2 + p.width / 2
                );

                //left
                p.grid.line(
                    p.width / 2 - shapeSize / 2, 
                    p.height / 2 + shapeSize / 2 - (shapeSize / linesPerSide * i), 
                    0, 
                    p.height / 2 + p.width / 2 - (p.width / linesPerSide * i)
                );
            }

            for (let i = 0; i < 8; i++) {
                const rectSize = p.width / 16 + (p.width / 8 * i); 
                p.grid.stroke(0, 255, 255, alphaLevel);
                p.grid.rect(p.width / 2, p.height / 2, rectSize, rectSize);
            }
        }

        p.drawTriangleGrid = (alphaAmount) => {
            const shapeSize = p.width / 16,
                linesPerSide = 6,
                alphaLevel = Math.floor(alphaAmount);
            p.grid.clear();
            p.grid.strokeWeight(8);
            p.grid.fill(27, 17, 77, alphaLevel);
            p.grid.stroke(0, 255, 255, alphaLevel);
            // p.grid.rect(p.width / 2, p.height / 2, p.width / 16, p.width / 16);
            let x1 = p.width / 2, y1 = p.height / 2 - p.width / 32;
            let x2 = p.width / 2  - p.width / 32, y2 = p.height / 2 + p.width / 32;
            let x3 = p.width / 2  + p.width / 32, y3 = p.height / 2 + p.width / 32;
            p.grid.triangle(x1, y1, x2, y2, x3, y3);
            p.grid.noFill();
            
            for (let i = 0; i < linesPerSide; i++) {

                //right
                p.grid.line(
                    x1, 
                    p.height / 2 - shapeSize / 2 + (shapeSize / linesPerSide * i), 
                    p.width, 
                    p.height / 2 - p.width / 2  + (p.width / linesPerSide * i)
                );
            }

            for (let i = 0; i < 8; i++) {
                y1 = p.height / 2 - p.width / 32 - (p.width / 8 * i);
                x2 = p.width / 2  - p.width / 32 - (p.width / 8 * i);
                y2 = p.height / 2 + p.width / 32 + (p.width / 8 * i);
                x3 = p.width / 2  + p.width / 32 + (p.width / 8 * i);
                y3 = p.height / 2 + p.width / 32 + (p.width / 8 * i);
                p.grid.stroke(0, 255, 255, alphaLevel);
                p.grid.triangle(x1, y1, x2, y2, x3, y3);
            }
        }

        p.innerSquareColour = false;

        p.executeCueSet1 = (note) => {
            const { midi } = note;
            p.innerSquareColour = midi === 36 ? p.color('#1B114D') : p.color('#ff0cb8');
            
            p.bassLineShapes.push(
                new AnimatedShape(
                    p,
                    p.innerSquareColour,
                    p.width / 16, 
                    p.secondsPerBar / 2
                )
            );
        }

        p.bassLineColour = p.color('#f7de74');

        p.bassLineShapes = [];

        p.executeCueSet2 = (note) => {
            p.bassLineColour = p.color(
                p.random(255),
                p.random(255),
                p.random(255)
            );
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
                p.drawTriangleGrid(alphaLevel);
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
