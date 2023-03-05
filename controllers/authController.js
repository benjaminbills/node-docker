const User = require('../models/userModel');
const bycrypt = require('bcryptjs');
exports.signUp = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashpassword = await bycrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      password: hashpassword,
    });
    res.status(201).json({
      status: 'Success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'user not found',
      });
    }
    const isCorrect = await bycrypt.compare(password, user.password);
    if (isCorrect) {
      console.log(req.sessions);
      res.status(200).json({
        status: 'success',
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'incorrect username or password',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
    });
  }
};
