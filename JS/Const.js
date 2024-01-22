const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = (1200+400)*3;
const CANVAS_HEIGHT = canvas.height = (800+266)*3;
const STRETCH_FACTOR = 4;
const ZOOM_FACTOR = 3.5; //3

const tearTypes = {
    normal: {
        string: "normal",
    },
    red: {
        string: "red",
    },
    blue: {
        string: "blue",
    },
    yellow: {
        string: "yellow",
    },
    green: {
        string: "green",
    },
}

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    h: {
        pressed: false,
    }
}

const mousePos = {
    clientX: 0,
    clientY: 0
}
