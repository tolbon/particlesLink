"use strict";
var Param = (function () {
    function Param() {
    }
    return Param;
}());
Param.dist2Pts = 2000.0;
Param.minAlpha = 0.0;
Param.maxAlpha = 1.0;
Param.nbPoints = 100;
var canvas = null;
var canvasHeight;
var canvasWidth;
var m_canvas;
var rectCanvas;
var gCtx = null;
var m_ctx = null;
var _listP;
function initCanvas() {
    canvas = document.getElementById("canvas");
    if (canvas === null) {
        return;
    }
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    m_canvas = document.createElement("canvas");
    m_canvas.height = canvasHeight;
    m_canvas.width = canvasWidth;
    m_ctx = m_canvas.getContext("2d");
    gCtx = canvas.getContext("2d");
    rectCanvas = canvas.getBoundingClientRect();
    canvas.addEventListener("pointermove", function (evt) {
        var pointerPos = getMousePos(evt);
        var message = "Mouse position: " + pointerPos.x + "," + pointerPos.y;
        console.log(message);
        _listP[0].posX = pointerPos.x;
        _listP[0].posY = pointerPos.y;
    }, false);
    canvas.addEventListener("pointerout", function (evt) {
        _listP[0].posX = 0;
        _listP[0].posY = 0;
    }, false);
    createUniverse();
    loop();
}
function createUniverse() {
    var i = 0;
    var len = Param.nbPoints;
    var posXRandom = 0;
    var posYRandom = 0;
    var moveXRdm = 0.0;
    var moveYRdm = 0.0;
    var colorRdm;
    _listP = new Array(Param.nbPoints);
    for (i = 0; i < len; i++) {
        posXRandom = Math.random() * canvasWidth;
        posYRandom = Math.random() * canvasHeight;
        moveXRdm = Math.random();
        moveYRdm = Math.random();
        colorRdm = [Math.floor((Math.random() * 255)),
            Math.floor((Math.random() * 255)),
            Math.floor((Math.random() * 255))];
        _listP[i] = new Point(posXRandom, posYRandom, moveXRdm, moveXRdm, colorRdm);
    }
    _listP[0].moveX = 0;
    _listP[0].moveY = 0;
}
function loop() {
    lambdaColor();
}
function lambdaColor() {
    var i = 0;
    var j = 0;
    var iLenght = _listP.length;
    var distTmp = 0.0;
    var alphaTmp = 0.0;
    var gradient;
    m_ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (i = 0; i < iLenght; i++) {
        _listP[i].nextMove();
        if (_listP[i].posX < 0 || _listP[i].posX > canvasWidth) {
            _listP[i].moveX = -_listP[i].moveX;
        }
        if (_listP[i].posY < 0 || _listP[i].posY > canvasHeight) {
            _listP[i].moveY = -_listP[i].moveY;
        }
        m_ctx.beginPath();
        m_ctx.fillRect(_listP[i].posX, _listP[i].posY, 2, 2);
        m_ctx.lineWidth = 4;
        m_ctx.lineCap = "square";
        m_ctx.stroke();
        for (j = i + 1; j < iLenght; j++) {
            distTmp = _listP[i].distance2Pts(_listP[j]);
            if (distTmp < Param.dist2Pts) {
                alphaTmp = Param.maxAlpha - ((((Param.maxAlpha - Param.minAlpha) / (Param.dist2Pts - 0))
                    * distTmp) + Param.minAlpha);
                m_ctx.beginPath();
                gradient = m_ctx.createLinearGradient(0, 0, distTmp, 0);
                gradient.addColorStop(0, _listP[i].color.rgba2str(alphaTmp));
                gradient.addColorStop(1, _listP[j].color.rgba2str(alphaTmp));
                m_ctx.strokeStyle = gradient;
                m_ctx.fillStyle = gradient;
                m_ctx.moveTo(_listP[i].posX, _listP[i].posY);
                m_ctx.lineTo(_listP[j].posX, _listP[j].posY);
                m_ctx.stroke();
            }
        }
    }
    gCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    gCtx.drawImage(m_canvas, 0, 0);
    window.requestAnimationFrame(lambdaColor);
}
function getMousePos(evt) {
    return {
        x: evt.clientX - rectCanvas.left,
        y: evt.clientY - rectCanvas.top
    };
}
var Point = (function () {
    function Point(x, y, mX, mY, col) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (mX === void 0) { mX = 0.0; }
        if (mY === void 0) { mY = 0.0; }
        if (col === void 0) { col = [0, 0, 0]; }
        this.posX = x;
        this.posY = y;
        this.moveX = mX;
        this.moveY = mY;
        this.color = new Color(col[0], col[1], col[2]);
    }
    Point.prototype.nextMove = function () {
        this.posX += this.moveX;
        this.posY += this.moveY;
    };
    Point.prototype.distance2Pts = function (p) {
        return ((this.posX - p.posX) * (this.posX - p.posX)
            + (this.posY - p.posY) * (this.posY - p.posY));
    };
    return Point;
}());
var Color = (function () {
    function Color(r, g, b) {
        this.colR = 0;
        this.colG = 0;
        this.colB = 0;
        this.colR = r;
        this.colG = g;
        this.colB = b;
        this.computeStr = "rgba(" + this.colR.toString(10) + "," + this.colG.toString(10) + "," + this.colB.toString(10) + ",";
    }
    Color.prototype.rgba2str = function (alpha) {
        if (alpha === void 0) { alpha = 1.0; }
        return (this.computeStr + alpha.toFixed(2) + ")");
    };
    return Color;
}());
