const express = require("express");
const path = require("path");
const multer = require("multer");

const userValidation = require("../../middlewares/userValidation");

const { asyncWrapper } = require("../../helpers/apiHelpers");
const { tokenMiddleware } = require("../../middlewares/tokenMiddleware");

const {
  singupController,
  loginController,
  logoutController,
  currentUserController,
  patchUserController,
  avatarUserController,
} = require("../../controllers/usersController");

const usersRouter = express.Router();

const FILE_DIR = path.resolve(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_DIR);
  },
  filename: (req, file, cb) => {
    const [filename, extension] = file.originalname.split(".");
    cb(null, `${filename}.${extension}`);
  },
});

const uploadMiddleware = multer({ storage: storage });

usersRouter.post("/signup", userValidation, asyncWrapper(singupController));
usersRouter.post("/login", userValidation, asyncWrapper(loginController));
usersRouter.get("/logout", tokenMiddleware, asyncWrapper(logoutController));
usersRouter.get(
  "/current",
  tokenMiddleware,
  asyncWrapper(currentUserController)
);
usersRouter.patch(
  "/avatars",
  tokenMiddleware,
  uploadMiddleware.single("avatar"),
  asyncWrapper(avatarUserController)
);
usersRouter.patch("/", tokenMiddleware, asyncWrapper(patchUserController));

module.exports = usersRouter;
