const dropzoneBox = document.getElementsByClassName("dropzone-box")[0];
const inputFiles = document.querySelectorAll(
    ".dropzone-area input[type='file']"
);
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
                    // SVG conversion needs different handling
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