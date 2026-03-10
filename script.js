
// ELEMENTS

const imageCanvas = document.getElementById("imageCanvas");
const imageInput = document.getElementById("fileInput");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const ctx = imageCanvas.getContext("2d");
const imagePlaceholder = document.getElementById("imagePlaceholder");

// GLOBAL VARIABLES

let image = null;
let filename = null;

const filters = {
    brightness: { value: 100, min: 0, max: 200, unit: "%" },
    contrast: { value: 100, min: 0, max: 200, unit: "%" },
    saturation: { value: 100, min: 0, max: 200, unit: "%" },
    grayscale: { value: 0, min: 0, max: 100, unit: "%" },
    sepia: { value: 0, min: 0, max: 100, unit: "%" },
    blur: { value: 0, min: 0, max: 10, unit: "px" },
    hueRotation: { value: 0, min: 0, max: 360, unit: "deg" },
    opacity: { value: 100, min: 0, max: 100, unit: "%" },
    invert: { value: 0, min: 0, max: 100, unit: "%" }
};


// CREATE FILTER SLIDERS

function createFilterElement(name, min, max) {
    const container = document.createElement("div");
    container.classList.add("filter");

    const label = document.createElement("label");
    label.htmlFor = name;
    label.innerText = name;

    const input = document.createElement("input");
    input.type = "range";
    input.id = name;
    input.min = min;
    input.max = max;
    input.value = filters[name].value;

    input.addEventListener("input", function () {
        filters[name].value = this.value;
        applyFilters();
    });

    container.appendChild(label);
    container.appendChild(input);

    return container;
}

Object.keys(filters).forEach(filterName => {
    const el = createFilterElement(filterName, filters[filterName].min, filters[filterName].max);
    document.querySelector(".filters").appendChild(el);
});


// IMAGE UPLOAD

imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    filename = file.name;

    imagePlaceholder.style.display = "none";
    imageCanvas.style.display = "block";

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        image = img;

        ctx.filter = "none";
        ctx.drawImage(img, 0, 0);
        saveSessionState();
    };
});


// APPLY FILTERS

function applyFilters() {
    if (!image) return;

    const filterString = `
        brightness(${filters.brightness.value}%)
        contrast(${filters.contrast.value}%)
        saturate(${filters.saturation.value}%)
        grayscale(${filters.grayscale.value}%)
        sepia(${filters.sepia.value}%)
        blur(${filters.blur.value}px)
        hue-rotate(${filters.hueRotation.value}deg)
        opacity(${filters.opacity.value}%)
        invert(${filters.invert.value}%)
    `.replace(/\s+/g, ' ').trim();

    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.filter = filterString;
    ctx.drawImage(image, 0, 0);

    saveSessionState();
}


// RESET FILTERS
resetBtn.addEventListener("click", function () {
    Object.keys(filters).forEach(key => {
        // Reset to default
        if (["grayscale", "sepia", "hueRotation", "blur", "invert"].includes(key)) {
            filters[key].value = 0;
        } else {
            filters[key].value = 100;
        }
        document.getElementById(key).value = filters[key].value;
    });

    applyFilters();
});


// DOWNLOAD IMAGE

downloadBtn.addEventListener("click", function () {
    if (!image) return;

    const link = document.createElement("a");
    link.download = `${filename || "edited-image"}-edited`;
    link.href = imageCanvas.toDataURL();
    link.click();
    link.remove();
});


// PRESETS

const presets = {
    tealOrange: { brightness: 105, contrast: 140, saturation: 125, grayscale: 0, sepia: 0, blur: 0, hueRotation: -15, opacity: 100, invert: 0 },
    moodyMatte: { brightness: 95, contrast: 115, saturation: 85, grayscale: 0, sepia: 0, blur: 0, hueRotation: -5, opacity: 100, invert: 0 },
    filmFade: { brightness: 108, contrast: 90, saturation: 95, grayscale: 0, sepia: 18, blur: 0, hueRotation: 6, opacity: 100, invert: 0 },
    cyberpunk: { brightness: 110, contrast: 160, saturation: 160, grayscale: 0, sepia: 0, blur: 0, hueRotation: -35, opacity: 100, invert: 0 },
    bleachBypass: { brightness: 100, contrast: 170, saturation: 40, grayscale: 0, sepia: 0, blur: 0, hueRotation: 0, opacity: 100, invert: 0 },
    darkPortrait: { brightness: 92, contrast: 145, saturation: 105, grayscale: 0, sepia: 10, blur: 0, hueRotation: 3, opacity: 100, invert: 0 },
    sunsetGlow: { brightness: 115, contrast: 110, saturation: 140, grayscale: 0, sepia: 30, blur: 0, hueRotation: 8, opacity: 100, invert: 0 },
    highFashion: { brightness: 102, contrast: 165, saturation: 90, grayscale: 0, sepia: 0, blur: 0, hueRotation: -8, opacity: 100, invert: 0 }
};

Object.keys(presets).forEach(presetName => {
    const button = document.createElement("button");
    button.classList.add("btn");
    button.innerText = presetName.replace(/([A-Z])/g, " $1").trim();

    button.addEventListener("click", function () {
        const preset = presets[presetName];
        Object.keys(preset).forEach(key => {
            filters[key].value = preset[key];
            document.getElementById(key).value = preset[key];
        });
        applyFilters();
    });

    document.querySelector(".presets").appendChild(button);
});


// SESSION STORAGE

function saveSessionState() {
    if (!image) return;

    sessionStorage.setItem("editorImage", imageCanvas.toDataURL());
    sessionStorage.setItem("editorFilters", JSON.stringify(
        Object.fromEntries(Object.keys(filters).map(key => [key, filters[key].value]))
    ));
    sessionStorage.setItem("editorFilename", filename);
}

window.addEventListener("load", function () {
    const storedImage = sessionStorage.getItem("editorImage");
    const storedFilters = sessionStorage.getItem("editorFilters");
    const storedFilename = sessionStorage.getItem("editorFilename");

    if (!storedImage) return;

    const img = new Image();
    img.src = storedImage;

    img.onload = function () {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        image = img;
        filename = storedFilename || "edited-image";

        imagePlaceholder.style.display = "none";
        imageCanvas.style.display = "block";

        if (storedFilters) {
            const parsedFilters = JSON.parse(storedFilters);
            Object.keys(parsedFilters).forEach(key => {
                filters[key].value = parsedFilters[key];
                document.getElementById(key).value = parsedFilters[key];
            });
        }

        applyFilters();
    };
});
