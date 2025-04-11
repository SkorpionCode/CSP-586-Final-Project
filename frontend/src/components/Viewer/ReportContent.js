// src/components/Viewer/ReportContent.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function ReportContent() {
  const [reportType, setReportType] = useState('stream');
  const [targetName, setTargetName] = useState(''); // Stream title or username
  const [description, setDescription] = useState('');
  // Assuming username is stored locally on login
  const username = localStorage.getItem('username') || 'Anonymous';

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      let reportData = { description, username };
      if (reportType === 'stream') {
        reportData.stream_title = targetName;
      } else if (reportType === 'user') {
        reportData.reported_username = targetName;
      }

      await axios.post('http://localhost:5000/report', reportData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Report submitted!');
      setTargetName('');
      setDescription('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.msg);
      } else {
        alert('Error submitting report: ' + error.message);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" align="center" sx={{ mb: 2, color: '#0D47A1' }}>
            Report Content
          </Typography>
          <Box
            component="form"
            onSubmit={handleReport}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="stream">Stream</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={reportType === 'stream' ? 'Stream Title' : 'Username'}
              variant="outlined"
              fullWidth
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#0D47A1',
                color: '#fff',
                '&:hover': { backgroundColor: '#0A356E' },
              }}
            >
              Submit Report
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ReportContent;