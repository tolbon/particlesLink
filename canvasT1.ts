"use strict";

class Param {
    public static dist2Pts: number = 2000.0;
    public static minAlpha: number = 0.0;
    public static maxAlpha: number = 1.0;

    public static nbPoints: number = 10 | 0;
}


//PolyFill

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window["webkitRequestAnimationFrame"] ||
        window["mozRequestAnimationFrame"] ||
        window["msRequestAnimationFrame"] ||
        window["oRequestAnimationFrame"] ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();


if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}



var canvas: HTMLCanvasElement = null;
var gCtx: CanvasRenderingContext2D = null;
var _listP: Array<Point> = null;


function initCanvas():void {
    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    if (canvas.getContext) {
        gCtx = canvas.getContext('2d');
    }

    canvas.addEventListener("mousemove", function (evt) {
        var mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        console.log(message);
        _listP[0].posX = mousePos.x;
        _listP[0].posY = mousePos.y;
    }, false);

    createUniverse();
}


function createUniverse(): void {
    var i: number = 0;
    var len: number = Param.nbPoints;
    var posXRandom: number = 0;
    var posYRandom: number = 0;
    var moveXRdm: number = 0.0;
    var moveYRdm: number = 0.0;
    var colorRdm: string = "";

    this._listP = new Array<Point>(Param.nbPoints);

    for (i = 0; i < len; i++) {
        posXRandom = Math.random() * canvas.width;
        posYRandom = Math.random() * canvas.height;
        moveXRdm = Math.random();
        moveYRdm = Math.random();
        colorRdm = "#" + Math.floor((Math.random() * 255)).toString(16)
        + Math.floor((Math.random() * 255)).toString(16)
        + Math.floor((Math.random() * 255)).toString(16);
        this._listP[i] = new Point(posXRandom, posYRandom,
            moveXRdm, moveXRdm, colorRdm);
    }

    _listP[0].moveX = 0;
    _listP[0].moveY = 0;



    loop();
}

function loop() : void
{
    lambdaColor();
}

function lambdaColor() {
    var i: number = 0;
    var j: number = 0;
    var iLenght: number = this._listP.length;
    var distTmp: number = 0.0;
    var alphaTmp: number = 0.0;
    var gradient: CanvasGradient = null;

    gCtx.clearRect(0, 0, canvas.width, canvas.width);

    for (i = 0; i < iLenght; i++) {
        this._listP[i].nextMove();
        if (this._listP[i].posX < 0 || this._listP[i].posX > canvas.width) {
            _listP[i].moveX = -_listP[i].moveX;
        }
        if (this._listP[i].posY < 0 || this._listP[i].posY > canvas.height) {
            _listP[i].moveY = -_listP[i].moveY;
        }
        gCtx.beginPath();
        gCtx.fillStyle = this._listP[i].color.rgba2str(1.0);
        gCtx.fillRect(_listP[i].posX, _listP[i].posY, 2, 2);
        gCtx.stroke()
        for (j = i + 1; j < iLenght; j++) {
            distTmp = this._listP[i].distance2Pts(this._listP[j]);
            if (distTmp < Param.dist2Pts) {
                gCtx.beginPath();
                alphaTmp = Param.maxAlpha - (((
                    (Param.maxAlpha - Param.minAlpha) / (Param.dist2Pts - 0))
                    * distTmp) + Param.minAlpha);

                gradient = gCtx.createLinearGradient(0, 0, distTmp, 0);
                gradient.addColorStop(0, this._listP[i].color.rgba2str(alphaTmp));
                gradient.addColorStop(1, this._listP[j].color.rgba2str(alphaTmp));
                gCtx.strokeStyle = gradient;
                gCtx.lineWidth = 4;
                gCtx.lineCap = "square";
                gCtx.moveTo(this._listP[i].posX, this._listP[i].posY);
                gCtx.lineTo(this._listP[j].posX, this._listP[j].posY);
                gCtx.stroke();
            }
        }
    }
    window.requestAnimationFrame(lambdaColor);
}


class Color {
    public colR: number = 0;
    public colG: number = 0;
    public colB: number = 0;

    constructor(col: string) {
        this.colR = parseInt(col.substring(1, 3), 16);
        this.colG = parseInt(col.substring(3, 5), 16);
        this.colB = parseInt(col.substring(5, 7), 16);
    }

    public rgba2str(alpha: number = 1.0): string {
        console.assert((alpha < 1.0), "Alpha Sup " + alpha);
        console.assert((alpha >= 0.0), "Alpha Sup " + alpha);
        if (alpha > 0.0 && alpha <= 1.0)
            return ("rgba(" + this.colR.toString() + "," + this.colG.toString() + "," + this.colB.toString() + "," + alpha.toFixed(2) + ")");
        return ("rgba(" + this.colR.toString() + "," + this.colG.toString() + "," + this.colB.toString() + ",1.0)");
    }
}

class Point {
    public posX: number = 0.0;
    public posY: number = 0.0;
    public moveX: number = 0.0;
    public moveY: number = 0.0;
    public color: Color = null;

    constructor(x: number = 0.0, y: number = 0.0, mX: number = 0.0,
        mY: number = 0.0, col: string = "#FFFFFF") {
        this.posX = x;
        this.posY = y;
        this.moveX = mX;
        this.moveY = mY;
        this.color = new Color(col);
    }

    public nextMove() {
        this.posX += this.moveX;
        this.posY += this.moveY;
    }

    public distance2Pts(p: Point): number {
        return ((this.posX - p.posX) * (this.posX - p.posX)
            + (this.posY - p.posY) * (this.posY - p.posY));
    }
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

