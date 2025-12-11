import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState('/img/team-1.png');
  const [user, setUser] = useState(null);

  const updateProfileImage = (newImage) => {
    setProfileImage(newImage);
  };

  const clearProfileData = () => {
    setProfileImage('/img/team-1.png');
    setUser(null);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await authAPI.getCurrentUser();
      setUser(res.data);
      setProfileImage(res.data?.profilePicture || '/img/team-1.png');
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    profileImage,
    updateProfileImage,
    clearProfileData,
    user,
    setUser,
    fetchUserProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 