// to start run npx live-server build in terminal
/* 
My Planned Changes:
Maybe a timed mode !done!
Play again button !done!
*/
import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
const resetButton = document.getElementById("reset-button");
const timeButton = document.getElementById("time-button");
const countdownEl = document.getElementById('countdown');
const startingMinutes = 1;

let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
let countdownTime = 60000;
let isTimedMode = false;
let time = startingMinutes * 60;

function defaultState() {
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    nextLetter = 0;
    rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
    countdownTime = 60000;
    isTimedMode = false;
    time = startingMinutes * 60;
    countdownEl.innerHTML = "";
}

console.log(rightGuessString);

function updateCountdown() {
    if(!isTimedMode) return;

    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    countdownEl.innerHTML = `${minutes}:${seconds}`;
    
    if(time == 0) {
        toastr.error("Ran out of time!");
        guessesRemaining = 0;
        isTimedMode = false;
        return;
    }

    if(time > 0) time--;
}

setInterval(updateCountdown, 1000);

function initBoard() {
    let board = document.getElementById("game-board");
    board.innerHTML = "";

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
            board.appendChild(row);
        }
    }

    //where counter is , might not be the best place
    
}

initBoard();

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter(pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box")
    currentGuess.push(pressedKey);
    nextLetter++;
}

function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter--;
}

function checkGuess() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = "";
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length !== 5) {
        toastr.error("Not enough letters!");
        return;
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!");
        return;
    }

    for (let i = 0; i < 5; i++) {
        let letterColor = "";
        let box = row.children[i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i]);
        //is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'gray';
        } else {
            //now letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
                letterColor = 'green';
            } else {
                //shade box yellow
                letterColor = 'yellow';
            }
        }

        rightGuess[letterPosition] = '#';

        let delay = 250 * i;
        setTimeout(() => {
            //flip box
            animateCSS(box, "flipInX");
            //shadebox
            box.style.backgroundColor = letterColor;
            shadeKeyboard(letter, letterColor);
        }, delay);
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game Over!");
        guessesRemaining = 0;
        return;
    } else {
        guessesRemaining--;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game Over!");
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }

    function shadeKeyboard(letter, color) {
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if (elem.textContent.toLowerCase() === letter) {
                let oldColor = elem.style.backgroundColor;
                if (oldColor === 'green') {
                    return;
                }


                if (oldColor == 'yellow' && color !== 'green') {
                    return;
                }

                elem.style.backgroundColor = color;
                break;
            }
        }
    }
}

document.getElementById("keyboard-cont").addEventListener('click', (e) => { //makes screen keyboard work
    const target = e.target;
    if (!target.classList.contains("keyboard-button")) {
        return;
    }

    let key = target.textContent;

    if (key === "Del") {
        key = 'Backspace';
    }

    document.dispatchEvent(new KeyboardEvent('keyup', { 'key': key }))
});

const animateCSS = (element, animation, prefix = 'animate__') =>
    //we create a new Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        //const node = document.querySelector(element);
        const node = element;
        node.style.setProperty('--animate-duration', '0.3s');

        node.classList.add(`${prefix}animated`, animationName);

        //When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        }
    });


// Addition 1: Reset button to restart the game
resetButton.addEventListener('click', () => {
    resetGame()
});

function resetGame() {
    defaultState();
    initBoard();
    resetKeyboard();
    isTimedMode = false;

    console.log(rightGuessString);
    toastr.info("Restarting game!");
}

function resetKeyboard() {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = '';
    }
}

// Addition 2: Timed Mode
timeButton.addEventListener('click', () => {
    resetGame();
    isTimedMode = true;

    time = startingMinutes * 60;
    updateCountdown;
})