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
                    const noteSet1 = result.tracks[0].notes.filter(note => [43, 44].includes(note.midi)); // Redrum 1 - Dublab BrushKit3
                    const noteSet2 = result.tracks[4].notes; // Maelstrom 2 - Wood Arp
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
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
                p.fill(27, 17, 77);
                p.stroke(0, 255, 255);
                p.rect(p.width / 2, p.height / 2, p.width / 16, p.width / 16);
                p.noFill();
                for (let i = 0; i < p.bassLineShapes.length; i++) {
                    const shape = p.bassLineShapes[i];
                    shape.draw();
                    shape.update();
                }
            }
        }

        p.drawGrid = () => {
            const shapeSize = p.width / 16,
                linesPerSide = 6;
            p.grid.stroke('#e722f2');
            p.grid.strokeWeight(8);
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
        }

        p.bassLineShapes = [];

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            if(currentCue === 1) {
                p.drawGrid();
            }
            p.bassLineShapes.push(
                new AnimatedShape(
                    p,
                    p.color('#e722f2'),
                    p.width / 16, 
                    p.secondsPerBar
                )
            );
        }

        p.executeCueSet2 = (note) => {
            p.bassLineShapes.push(
                new AnimatedShape(
                    p,
                    p.color('#f7de74'),
                    p.width / 16, 
                    p.secondsPerBar
                )
            );
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
