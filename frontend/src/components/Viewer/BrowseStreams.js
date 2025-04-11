// src/components/Viewer/BrowseStreams.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';

function BrowseStreams() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/streams')
      .then(response => setStreams(response.data))
      .catch(error => console.error('Error fetching streams:', error));
  }, []);

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        sx={{ marginBottom: 4, color: '#0D47A1' }}
      >
        Available Streams
      </Typography>
      <Grid container spacing={3}>
        {streams.map((stream) => (
          <Grid key={stream.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardActionArea component={Link} to={`/stream/${stream.id}`}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {stream.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {stream.category || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color={stream.is_live ? "error" : "text.secondary"}>
                    {stream.is_live ? "Live" : "Offline"}
                  </Typography>
                  {stream.tags && (
                    <Typography variant="body2" color="text.secondary">
                      Tags: {stream.tags}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default BrowseStreams;