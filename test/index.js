"use strict;"

const audio = document.getElementById("audio");
const video = document.getElementById("video");

const audioInputSelect = document.querySelector("select#audioSource");
const audioOutputSelect = document.querySelector("select#audioOutput");
const videoSelect = document.querySelector("select#videoSource");
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

function gotDevices(devices) {
	const audioInputId = audioInputSelect.value || null;
	const audioOutputId = audioOutputSelect.value || null;
	const videoInputId = videoSelect.value || null;
	audioInputSelect.textContent = "";
	audioOutputSelect.textContent = "";
	videoSelect.textContent = "";
	for(const device of devices){
		const option = document.createElement("option");
		option.value = device.deviceId;
		if(device.kind === "audioinput"){
			option.text = device.label || "device " + String(audioInputSelect.length+1);
			audioInputSelect.appendChild(option);
			if(option.value === audioInputId) option.selected = true;
		}else if(device.kind === "audiooutput"){
			option.text = device.label || "device " + String(audioOutputSelect.length+1);
			audioOutputSelect.appendChild(option);
			if(option.value === audioOutputId) option.selected = true;
		}else if(device.kind === "videoinput"){
			option.text = device.label || "device " + String(videoSelect.length+1);
			videoSelect.appendChild(option);
			if(option.value === videoInputId) option.selected = true;
		}
	}
}

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
	if (typeof element.sinkId !== 'undefined') {
		element.setSinkId(sinkId)
				.then(() => {
					console.log(`Success, audio output device attached: ${sinkId}`);
				})
				.catch(error => {
					let errorMessage = error;
					if (error.name === 'SecurityError') {
						errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
					}
					console.error(errorMessage);
					// Jump back to first output device in the list as it's the default.
					audioOutputSelect.selectedIndex = 0;
				});
	} else {
		console.warn('Browser does not support output device selection.');
	}
}

function changeAudioOutput() {
	const audioOutput = audioOutputSelect.value;
	attachSinkId(videoElement, audioOutput);
}

function gotAudioStream(stream) {
	window.stream = stream;
	audio.srcObject = stream;
	return navigator.mediaDevices.enumerateDevices();
}

function gotVideoStream(stream) {
	window.stream = stream;
	video.srcObject = stream;
	return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
	console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
	if(error.name === "NotAllowedError"){
	}else if(error.name === "NotReadableError"){
	}else if(error.name === "AbortError"){
	}
}

function changeAudioInput() {
	if(audio.stream){
		for(const stream of audio.stream.getTracks()){
			track.stop();
		}
	}
	const audioSource = audioInputSelect.value;
	const constraints = {
		audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotAudioStream).then(gotDevices).catch(handleError);
}

function changeVideoInput() {
	if(video.stream){
		for(const stream of video.stream.getTracks()){
			track.stop();
		}
	}
	const videoSource = videoSelect.value;
	const constraints = {
		video: {deviceId: videoSource ? {exact: videoSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotVideoStream).then(gotDevices).catch(handleError);
}

audioInputSelect.onchange = changeAudioInput;
audioOutputSelect.onchange = changeAudioOutput;
videoSelect.onchange = changeVideoInput;

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

changeAudioInput();
changeVideoInput();

