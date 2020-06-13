import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {


  devices: any;
  stream: any;
  audioFrequecy: any;
  constraints = {
    audio: { deviceId: '' },
    video: { deviceId: '' }
  }


  constructor() {
  }

  ngOnInit() {
    this.initMediaDevices();
    this.audioAnalyser();
    this.cameraAnalyser();
  }

  async initMediaDevices() {
    this.devices = await navigator.mediaDevices.enumerateDevices();
  }

  async selectDevice(device) {
    if (device.kind === "audioinput")
      this.constraints.audio.deviceId = device.deviceId;
    else if (device.kind === "videoinput") {
      this.constraints.video.deviceId = device.deviceId;
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


  async cameraAnalyser() {
    var stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    var video = document.querySelector("video");
    video.srcObject = stream;
    video.onloadedmetadata = function () {
      video.play();
    }
  }


  async audioAnalyser() {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    var aCtx = new AudioContext()
    var aZer = aCtx.createAnalyser();
    aZer.fftSize = 32;
    var gain = aCtx.createGain();
    var mSrc = aCtx.createMediaStreamSource(stream);
    mSrc.connect(gain);
    gain.connect(aZer);
    //audioRecorder = new Recorder( gain );
    var zeroGain = aCtx.createGain();
    zeroGain.gain.value = 0.0; // 1 to unmute
    gain.connect(zeroGain);
    zeroGain.connect(aCtx.destination);
    let frequencyData = new Uint8Array(aZer.frequencyBinCount);
    this.renderFrame(aZer, frequencyData)
  }



  async audioAnalyser2() {
    debugger;
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    var aCtx = new AudioContext()
    var aZer = aCtx.createAnalyser();
    aZer.fftSize = 32;
    var gain = aCtx.createGain();
    gain.gain.value = 1.0;
    var mSrc = aCtx.createMediaStreamSource(stream);
    mSrc.connect(gain);
    gain.connect(aZer);
    gain.connect(aCtx.destination);
    let frequencyData = new Uint8Array(aZer.frequencyBinCount);
    this.renderFrame(aZer, frequencyData)
  }



  renderFrame(analyser, frequencyData) {
    analyser.getByteFrequencyData(frequencyData);
    this.audioFrequecy = frequencyData;
    let self = this;
    requestAnimationFrame(function () {
      self.renderFrame(analyser, frequencyData);
    });
  }




}
