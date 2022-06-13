/**
@author Veekobe Thailand
@project Master Monk3y
@version 0.120
 */
const IMAGE_ALL = {
    BODY1: 'body1',
    BODY2: 'body2',
    BODY3: 'body3',
    BODY4: 'body4',
    MOUSE_ANGRY: 'mouseAngry',
    MOUSE_SMILE: 'mouseSmile',
    OPEN_EYES: 'openEyes',
    ANGRY_EYES: 'angryEyes',
    CLOSE_EYES: 'closeEyes',
    WHITE_OPEN_EYES: 'whiteOpenEyes'
}
const MOBILE_SIZE = 350, DESKTOP_SIZE = 500, ANGRY_FACE_TIMEOUT = 3000 //ms
const STATE = {
    CLOSE: {
        KEY: 'CLOSE',
        EYES_IMG: IMAGE_ALL.CLOSE_EYES,
        MOUSE_IMG: IMAGE_ALL.MOUSE_SMILE,
        WHITE_EYES_IMG: null,
        ADD_DRAW_FN: null
    },
    OPEN: {
        KEY: 'OPEN',
        EYES_IMG: IMAGE_ALL.OPEN_EYES,
        MOUSE_IMG: IMAGE_ALL.MOUSE_SMILE,
        WHITE_EYES_IMG: IMAGE_ALL.WHITE_OPEN_EYES,
        ADD_DRAW_FN: drawAnimateEye
    },
    ANGRY_L1: {
        KEY: 'ANGRY_L1',
        EYES_IMG: IMAGE_ALL.OPEN_EYES,
        MOUSE_IMG: IMAGE_ALL.MOUSE_ANGRY,
        WHITE_EYES_IMG: IMAGE_ALL.WHITE_OPEN_EYES,
        ADD_DRAW_FN: null
    },
    ANGRY_L2: {
        KEY: 'ANGRY_L2',
        EYES_IMG: IMAGE_ALL.ANGRY_EYES,
        MOUSE_IMG: IMAGE_ALL.MOUSE_ANGRY,
        WHITE_EYES_IMG: null,
        ADD_DRAW_FN: null
    }
}
const ADJ_POS = (oldPos, isDesktop = true) => { return oldPos * ((isDesktop) ? DESKTOP_SIZE : MOBILE_SIZE) / 600 } //600 is number that already set at first.
const EYES = {
    left: {
        constrain: { x1: 200, x2: 255, y1: 175, y2: 195 }
    },
    right: {
        constrain: { x1: 318, x2: 375, y1: 180, y2: 192 }
    }
}
const EYES_CONFIG = {
    diameterEye: 20,
    diameterGlare: 5,
    glarePos: 5 //from center of eye
}
const ANGRY_NUMBER = 4
const BACKGROUND_COLOR = '#03003F'
const BODY_MAP = {
    0: IMAGE_ALL.BODY1,
    1: IMAGE_ALL.BODY2,
    2: IMAGE_ALL.BODY3,
    3: IMAGE_ALL.BODY4
}

var state = STATE.CLOSE.KEY, startTime = 0
var counter = 0, projImage = {}

var stars = [], noOfStars = 2000, lenDiff = 0.07//0.06
var angleSetting = 50 //0-100
var galaxyY, canvasSize
var bgSong, angrySong, bodyCounter = 0

function adjustEyesPosition(isDesktop = true) {
    for (let eyeSide in EYES)
        for (let pos in EYES[eyeSide].constrain) EYES[eyeSide].constrain[pos] = ADJ_POS(EYES[eyeSide].constrain[pos], isDesktop)
}
function preload() {
    Object.keys(IMAGE_ALL).forEach(key => { projImage[IMAGE_ALL[key]] = loadImage('image/' + IMAGE_ALL[key] + '.png') })
}

function calEnvironment() {
    if (windowWidth < windowHeight) {
        canvasSize = MOBILE_SIZE
        adjustEyesPosition(false)
        galaxyY = canvasSize - 30
        EYES_CONFIG.diameterEye = 10
        EYES_CONFIG.diameterGlare = 2.5
        EYES_CONFIG.glarePos = 2.5
    } else {
        canvasSize = DESKTOP_SIZE
        adjustEyesPosition()
        galaxyY = canvasSize - 40
    }
}

function setup() {
    calEnvironment()
    //console.log('canvas: ', canvasSize)
    createCanvas(canvasSize, canvasSize)
    Object.keys(IMAGE_ALL).forEach(key => projImage[IMAGE_ALL[key]].resize(canvasSize, canvasSize))
    setupStar()
    setInterval(() => {
        bodyCounter = (bodyCounter >= 3) ? 0: bodyCounter + 1
        //console.log('bodyCounter: ', bodyCounter)
    }, 100)
}

function initAudioObj(player, filename, autoplay = true, loop = true){
    player.src = 'sound/' + filename + '.mp3'
    player.autoplay = autoplay
    player.loop = loop
}

function initSound() {
    //console.log('initSound')
    bgSong = document.createElement('audio')
    angrySong = document.createElement('audio')
    initAudioObj(bgSong, 'LaoDuangDuan')
    initAudioObj(angrySong, 'BatEatBanana', false, false)
}
function setupStar() {
    let len = 0;
    for (let i = 0; i < noOfStars; i++) {
        const a = len
        const b = len * 1.8//1.5

        len = len + lenDiff

        stars.push(new Star(0, 0, a, b))
    }
}

class Star {
    constructor(x, y, majorAxisLen, minorAxisLen) {
        this.x = x
        this.y = y
        this.majorAxisLen = majorAxisLen
        this.minorAxisLen = minorAxisLen
        // Initial position of star
        this.theta = random(10)
        this.angularVelocity = 0.008
    }

    moveInTrajectory() {
        noStroke()
        fill(255, 255, 255, 50)
        const x = this.majorAxisLen * cos(this.theta)
        const y = this.minorAxisLen * sin(this.theta)
        ellipse(x, y, 4, 4)
        this.theta += this.angularVelocity
    }
}

function draw() {
    drawStar()
    drawMonk3y()
}

function drawMonk3y() {
    doLogic()
    //console.log('state: ', state)
    if (STATE[state].WHITE_EYES_IMG) image(projImage[STATE[state].WHITE_EYES_IMG], 0, 0)
    if (STATE[state].ADD_DRAW_FN) STATE[state].ADD_DRAW_FN()
    if (STATE[state].EYES_IMG) image(projImage[STATE[state].EYES_IMG], 0, 0)
    image(projImage[BODY_MAP[bodyCounter]], 0, 0)
    if (STATE[state].MOUSE_IMG) image(projImage[STATE[state].MOUSE_IMG], 0, 0)
}
function drawStar() {
    background(BACKGROUND_COLOR)
    noFill()
    let pAxisAngle = 0
    for (let i = 0; i < stars.length; i++) {
        push()
        translate(width / 2, galaxyY)  //new x,y center of galaxy
        rotate(pAxisAngle)
        stars[i].moveInTrajectory()
        pop()
        pAxisAngle += angleSetting / 10000
    }
}


function drawAnimateEye() {
    for (let eyeKey in EYES) {
        let eye = EYES[eyeKey]
        //whites of eye
        noStroke()
        //iris
        fill(0)
        circle(eye.x, eye.y, EYES_CONFIG.diameterEye)
        //glare
        fill(255)
        circle(eye.glareX, eye.glareY, EYES_CONFIG.diameterGlare)
    }
}
function touchStarted() {
    angleSetting += (angleSetting < 100) ? 10 : -angleSetting
    if (state == STATE.ANGRY_L2.KEY) return false
    counter++
    //console.log('mouseClicked counter: ', counter)
    if (counter >= ANGRY_NUMBER) {
        if (counter == ANGRY_NUMBER) {
            bgSong.pause()
            angrySong.play()
            //console.log('angry 1')
            state = STATE.ANGRY_L1.KEY
            startTime = new Date().getTime()
        } else {
            //console.log('angry 2')
            state = STATE.ANGRY_L2.KEY
            startTime = new Date().getTime()
        }
    } else {
        state = STATE.OPEN.KEY
        if(!(bgSong || angrySong)) initSound()
        else bgSong.play()
    }
    return false // prevent default
}
function touchEnded() {  //or mouseReleased()
    if (state == STATE.OPEN.KEY) state = STATE.CLOSE.KEY
    //console.log('touchEnded state: ', state)
    return false // prevent default
}
function doLogic() {
    //console.log('state: ', state)
    if (mouseIsPressed) {
        if (state == STATE.OPEN.KEY) calEyes()
    } else if (counter >= ANGRY_NUMBER && isNotAngryFaceShowTime()) {
        state = STATE.CLOSE.KEY
        startTime = 0
        counter = 0
        angrySong.pause()
        angrySong.currentTime = 0
        bgSong.play()
        //console.log('finish')
    }
}
function isNotAngryFaceShowTime() {
    //console.log('hey: ', startTime)
    return new Date().getTime() - startTime > ANGRY_FACE_TIMEOUT
}
function calEyes() {
    let userPos = {}
    userPos.x = mouseX
    userPos.y = mouseY
    Object.keys(EYES).forEach(key => calPosition(EYES[key], userPos))
}
function calPosition(objEye, userPos) {
    objEye.x = constrain(userPos.x, objEye.constrain.x1, objEye.constrain.x2)
    objEye.y = constrain(userPos.y, objEye.constrain.y1, objEye.constrain.y2)

    objEye.glareX = objEye.x + EYES_CONFIG.glarePos
    objEye.glareY = objEye.y - EYES_CONFIG.glarePos
}
