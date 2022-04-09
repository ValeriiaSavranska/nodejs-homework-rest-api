const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs").promises;
const gravatar = require("gravatar");
const Jimp = require("jimp");

const { User } = require("../db/userModel");
const {
  DuplicationEmailError,
  UnauthorizedError,
} = require("../helpers/errors");

const NEW_FILE_DIR = path.resolve(process.cwd(), "public/avatars");

const registrationUser = async (body) => {
  const { email, password } = body;

  const findUserByEmail = await User.findOne({ email });
  if (findUserByEmail) {
    throw new DuplicationEmailError("Email in use");
  }

  const avatarURL = gravatar.url(email, { protocol: "http", s: "100" });

  const user = new User({ email, password, avatarURL });
  await user.save();

  return user;
};

const loginUser = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError("Email or password is wrong");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError("Email or password is wrong");
  }

  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_SECRET
  );

  user.token = token;
  await user.save();

  return { token, user };
};

const logoutUser = async (user) => {
  user.token = null;
  await user.save();
};

const patchUser = async (userId, body) => {
  await User.findOneAndUpdate(userId, {
    $set: { subscription: body.subscription },
  });

  const updatedUser = await User.findOne({ userId });

  return updatedUser;
};

const updateAvatar = async (user, file) => {
  const { _id: userId } = user;
  const { path: pathFile, originalname } = file;
  const newFileName = `${userId}-${originalname}`;
  const fileName = path.join(NEW_FILE_DIR, newFileName);

  await Jimp.read(pathFile)
    .then((image) => {
      image.resize(250, 250);
      image.write(pathFile);
    })
    .catch((err) => {
      return new Error(err.message);
    });

  try {
    await fs.rename(pathFile, fileName);
  } catch (err) {
    await fs.unlink(pathFile);
    return new Error("Somesing went wrong!");
  }

  await User.findOneAndUpdate(userId, {
    $set: { avatarURL: fileName },
  });

  return fileName;
};

module.exports = {
  registrationUser,
  loginUser,
  logoutUser,
  patchUser,
  updateAvatar,
};
