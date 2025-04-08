import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Hls from "hls.js";

function StreamViewer() {
  const { id } = useParams();
  const [stream, setStream] = useState(null);
  const [videoElement, setVideoElement] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/stream/${id}`)
      .then((response) => {
        console.log("Stream data:", response.data);
        setStream(response.data);
      })
      .catch((error) => console.error("Error fetching stream:", error));
  }, [id]);

  useEffect(() => {
    if (videoElement) {
      console.log("Video element is set:", videoElement);
    }
  }, [videoElement]);

  useEffect(() => {
    if (stream && stream.is_live && stream.stream_url && videoElement) {
      console.log("Setting up HLS for URL:", stream.stream_url);
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream.stream_url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch((err) => {
            console.error("Playback error:", err);
          });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = stream.stream_url;
        videoElement.addEventListener("loadedmetadata", () => {
          videoElement.play().catch((err) => {
            console.error("Playback error:", err);
          });
        });
      } else {
        console.error("HLS is not supported in this browser.");
      }
    }
  }, [stream, videoElement]);

  if (!stream) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{stream.title}</h2>
      <p>Category: {stream.category}</p>
      <p>Tags: {stream.tags}</p>
      <p>Status: {stream.is_live ? "Live Now!" : "Offline"}</p>
      {stream.is_live && stream.stream_url ? (
        <video
          ref={(el) => {
            setVideoElement(el);
          }}
          controls
          autoPlay
          muted // Add muted for testing auto-play policies
          style={{ width: "640px", height: "480px", backgroundColor: "#000" }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>The stream is not live at the moment.</p>
      )}
      
    </div>
  );
}

export default StreamViewer;
