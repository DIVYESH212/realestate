import dbService from "../../utilities/dbService";
import { decryptPassword, generateJwtTokenFn } from "../../utilities/universal";

export const login = async ({ body }) => {
  const { username, password } = body;

  if (!username || !password) {
    throw new Error("Username and password are required");
  }
 
  const user = await dbService.findOneRecord("userModel", {
    $or: [{ username }, { email: username }],
    isDeleted: { $ne: true }
  });
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await decryptPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const token = await generateJwtTokenFn({ id: user._id, userId: user._id, username: user.username, email: user.email });

  await dbService.updateOneRecord("userModel", { _id: user._id }, { token });

  return { message: "Login successful", token };
};
