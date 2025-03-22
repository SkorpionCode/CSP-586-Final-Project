// src/components/Viewer/StreamViewer.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function StreamViewer() {
  const { id } = useParams();
  const [stream, setStream] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/stream/${id}`)
      .then(response => setStream(response.data))
      .catch(error => console.error('Error fetching stream:', error));
  }, [id]);

  if (!stream) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{stream.title}</h2>
      <p>Category: {stream.category}</p>
      <p>Tags: {stream.tags}</p>
      <p>{stream.is_live ? 'Live Now!' : 'Offline'}</p>
      <div>
        <h3>Channel Info</h3>
        <p>{stream.channel_info}</p>
      </div>
      <Link to={`/chat/${id}`}>Join Chat</Link>
    </div>
  );
}

export default StreamViewer;