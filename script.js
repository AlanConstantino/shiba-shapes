import Circle from './shapes/circle.js';
import Square from './shapes/square.js';
import Triangle from './shapes/triangle.js';

export let context, gravity, shapes;

// url for API
const BASE_URL = (number, urlBool, httpsBool) =>
    `http://shibe.online/api/shibes?count=${number}&urls=${urlBool}&httpsUrls=${httpsBool}`;

// canvas
const canvas = document.getElementById('myCanvas');
context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// for storing shapes
shapes = [];

// for storing our shiba images
let images = [];
let imageIndex = 0;

// our form
const form = document.forms[0];

// gravity for shapes
gravity = -1; // postive = down, negative = up



// fetch data from API and return as JSON
async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}
// note: creating shapes may be a bit weird because of async code execution
// cache images to use later so we don't bombard API with requests
function cacheImagesFromAPI() {
    const promise = fetchData(BASE_URL(30, true, true)); // request 30 images
    promise.then((response) => {
        images = response.map(image => image);
    });
}



function showAlertIfOptionsAreMissing(options) {
    // if there are no options, alert and return out
    if (options.color === false || options.shape === false || options.shiba === false) {
        alert("One or more options was left blank!\nFill out all options.");
        return;
    }
}
function checkIfNewImagesAreNeeded() {
    // check to see if image index matches the length of images
    if ((imageIndex + 1) === images.length) {
        // if so, get new images from API, save them, and reset imageIndex
        cacheImagesFromAPI();
        imageIndex = -1;
    }
}
function increaseImageIndexIfShibaWasChosen(shibaOption) {
    // if shiba option was chosen, update imageIndex
    if (shibaOption === 'yes') {
        imageIndex++;
    }
}
// draw custom shape with selected options from form
function createCustomShape(options) {
    // helper functions
    checkIfNewImagesAreNeeded();
    showAlertIfOptionsAreMissing(options);
    increaseImageIndexIfShibaWasChosen(options.shiba);

    // random sizes for shapes
    const randomSize = Math.floor(Math.random() * 150) + 30; // for square
    const randomSide = Math.floor(Math.random() * 200) + 30; // for triangle
    const randomRadius = Math.floor(Math.random() * 100) + 10; // for circle

    // if user chose a square, create a square and return out
    if (options.shape === 'square') {
        const square = new Square(randomSize, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(square);
        return;
    }
    // if user chose triangle, create triangle and return out
    if (options.shape === 'triangle') {
        const triangle = new Triangle(randomSide, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(triangle);
        return;
    }
    // if user chose circle, create circle
    if (options.shape === 'circle') {
        const circle = new Circle(randomRadius, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(circle);
    }
}



function getSelectedRadioOption(name) {
    const radios = [...form.elements[name]]; // converts RadioNodelist to an array
    const elementData = radios.filter(value => value.checked === true); // filter for selected option
    // if no option was checked, save as false, else save the id of the option chosen
    const selectedOption = elementData.length === 0 ? false : elementData[0].id;
    return selectedOption;
}
function changeColorStringToHexString(color) {
    if (color === 'blue') {
        return '#3575C5';
    }
    if (color === 'green') {
        return '#00AA3B';
    }
    if (color === 'orange') {
        return '#FFB92B';
    }
    return '#000000'; // default to black
}
// will create custom shape when 'Generate' button is clicked
form.addEventListener('submit', (e) => {
    // prevents default action of the button
    e.preventDefault();

    // save all options into an object
    const options = {};
    options.color = changeColorStringToHexString(getSelectedRadioOption('color'));
    options.shape = getSelectedRadioOption('shape');
    options.shiba = getSelectedRadioOption('shiba');

    // create custom shape with selected options
    createCustomShape(options);
});
// will clear the screen when 'Clear Screen' button is clicked
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', () => animation.pause());



// animating the shapes
let animation = {
    play: () => {
        // animate the shapes that are in the shapes array
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < shapes.length; i++) {
            shapes[i].update();
        }
        requestAnimationFrame(animation.play);
    },
    pause: () => window.location.reload()
};
// initialization function
function init() {
    animation.play();
    cacheImagesFromAPI();
}
window.onload = () => init();