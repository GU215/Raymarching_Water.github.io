"use strict"

//canvasの設定
const c = document.querySelector("canvas");
const gl = c.getContext("webgl2");

//canvasの解像度とサイズの設定
let contentWidth = window.innerWidth;
let contentHeight = window.innerHeight;
c.width = Math.min(800, contentWidth);
// c.width = 1600;
let mouseScaleX = contentWidth / c.width;
let mouseScaleY = contentHeight / c.height;
c.height = Math.floor(c.width / contentWidth * contentHeight);


//シェーダーのソースをHTML側から取得 + 変数色々の定義
const VShaderSource = document.getElementById("vs");
const FShaderSource = document.getElementById("fs");
const uniLocation = [];
let mx, my, touch, isTouch;
let startTime = 0.0;
let time = 0.0;
let temptime = 0.0;

//canvas上でのマウス/タッチ移動の検知
c.addEventListener('mousemove', function (e) {
    isTouch = true;
    e.preventDefault();
    mx = e.offsetX;
    my = e.offsetY;
}, true);

c.addEventListener('touchmove', function (e) {
    isTouch = true;
    touch = e.changedTouches;
    e.preventDefault();
    mx = touch[0].pageX;
    my = touch[0].pageY;
}, true);

//シェーダーを作成する
function GLCreateShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const SSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (SSuccess) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

//バーテックスシェーダーとフラグメントシェーダーの二つからシェーダープログラムを作成する
function GLCreateProgram(vshader, fshader) {
    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    const PSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (PSuccess) {
        return program;
    }
    console.log(gl.getProgramInfoLog(shader));
    gl.deleteProgram(program);
}

// テクスチャを作成
function GLCreateTexture() {
    let t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return t;
}

// VAOを作成
function setVAO() {
    VAO = gl.createVertexArray();
    PosBuffer = gl.createBuffer();
    PosAttribLocation = gl.getAttribLocation(prg, "position");
    gl.bindVertexArray(VAO);
    gl.enableVertexAttribArray(PosAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, PosBuffer);
    gl.vertexAttribPointer(PosAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Positions), gl.STATIC_DRAW);
}

//シェーダーの作成
const VShader = GLCreateShader(gl.VERTEX_SHADER, VShaderSource.innerHTML);
const FShader = GLCreateShader(gl.FRAGMENT_SHADER, FShaderSource.innerHTML);

// シェーダープログラムの作成と変数の定義
const prg = GLCreateProgram(VShader, FShader);
let VAO, PosBuffer, PosAttribLocation;

// Uniform変数の定義
uniLocation[0] = gl.getUniformLocation(prg, "time");
uniLocation[1] = gl.getUniformLocation(prg, "mouse");
uniLocation[2] = gl.getUniformLocation(prg, "resolution");

// ポリゴンの位置の設定

const Positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0
]

// VertexArrayObjectの定義
setVAO();

// 描画の前準備
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.viewport(0, 0, c.width, c.height);
gl.useProgram(prg);
gl.uniform2fv(uniLocation[2], [c.width, c.height]);
startTime = new Date().getTime();
mx = 0.5; my = 0.5;
let nowMx = 0.5;
let nowMy = 0.5;

// ループ
function render() {
    requestAnimationFrame(render);

    time = (new Date().getTime() - startTime) * 0.001;

    if(isTouch) {
        mx /= c.width * mouseScaleX;
        my /= c.height * mouseScaleX;
    }
    isTouch = false;

    nowMx += (mx - nowMx) / 5;
    nowMy += (my - nowMy) / 5;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uniLocation[0], time + temptime);
    gl.uniform2fv(uniLocation[1], [nowMx, nowMy]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

};

render();