const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Get user info including profile data
    const userInfo = await User.getUserInfo(userId);
    
    if (!userInfo) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(userInfo);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля пользователя' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, card_number, discount_percent, profile_image } = req.body;
    
    // Validate input if needed
    
    // Update user info
    const updatedUser = await User.updateUserInfo(userId, {
      phone,
      card_number,
      discount_percent,
      profile_image
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля пользователя' });
  }
};


// На
const bcrypt = require('bcryptjs');