# Image Conversion Tool Documentation

## Overview

This tool allows users to upload and convert image files to different formats (PNG, JPG, SVG, WebP) using a simple web interface. The application is built with HTML, CSS, and JavaScript.

## File Structure

- `index.html`: The main entry point of the application.
- `script.js`: Contains JavaScript functions for handling file uploads, drag-and-drop functionality, image previews, and conversions.
- `style.css`: Contains CSS styles for the application's user interface.

## index.html

The `index.html` file provides the structure of the web page, including the header, main content, and form for file upload and conversion.

### Code Explanation

- **HTML Structure:** The HTML structure includes a header, main content with a file dropzone, and a description section.
- **File Upload Form:** The form includes an input for file upload and buttons for converting the image to different formats.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Conversion Tool</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Simple Header -->
    <header class="simple-header">
        <h1>File Conversion Tool</h1>
    </header>

    <!-- Main Content -->
    <main class="content">
        <!-- File Dropzone -->
        <form class="dropzone-box">
            <h2>Upload file</h2>
            <p>Click to upload or drag and drop</p>
            <div class="dropzone-area">
                <div class="file-upload-icon">
                    <!-- SVG file upload icon can go here -->
                </div>
                <input type="file" required id="upload-file" name="uploaded-file" accept="image/*">
                <p class="file-info">No Files Selected</p>
            </div>
            <div class="dropzone-actions">
                <button type="button" id="convert-png">PNG</button>
                <button type="button" id="convert-jpg">JPG</button>
                <button type="button" id="convert-svg">SVG</button>
                <button type="button" id="convert-webp">WebP</button>
            </div>
            <div class="dropzone-cancel">
                <button type="button" id="cancel-button">Cancel</button>
            </div>
        </form>

        <!-- Description -->
        <section class="description">
            <h1>About This Tool</h1>
            <p>This tool allows you to easily upload and convert image files to different formats. Simply drag and drop your file into the dropzone, or click to upload. You can then choose to convert your image to PNG, JPG, SVG, or WebP formats with just
                a click of a button.</p>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>
```
### script.js
The script.js file contains the JavaScript functions for handling file uploads, drag-and-drop functionality, image previews, and conversions.

### Code Explanation
- Event Listeners: Set up event listeners for file input changes, drag-and-drop actions, and button clicks for image conversion.
- File Handling: Functions handle file selection and update the dropzone with a preview of the selected image.
- Image Conversion: Functions to convert the image to different formats using a canvas and downloading the converted image.
```script.js
const dropzoneBox = document.getElementsByClassName("dropzone-box")[0];
const inputFiles = document.querySelectorAll(".dropzone-area input[type='file']");
const inputElement = inputFiles[0];
const dropZoneElement = inputElement.closest(".dropzone-area");

inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
        updateDropzoneFileList(dropZoneElement, inputElement.files[0]);
    }
});

dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("dropzone--over");
});

["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("dropzone--over");
    });
});

dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
        inputElement.files = e.dataTransfer.files;
        updateDropzoneFileList(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("dropzone--over");
});

const updateDropzoneFileList = (dropzoneElement, file) => {
    let dropzoneFileMessage = dropzoneElement.querySelector(".file-info");

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            dropzoneFileMessage.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto;"/>
                <p>File size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        dropzoneFileMessage.innerHTML = `
            ${file.name}, ${file.size} bytes
            <p>File size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
    }
};

const convertImage = (format) => {
    const file = inputElement.files[0];
    if (!file) {
        alert("No file selected");
        return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let mimeType;
            switch (format) {
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'jpg':
                    mimeType = 'image/jpeg';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                case 'svg':
                    mimeType = 'image/svg+xml';
                    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                                        <image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
                                     </svg>`;
                    const svgBlob = new Blob([svgData], { type: mimeType });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    downloadImage(svgUrl, `${file.name.split('.')[0]}.svg`);
                    return;
                default:
                    alert("Unsupported format");
                    return;
            }

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                downloadImage(url, `${file.name.split('.')[0]}.${format}`);
            }, mimeType);
        };
    };
    reader.readAsDataURL(file);
};

const downloadImage = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

document.getElementById('convert-png').addEventListener('click', () => convertImage('png'));
document.getElementById('convert-jpg').addEventListener('click', () => convertImage('jpg'));
document.getElementById('convert-svg').addEventListener('click', () => convertImage('svg'));
document.getElementById('convert-webp').addEventListener('click', () => convertImage('webp'));

document.getElementById('cancel-button').addEventListener('click', () => {
    inputElement.value = ""; // Clear the file input
    let dropzoneFileMessage = dropZoneElement.querySelector(".file-info");
    dropzoneFileMessage.innerHTML = `No Files Selected`;
});

dropzoneBox.addEventListener("reset", (e) => {
    let dropzoneFileMessage = dropZoneElement.querySelector(".file-info");
    dropzoneFileMessage.innerHTML = `No Files Selected`;
});

dropzoneBox.addEventListener("submit", (e) => {
    e.preventDefault();
    const myFiled = document.getElementById("upload-file");
    console.log(myFiled.files[0]);
});
```
###style.css
The style.css file contains the styling for the application.

###Code Explanation
- General Styling: Sets up basic styles for the body and other elements.
- Header Styling: Styles for the simple header.
- Content Styling: Styles for the main content area, including the dropzone.
- Dropzone Styling: Styles for the dropzone area, including hover effects and drag-and-drop states.
- Description Styling: Styles for the description section.

```style.css
/* General Styling */
* {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

:root {
    --primary: #2d59fa;
    --primary-hover: #0037ff;
    --bg: #F7F8F9;
    --secondary: #FEFFFF;
    --dropzone-bg: #fff;
    --gray: #D3D3D3;
    --border: #EDF1F3;
    --dropzone-border: #D4DCE6;
    --headline: #211E30;
    --text: #0a090c;
    --primary-text: #F2F7FE;
    --dropzone-over: #F2F7FE;
    --background: #000000;
    --header-height: 64px;
}

body {
    font-family: 'Work Sans', sans-serif;
    background: var(--background);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    padding: 1rem;
    color: var(--text);
}

/* Simple Header Styling */
.simple-header {
    width: 100%;
    height: var(--header-height);
    display: flex;
    padding-left: 20px;
    justify-content: flex-start;
    align-items: center;
    background: var(--background);
    color: var(--primary-text);
    position: fixed;
    top: 0;
}

.simple-header h1 {
    margin: 0;
    font-size: 1.5rem;
}

/* Main Content Styling */
.content {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    max-width: 1200px;
    margin-top: calc(var(--header-height) + 1rem);
    padding: 1rem;
    gap: 2rem;
}

/* Dropzone Styling */
.dropzone-box {
    border-radius: 2rem;
    min-width: 25rem;
    padding: 2rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    border: 1px solid var(--border);
    width: 100%;
    background: var(--dropzone-bg);
}

.dropzone-box h2 {
    font-size: 1.4rem;
    margin-bottom: 0.6rem;
    color: var(--headline);
    text-align: center;
}

.dropzone-box p {
    font-size: 1.15rem;
    color: var(--gray);
    text-align: center;
}

.dropzone-area {
    padding: 1rem;
    position: relative;
    margin-top: 1.5rem;
    min-height: 16rem;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 4px dashed var(--dropzone-border);
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dropzone-description {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
}

.dropzone-area .file-info {
    font-size: 1.1rem;
}

.dropzone-area .file-info p {
    color: var(--headline);
    font-weight: bold;
    font-size: 1rem;
    margin-top: 0.5rem;
}

.dropzone-area [type="file"] {
    cursor: pointer;
    position: absolute;
    opacity: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.dropzone-area .file-upload-icon svg {
    height: 6rem;
    max-width: 6rem;
    width: 100%;
    margin-bottom: 0.5rem;
    stroke: var(--headline);
}

.dropzone-area:hover {
    background: var(--dropzone-over);
}

.dropzone--over {
    border: 2px solid var(--primary);
    background: var(--dropzone-over);
}

.dropzone-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
    gap: 0.5rem;
}

.dropzone-actions button {
    flex-grow: 1;
    min-height: 3rem;
    font-size: 1.2rem;
    border: none;
    border-radius: 0.5rem;
    color: var(--primary-text);
    background: #313339;
    cursor: pointer;
    transition: background 0.3s ease;
}

.dropzone-actions button:hover {
    background: #47494f;
}

.dropzone-cancel {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.dropzone-cancel button {
    flex-grow: 1;
    min-height: 3rem;
    font-size: 30px;
    border: 1px solid;
    border-radius: 1rem;
    color: rgb(233, 233, 233);
    background: rgba(8, 27, 133, 0.685);
    cursor: pointer;
    transition: background 0.3s ease;
}

.dropzone-cancel button:hover {
    background: rgb(4, 3, 73);
}

/* Description Styling */
.description {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 2rem;
    padding: 110px;
    width: 100%;
    max-width: 30rem;
}

.description h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--primary-hover);
}

.description p {
    font-size: 1.15rem;
    color: var(--gray);
    line-height: 1.5;
}
```
