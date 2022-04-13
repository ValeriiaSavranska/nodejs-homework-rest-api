// /* eslint-disable no-undef */
// const jwt = require("jsonwebtoken");

// const { loginUser } = require("../src/services/usersService");
// const { User } = require("../src/db/userModel");

// // eslint-disable-next-line no-undef
// describe("loginController test", () => {
//   // eslint-disable-next-line no-undef
//   it("should return user data, token, status:200", async () => {
//     const fEmail = "test@mail.com";
//     const fPassword = "111";
//     const fUserId = "1";
//     const fToken = jwt.sign(
//       {
//         _id: fUserId,
//       },
//       process.env.JWT_SECRET
//     );
//     const fReq = {
//       body: {
//         email: fEmail,
//         password: fPassword,
//       },
//     };

//     const user = {
//       _id: fUserId,
//       email: fEmail,
//       password: fPassword,
//       subscription: "starter",
//       token: fToken,
//     };

//     // eslint-disable-next-line no-undef
//     jest.spyOn(User, "findOne").mockImplementationOnce(async () => user);

//     const result = await loginUser(fReq.body);

//     expect(result.user.email).toBe(fEmail);
//     expect(result.user.subscription).toBe(user.subscription);
//     expect(result.user.token).toBe(fToken);
//   });
// });
