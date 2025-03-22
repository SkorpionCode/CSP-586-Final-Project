// src/components/Viewer/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => setProfile(response.data))
    .catch(error => console.error('Error fetching profile', error));
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/profile', profile, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Profile updated!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2>Your Profile</h2>
      <form onSubmit={handleUpdate}>
        <p>Username: {profile.username}</p>
        <p>Email: {profile.email}</p>
        <label>
          Profile Picture URL:
          <input 
            type="text" 
            name="profile_picture" 
            value={profile.profile_picture || ''} 
            onChange={handleChange} 
          />
        </label>
        <br />
        <label>
          Bio:
          <textarea 
            name="bio" 
            value={profile.bio || ''} 
            onChange={handleChange} 
          />
        </label>
        <br />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;