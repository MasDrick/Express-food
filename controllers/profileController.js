const UserProfile = require('../models/UserProfile');
const path = require('path');
const fs = require('fs');

class ProfileController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const profile = await UserProfile.getByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Server error while fetching profile' });
    }
  }
  
  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { phone, card_number } = req.body;
      
      // Handle profile image if uploaded
      let profile_image = null;
      if (req.file) {
        // Save the file path relative to the uploads directory
        profile_image = `/uploads/profiles/${req.file.filename}`;
      }
      
      const updatedProfile = await UserProfile.updateProfile(userId, {
        phone,
        card_number,
        profile_image: profile_image || req.body.profile_image
      });
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error while updating profile' });
    }
  }
  
  // Get order history
  async getOrderHistory(req, res) {
    try {
      const userId = req.user.id;
      
      const orders = await UserProfile.getOrderHistory(userId);
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ message: 'Server error while fetching order history' });
    }
  }
  
  // Get profile image
  async getProfileImage(req, res) {
    try {
      const userId = req.params.userId;
      
      const profile = await UserProfile.getByUserId(userId);
      
      if (!profile || !profile.profile || !profile.profile.profile_image) {
        // Return default image
        return res.sendFile(path.join(__dirname, '../uploads/default-profile.jpg'));
      }
      
      // Check if the image is a URL or a local file
      if (profile.profile.profile_image.startsWith('http')) {
        return res.redirect(profile.profile.profile_image);
      }
      
      // Local file path
      const imagePath = path.join(__dirname, '..', profile.profile.profile_image);
      
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      } else {
        // Return default image if file doesn't exist
        return res.sendFile(path.join(__dirname, '../uploads/default-profile.jpg'));
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      res.status(500).json({ message: 'Server error while fetching profile image' });
    }
  }
}

module.exports = new ProfileController();