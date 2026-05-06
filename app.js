

const body = document.querySelector("body");
const logoImage = document.querySelector(".logo");

const sunIcon = document.querySelector(".icon-sun");
const moonIcon = document.querySelector(".icon-moon");
const allInputs = document.querySelectorAll("input")

const textArea = document.querySelector("#textarea");

const spaceCheckBox = document.querySelector("#space");
const limitCheckBox = document.querySelector("#limit");
const limitInput = document.querySelector("#limit-value");

const totalCharactersElement = document.querySelector(".total-box");
const wordCountElement = document.querySelector(".word-box");
const sentenceCountElement = document.querySelector(".sentence-box");

const noCharacterMessage = document.querySelector(".no-character");
const expandButton = document.querySelector(".see-more");
const collapseButton = document.querySelector(".see-less");
const moreDensity = document.querySelector(".more-density");
const densityContainer = document.querySelector(".densities");




//! CHANGE THEME

const changeTheme = () => {

    const isLight = body.classList.toggle("light");

    sunIcon.style.display = isLight ? "none" : "block"
    moonIcon.style.display = isLight ? "block" : "none"
    textArea.style.backgroundColor = isLight ? "white" : "#21222C"
    textArea.style.color = isLight ? "black" : "inherit"
    logo.src = `assets/images/logo-${isLight ? "light" : "dark"}-theme.svg`
    allInputs.forEach(input => input.classList.toggle("light", isLight));


}


//! INPUT

const handleTextInput = () => {

    let value = textArea.value
    textArea.style.boxShadow = "0 0 20px #C27CF8";
    textArea.style.outline = "none"

    if (limitCheckBox.checked) applyCharacterLimit(value)

    value ? noCharacterMessage.style.display = "none" : noCharacterMessage.style.display = "block"

    countChars()
    countWords()
    countSentences()
    calculateDensity()
}


//! INPUT LIMIT

const applyCharacterLimit = (e) => {

    if (e.key == "Enter") {
        e.preventDefault()

        if (limitInput.value != "") {

            const textAreaMax = textArea.value.slice(0, +limitInput.value)

            if (textAreaMax.length < textArea.value.length) {
                textArea.value = textAreaMax
                totalCharactersElement.textContent = textAreaMax.length
            }
        }
        countWords()
        countSentences()
        calculateDensity()
    }
}



//! Count Chars

const countChars = () => {

    let numberOfChars = spaceCheckBox.checked ? textArea.value.replace(/\s/g, "").length : textArea.value.length
    totalCharactersElement.textContent = numberOfChars;

}


//! Count Words

const countWords = () => {

    let words = textArea.value
        .replace(/[.,;:!?()"\-]/g, ' ')
        .split(" ")
        .filter(word => word.trim() != "")
        .length

    wordCountElement.textContent = words
}


//! Count Sentences

const countSentences = () => {

    const sentences = textArea.value.split(/[.!?]+/).filter(sent => sent.trim() != "").length;
    sentenceCountElement.textContent = sentences

}


//! Letter Density

const calculateDensity = () => {

    densityContainer.innerHTML = ""
    const letters = textArea.value.replace(/[^a-zA-Z]/g, "").split("");
    const totalLetters = letters.length
    const uniqueLetters = [...new Set(letters.map(l => l.toUpperCase()))]

    uniqueLetters.length > 8
        ? expandButton.style.display = "block"
        : expandButton.style.display = "none"

    const densityArr = []


    uniqueLetters.forEach(letter => {

        const numberOfLetter = letters.filter(e => e.toLowerCase() == letter.toLowerCase()).length
        const percentage = ((numberOfLetter / totalLetters) * 100).toFixed(2)

        densityArr.push({
            letter: letter,
            per: Number(percentage),
            num: numberOfLetter,
        })

        densityArr.sort((a, b) => b.per - a.per);
    })

    densityArr.forEach((letter) => {
        const densityDiv = document.createElement("div");
        densityDiv.className = "letter-density"
        densityDiv.innerHTML = `
        <p>${letter.letter}</p>
        <div class="progress">
            <p class="bar" style="width: ${letter.per}%" ></p>
        </div>
        <p class="letter-number">${letter.num} <span class="letter-percentage">(${letter.per}%)</span></p>`
        densityContainer.appendChild(densityDiv)

    })

}


//! SEE more Button

const expandDensityList = () => {
    densityContainer.style.height = "auto"
    expandButton.style.display = "none"
    collapseButton.style.display = "block"
}

const collapseDensityList = () => {
    densityContainer.style.height = "165px"
    expandButton.style.display = "block"
    collapseButton.style.display = "none"
}



//! EVENTS

sunIcon.addEventListener("click", changeTheme);
moonIcon.addEventListener("click", changeTheme);
textArea.addEventListener("input", handleTextInput);
spaceCheckBox.addEventListener("change", countChars);
limitInput.addEventListener("keydown", (e) => applyCharacterLimit(e));
expandButton.addEventListener("click", expandDensityList)
collapseButton.addEventListener("click", collapseDensityList)


limitCheckBox.addEventListener("change", () => {
    limitInput.style.display = limitCheckBox.checked ? "block" : "none"
    if (limitCheckBox.checked) limitInput.value = ""
})
limitInput.addEventListener("input", () => {
    limitInput.value = limitInput.value.replace(/\D/g, "");
    if (limitInput.value.length > 3)
        limitInput.value = limitInput.value.slice(0, 3)
})












