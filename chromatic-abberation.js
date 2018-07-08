/*******************************************************************************
 * Offset sliders
 ******************************************************************************/
g_offsetGX = parseInt(document.getElementById('offset-gx').value);
g_offsetGY = parseInt(document.getElementById('offset-gy').value);
g_offsetBX = parseInt(document.getElementById('offset-bx').value);
g_offsetBY = parseInt(document.getElementById('offset-by').value);
function changeOffsetGX(x) { g_offsetGX = parseInt(x); processImage(); }
function changeOffsetGY(x) { g_offsetGY = parseInt(x); processImage(); }
function changeOffsetBX(x) { g_offsetBX = parseInt(x); processImage(); }
function changeOffsetBY(x) { g_offsetBY = parseInt(x); processImage(); }


/**
 * @var ImageData g_imageData Currently loaded image's data.
 */
g_imageData = false;

/**
 * Performs chromatic abberation on an image.
 *
 * @param ImageData ImageData
 *
 * @return ImageData
 */
function processImageData(imageData) {
    // Process image pixels
    var offsetG = (4 * (img.width - g_offsetGX)) + (4 * g_offsetGY * img.width) + 1;
    var offsetB = (4 * (img.width - g_offsetBX)) + (4 * g_offsetBY * img.width) + 2;
    for (var y=0; y<img.height; y++) {
        var stride = y * img.width;
        for (var x=0; x<img.width; x++) {
            var index = 4 * (x + stride);
            imageData.data[index + 1] = imageData.data[index + offsetG];
            imageData.data[index + 2] = imageData.data[index + offsetB];
        }
    }

    return imageData;
}


/**
 * The ShadowCanvas class takes an image and writes it to an offscreen canvas.
 *
 * @param HTMLImageElement image
 */
function ShadowCanvas(image) {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    // Create context
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(image, 0, 0);
    // Grab image data
    this.imageData = this.context.getImageData(0,0, image.width,image.height);
}


/**
 * Processes the loaded image.
 */
function processImage() {
    // Make sure the image has been loaded
    if (false == g_imageData) return console.log('Tried to process without image data.');
    console.log('Processing image with offsets ('+g_offsetGX+','+g_offsetGY+')...');

    // Grab the image data
    var shadowCanvas = new ShadowCanvas(img);
    imageData = shadowCanvas.imageData;

    // Process and draw result to page
    ctx.putImageData(processImageData(imageData), 0, 0);
}



/*******************************************************************************
 * Document load hook.
 ******************************************************************************/
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var img = document.getElementById('img');
img.onload = function() {
    // Make canvas fit image dimensions
    canvas.width  = img.width;
    canvas.height = img.height;

    // Grab the image data
    var shadowCanvas = new ShadowCanvas(img);
    g_imageData = shadowCanvas.imageData;

    // Initial processing
    processImage();
}

// Image upload hook
var files = document.getElementById('img-upload');
files.addEventListener('change', function() {
    if (!this.files || !this.files[0])
        return console.log('Cancelled: ' + this.files[0]);

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
        var fImg = new Image();
        fImg.addEventListener('load', function() {

            // resize canvas
            canvas.width = fImg.width;
            canvas.height = fImg.height;

            // upload and process image
            img = fImg;
            var shadowCanvas = new ShadowCanvas(fImg);
            g_imageData = shadowCanvas.imageData;
            processImage();
            // ctx.putImageData(processImageData(g_imageData), 0, 0);

        });
        fImg.src = e.target.result;
    };
    fileReader.readAsDataURL(this.files[0]);

}, false);
