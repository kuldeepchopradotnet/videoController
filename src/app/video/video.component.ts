import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  audioDevices: any = [];
  videoDevices: any = [];
  selectedAudioDevice: string = 'Audio Devices';
  selectedVideoDevice: string = 'Video Devices';
  devices: any;
  stream: any;
  audioFrequecy: any;
  constraints = {
    audio: { deviceId: '' },
    video: { deviceId: '' }
  }

  audioStream: MediaStream;
  videoStream: MediaStream;


  constructor() {
  }

  ngOnInit() {
    this.initMediaDevices();
    this.audioAnalyser();
    this.cameraAnalyser();
    let that = this;
    navigator.mediaDevices.ondevicechange = function (event) {
      that.initMediaDevices();
    }
  }

  async initMediaDevices() {
    this.videoDevices = [];
    this.audioDevices = [];
    let devices = await navigator.mediaDevices.enumerateDevices();
    this.audioDevices.push({
      deviceId: "",
      groupId: "",
      kind: "audioinput",
      label: "Off"
    });

    this.videoDevices.push({
      deviceId: "",
      groupId: "",
      kind: "videoinput",
      label: "Off"
    });

   devices.filter(x => (x.kind === 'audioinput' && (this.audioDevices.push(x)) ||
    (x.kind === 'videoinput' && this.videoDevices.push(x))
    )) 
   // this.videoDevices = devices ? devices.filter(x => x.kind === 'videoinput') : [];

   


  }

  async selectDevice(device) {
    if (device.kind === "audioinput") {
      this.constraints.audio.deviceId = device.deviceId;
      this.selectedAudioDevice = device.label;
      if(device.label !== 'Off'){
        this.audioAnalyser(device.deviceId);
      }
      else {
        this.disconnectAudio();
      }
    }
    else if (device.kind === "videoinput") {
      this.constraints.video.deviceId = device.deviceId;
      this.selectedVideoDevice = device.label;
      if(device.label !== 'Off'){
        this.cameraAnalyser(device.deviceId);
      }
      else {
        this.disconnectVideo();
      }
    }
  }

  async enterRoom() {
    var stream = await navigator.mediaDevices.getUserMedia(this.constraints);
    var video = document.querySelector("video");
    video.srcObject = stream;
    video.onloadedmetadata = function () {
      video.play();
    }
  }

  async cameraAnalyser(deviceId?) {
    let constraints: any = { video: true }
    if (deviceId) {
      constraints = { video: { deviceId: deviceId } }
    }
    this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    var video = document.querySelector("video");
    video.srcObject = this.videoStream;
    video.onloadedmetadata = function () {
      video.play();
    }
  }

  async audioAnalyser(deviceId?) {
    let constraints: any = { audio: true }
    if (deviceId) {
      constraints = { audio: { deviceId: deviceId } }
    }
    this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
    var aCtx = new AudioContext()
    var aZer = aCtx.createAnalyser();
    aZer.fftSize = 32;
    var gain = aCtx.createGain();
    var mSrc = aCtx.createMediaStreamSource(this.audioStream);
    mSrc.connect(gain);
    gain.connect(aZer);
    //audioRecorder = new Recorder( gain );
    var zeroGain = aCtx.createGain();
    zeroGain.gain.value = 0.0; // 1 to unmute
    gain.connect(zeroGain);
    zeroGain.connect(aCtx.destination);
    let frequencyData = new Uint8Array(aZer.frequencyBinCount);
    this.renderFrame(aZer, frequencyData);
  }

  renderFrame(analyser, frequencyData) {
    analyser.getByteFrequencyData(frequencyData);
    this.audioFrequecy = frequencyData;
    let self = this;
    requestAnimationFrame(function () {
      self.renderFrame(analyser, frequencyData);
    });
  }


  disconnectVideo() {
    this.videoStream.getTracks().forEach(e => e.stop());
  }

  disconnectAudio() {
    this.audioStream.getTracks().forEach(e => e.stop());
  }


}
