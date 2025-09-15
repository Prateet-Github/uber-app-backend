import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

export const register = async (req, res) => {
  const {username, email, password} = req.body;

  try {
    const userExists = await User.findOne({email});

    if(userExists){
      return res.status(400).json({message: 'User already exists'});
    }
    
    const newUser = await User.create({username, email, password});
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role  // Added role field
      }
    });
    
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      message: 'Server Error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});
    
    if(user && (await user.matchPassword(password))){
      const token = generateToken(user._id);
      res.json({ 
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role  // Added role field
        }
      });
    } else {
      res.status(401).json({message: 'Invalid email or password'});
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: "Server error" });
  }
}