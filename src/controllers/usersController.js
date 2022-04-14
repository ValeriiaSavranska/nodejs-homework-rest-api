const {
  registrationUser,
  loginUser,
  logoutUser,
  patchUser,
  updateAvatar,
  verifyUser,
  verificationUserToken,
} = require("../services/usersService");

const singupController = async (req, res, next) => {
  const user = await registrationUser(req.body);

  const { email, subscription } = user;

  res.status(201).json({ user: { email, subscription } });
};

const loginController = async (req, res, next) => {
  const { token, user } = await loginUser(req.body);
  const { email, subscription } = user;

  res.status(200).json({ token, user: { email, subscription } });
};

const logoutController = async (req, res, next) => {
  const user = req.user;

  await logoutUser(user);

  res.status(204).send("No Content");
};

const currentUserController = (req, res, next) => {
  const { email, subscription } = req.user;

  res.status(200).json({ email, subscription });
};

const patchUserController = async (req, res, next) => {
  const { _id: userId } = req.user;
  const updatedUser = await patchUser(userId, req.body);

  res.status(200).json({ user: updatedUser });
};

const avatarUserController = async (req, res, next) => {
  const newFilePath = await updateAvatar(req.user, req.file);

  res.json({ avatarURL: newFilePath });
};

const verifyController = async (req, res, next) => {
  await verifyUser(req.body);
  res.status(200).json({ message: "Verification email sent" });
};

const verificationTokenController = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;

  await verificationUserToken(verificationToken);

  res.status(200).json({ message: "Verification successful" });
};

module.exports = {
  singupController,
  loginController,
  logoutController,
  currentUserController,
  patchUserController,
  avatarUserController,
  verifyController,
  verificationTokenController,
};
