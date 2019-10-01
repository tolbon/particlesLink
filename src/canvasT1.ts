"use strict";

class Param {
    public static dist2Pts: number = 2000.0;
    public static minAlpha: number = 0.0;
    public static maxAlpha: number = 1.0;
    public static nbPoints: number = 100;
}

let canvas: HTMLCanvasElement|null = null;
let canvasHeight: number;
let canvasWidth: number;
let m_canvas: HTMLCanvasElement;
let rectCanvas: ClientRect;
let gCtx: CanvasRenderingContext2D|null = null;
let m_ctx: CanvasRenderingContext2D|null = null;
let _listP: Array<Point>;


function initCanvas(): void {
    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    if (canvas === null)
    {
        return;
    }
    canvasHeight = canvas!.height;
    canvasWidth = canvas!.width;

    m_canvas = <HTMLCanvasElement>document.createElement("canvas");
    m_canvas.height = canvasHeight;    
    m_canvas.width = canvasWidth;    
    m_ctx = m_canvas!.getContext("2d");    
    gCtx = canvas!.getContext("2d");
    rectCanvas = canvas!.getBoundingClientRect();

    canvas!.addEventListener("pointermove", function (evt: PointerEvent) {
        var pointerPos = getMousePos(evt);
        var message = "Mouse position: " + pointerPos.x + "," + pointerPos.y;
        console.log(message);
        _listP[0].posX = pointerPos.x;
        _listP[0].posY = pointerPos.y;
    }, false);

    canvas!.addEventListener("pointerout", function (evt: PointerEvent) {
        _listP[0].posX = 0;
        _listP[0].posY = 0;
    }, false);

    createUniverse();
    loop();
}


function createUniverse(): void {
    let len: number = Param.nbPoints;
    let posXRandom: number = 0;
    let posYRandom: number = 0;
    let moveXRdm: number = 0.0;
    let moveYRdm: number = 0.0;
    let colorRdm: Array<number>;

    _listP = new Array<Point>(Param.nbPoints);

    for (let i = 0; i < len; i++) {
        posXRandom = Math.random() * canvasWidth;
        posYRandom = Math.random() * canvasHeight;
        moveXRdm = Math.random();
        moveYRdm = Math.random();
        colorRdm = [Math.floor((Math.random() * 255)),
        Math.floor((Math.random() * 255)),
        Math.floor((Math.random() * 255))];
        _listP[i] = new Point(posXRandom, posYRandom,
            moveXRdm, moveXRdm, colorRdm);
    }

    _listP[0].moveX = 0;
    _listP[0].moveY = 0;
}

function loop() : void
{
    lambdaColor();
}

function lambdaColor() {
    let iLenght: number = _listP.length;
    let distTmp: number = 0.0;
    let alphaTmp: number = 0.0;
    let gradient: CanvasGradient;

    m_ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < iLenght; i++) {
        _listP[i].nextMove();
        if (_listP[i].posX < 0 || _listP[i].posX > canvasWidth) {
            _listP[i].moveX = -_listP[i].moveX;
        }
        if (_listP[i].posY < 0 || _listP[i].posY > canvasHeight) {
            _listP[i].moveY = -_listP[i].moveY;
        }
        m_ctx!.beginPath();
        m_ctx!.fillRect(_listP[i].posX, _listP[i].posY, 2, 2);
        m_ctx!.lineWidth = 4;
        m_ctx!.lineCap = "square";
        m_ctx!.stroke();        
                
        for (let j = i + 1; j < iLenght; j++) {
            distTmp = _listP[i].distance2Pts(_listP[j]);
            if (distTmp < Param.dist2Pts) {
               
                alphaTmp = Param.maxAlpha - (((
                    (Param.maxAlpha - Param.minAlpha) / (Param.dist2Pts - 0))
                    * distTmp) + Param.minAlpha);
                    
                m_ctx!.beginPath();
                gradient = m_ctx!.createLinearGradient(0, 0, distTmp, 0);
                gradient.addColorStop(0, _listP[i].color.rgba2str(alphaTmp));
                gradient.addColorStop(1, _listP[j].color.rgba2str(alphaTmp));
                m_ctx!.strokeStyle = gradient;
                m_ctx!.fillStyle = gradient;

                m_ctx!.moveTo(_listP[i].posX, _listP[i].posY);
                m_ctx!.lineTo(_listP[j].posX, _listP[j].posY);
                m_ctx!.stroke();
            }
        }      
    }
    gCtx!.clearRect(0, 0, canvasWidth, canvasHeight);
    gCtx!.drawImage(m_canvas, 0, 0);
    window.requestAnimationFrame(lambdaColor);
}


function getMousePos(evt: PointerEvent) {
    return {
        x: evt.clientX - rectCanvas.left,
        y: evt.clientY - rectCanvas.top
    };
}


class Point {
    public posX: number;
    public posY: number;
    public moveX: number;
    public moveY: number;
    public readonly color: Color;

    public constructor(x: number = 0.0, y: number = 0.0, mX: number = 0.0,
        mY: number = 0.0, col: number[] = [0,0,0]) {
        this.posX = x;
        this.posY = y;
        this.moveX = mX;
        this.moveY = mY;     
        this.color = new Color(col[0], col[1], col[2]);
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

class Color {
    private colR: number = 0;
    private colG: number = 0;
    private colB: number = 0;
    private readonly computeStr: string;

    public constructor(r: number, g: number, b: number) {
        this.colR = r;
        this.colG = g;
        this.colB = b;
        this.computeStr = "rgba(" + this.colR.toString(10) + "," + this.colG.toString(10) + "," + this.colB.toString(10) + ",";
    }

    public rgba2str(alpha: number = 1.0): string {
        return (this.computeStr + alpha.toFixed(2) + ")");
    }
}