// src/components/Viewer/BrowseStreams.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function BrowseStreams() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/streams')
      .then(response => setStreams(response.data))
      .catch(error => console.error('Error fetching streams:', error));
  }, []);

  return (
    <div>
      <h2>Available Streams</h2>
      <ul>
        {streams.map(stream => (
          <li key={stream.id}>
            <Link to={`/stream/${stream.id}`}>
              {stream.title} {stream.is_live && '(LIVE)'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BrowseStreams;