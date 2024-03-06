// git clone
// have node >= 20
// follow below steps

yarn

cd scripts

// for pdf to images

node pdf2images.js // from pdf folder pdf is converted to images inside imgs -- 300 pages 30sec

// for image split

node img2halves.js // from imgs to splitImgs -- 300 imgs 15sec

// to use google api place service account private key json inside secureKeys folder
// adjust file name to annotate
// and do for text detection out put in out.txt

node gvision.js >> out.txt
