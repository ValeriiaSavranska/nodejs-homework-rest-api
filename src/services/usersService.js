require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs").promises;
const gravatar = require("gravatar");
const Jimp = require("jimp");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../db/userModel");
const {
  ValidationError,
  InvalidUserDataError,
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
  const verificationToken = uuidv4();

  const user = new User({ email, password, avatarURL, verificationToken });
  await user.save();

  sgMail.setApiKey(process.env.SENDGRID_API_TOKEN);
  const msg = {
    to: email,
    from: "rogvaleria59@gmail.com",
    subject: "Сonfirm your mail",
    text: "link for email verification",
    html: `<strong>Link for email verification :</strong><a href="http://localhost:3000/api/users/verify/${verificationToken}">go for confirmation</a>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  return user;
};

const loginUser = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError("Email or password is wrong");
  }

  if (user.verify === false) {
    throw new UnauthorizedError("You must confirm your email to log in");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError("Email or password is wrong");
  }

  console.log(user);

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

const verifyUser = async (body) => {
  const { email } = body;

  if (!email) {
    throw new ValidationError("Missing required field email");
  }

  const user = await User.findOne({ email });

  if (user.verify === true) {
    throw new ValidationError("Verification has already been passed");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_TOKEN);
  const msg = {
    to: email,
    from: "rogvaleria59@gmail.com",
    subject: "Сonfirm your mail",
    text: "link for email verification",
    html: `<strong>Link for email verification :</strong><a href="http://localhost:3000/api/users/verify/${user.verificationToken}">go for confirmation</a>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

const verificationUserToken = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw new InvalidUserDataError("User not found");
  }

  user.verificationToken = "null";
  user.verify = true;

  await user.save();
};

module.exports = {
  registrationUser,
  loginUser,
  logoutUser,
  patchUser,
  updateAvatar,
  verifyUser,
  verificationUserToken,
};
