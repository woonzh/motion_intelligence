import React, { Component } from "react";
import * as posenet from "@tensorflow-models/posenet";
import { isMobile, drawKeypoints, drawSkeleton, drawFace, getNearestName } from "./utils";
import "./css/PoseNet.css";
import openSocket from "socket.io-client";

class PoseNet extends Component {
  static defaultProps = {
    videoWidth: 600,
    videoHeight: 500,
    flipHorizontal: true,
    algorithm: "multi-pose",
    mobileNetArchitecture: isMobile() ? 0.5 : 1.01,
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 20,
    nmsRadius: 20.0,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: "aqua",
    skeletonLineWidth: 2,
    loadingText: "Loading pose detector...",
  };

  constructor(props) {
    super(props, PoseNet.defaultProps);
    this.state = {
      loading: true,
      poseCount: 0
    };
    PoseNet.imgData=[];
    this.faceLocs = [];
    this.ctx = [];
    this.socket = "";
    PoseNet.imgNames = [];
  }

  getCanvas = elem => {
    this.canvas = elem;
  };

  getVideo = elem => {
    this.video = elem;
  };

  async componentWillMount() {
    // Loads the pre-trained PoseNet model
    this.net = await posenet.load(this.props.mobileNetArchitecture);
  }

  async componentDidMount() {
    try {
      await this.setupCamera();
    } catch (e) {
      throw "This browser does not support video capture, or this device does not have a camera";
    } finally {
      this.setState({ loading: false });
    }

    this.detectPose();
    this.imgDataRefresh();
    this.connectToSocket();
  }

  async setupCamera() {
    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw "Browser API navigator.mediaDevices.getUserMedia not available";
    }

    const { videoWidth, videoHeight } = this.props;
    const video = this.video;
    const mobile = isMobile();

    video.width = videoWidth;
    video.height = videoHeight;

    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: mobile ? void 0 : videoWidth,
        height: mobile ? void 0 : videoHeight
      }
    });

    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        // Once the video metadata is ready, we can start streaming video
        video.play();
        resolve(video);
      };
    });
  }

  imgDataRefresh() {
    const updateRGB = (ctx, faceCoords) => {
      let data = ctx.getImageData(
        Math.round(faceCoords.topLeft.x),
        Math.round(faceCoords.topLeft.y),
        Math.round(faceCoords.boxParams.width),
        Math.round(faceCoords.boxParams.height)
      ).data;

      let rgbData = [];
      let rows = [];
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (count == Math.round(faceCoords.boxParams.width)) {
          rgbData = rgbData.concat([rows.slice()]);
          rows = [];
          count = 0;
        }
        rows.push([data[i], data[i + 1], data[i + 2]]);
        count += 1;
      }

      return {
        image: rgbData,
        coord: [Math.round(faceCoords.topLeft.x),Math.round(faceCoords.topLeft.y)]
      }
    };

    const convertFaceCoords = () => {
      if (this.faceLocs.length > 0) {
        let temImgData = [];
        this.faceLocs.forEach((face, index, array) => {
          temImgData = [...temImgData, updateRGB(this.ctx, face)];
        });
        PoseNet.imgData = temImgData;
        // console.log(PoseNet.imgData)
      }
    };

    setInterval(convertFaceCoords, 1000);
  }

  connectToSocket() {
    this.socket = openSocket("http://localhost:9997");

    this.socket.on("my response", function(msg) {
      this.emit("facereg", PoseNet.imgData);
      PoseNet.imgNames = msg["data"];
      // console.log(msg);
    });

    this.socket.emit("facereg", PoseNet.imgData);
  }

  detectPose() {
    const { videoWidth, videoHeight } = this.props;
    const canvas = this.canvas;
    this.ctx = canvas.getContext("2d");

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    this.poseDetectionFrame(this.ctx);
  }

  poseDetectionFrame(ctx) {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      maxPoseDetections,
      minPartConfidence,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth
    } = this.props;

    const net = this.net;
    const video = this.video;

    const poseDetectionFrameInner = async () => {
      let poses = [];

      switch (algorithm) {
        case "single-pose":
          const pose = await net.estimateSinglePose(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride
          );

          poses.push(pose);

          break;
        case "multi-pose":
          poses = await net.estimateMultiplePoses(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride,
            maxPoseDetections,
            minPartConfidence,
            nmsRadius
          );

          break;
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (showVideo) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores

      let confidentPoses = poses.filter(({ score, keypoints }) => {
        return score > minPoseConfidence;
      });

      this.props.handlePoseChange(confidentPoses.length);

      this.temFaceLocs = [];
      
      

      poses.forEach(({ score, keypoints }, index) => {
        if (score >= minPoseConfidence) {
          if (showPoints) {

            let faceCoords = drawFace(keypoints, ctx, PoseNet.imgNames);
            this.temFaceLocs = [...this.temFaceLocs, faceCoords];

            drawKeypoints(keypoints, minPartConfidence, skeletonColor, ctx);
          }
          if (showSkeleton) {
            drawSkeleton(
              keypoints,
              minPartConfidence,
              skeletonColor,
              skeletonLineWidth,
              ctx
            );
          }
        }
      });
      this.faceLocs = this.temFaceLocs;
      //console.log(this.faceLocs)

      requestAnimationFrame(poseDetectionFrameInner);
    };

    poseDetectionFrameInner();
  }

  render() {
    const loading = this.state.loading ? (
      <div className="PoseNet__loading">{this.props.loadingText}</div>
    ) : (
      ""
    );
    // console.log("PoseCount: ", this.state.poseCount);

    return (
      <div className="PoseNet">
        {loading}
        <video id="video" playsInline ref={this.getVideo} />

        <canvas ref={this.getCanvas} />
      </div>
    );
  }
}

export default PoseNet;
