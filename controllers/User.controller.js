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
    // 🚨 FIX 1: Missing await - this was always undefined!
    const userExists = await User.findOne({email});

    if(userExists){
      return res.status(400).json({message: 'User already exists'});
    }
    
    const newUser = await User.create({username, email, password});

    const token = generateToken(newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token
    })
    
  } catch (error) {
    // 🚨 FIX 2: Better error handling with actual error details
    console.error('Register Error:', error);
    res.status(500).json({
      message: 'Server Error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne({email});
  if(user && (await user.matchPassword(password))){

    const token = generateToken(user._id);
    res.json({ _id: user._id,
      username: user.username,
      email: user.email,
      token
    })
  }else{
    console.log('Invalid email or password');
    
  } try {
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: "Server error" });
  }
}
