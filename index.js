let net;
const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();

async function app() {
  console.log('Loading mobilenet...');

  // Load the model.
  net = await mobilenet.load();
  console.log('Successfully loaded model');

  // Make a prediction through the model on our img 
  // const imgEL = document.getElementById('img');
  // const result = await net.classify(imgEL);
  await setupWebcam();
  const addExample = classId => {
    const activation = net.infer(webcamElement, 'conv_preds')
    classifier.addExample(activation, classId)
  }

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam
      const activation = net.infer(webcamElement,  'conv_preds');
      // Get the most likely class and confidence from the calssifier module 
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }
    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator; 
    navigator.getUserMedia = navigator.getUserMedia || navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
    navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true}, stream => {
        webcamElement.srcObject = stream;
        webcamElement.addEventListener('loadeddata', () => resolve(), false);
      },
      error => reject());
    } else {
      reject();
    }
  });
}

app();