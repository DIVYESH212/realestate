import dbService from "../../utilities/dbService";
import { encryptpassword } from "../../utilities/universal";

export const resetPassword = async ({ body }) => {
  const { token, password } = body;
  if (!token || !password) {
    throw new Error("Reset token and new password are required.");
  }

  const cleanToken = token.trim();
  const user = await dbService.findOneRecord("userModel", {
    resetPasswordToken: cleanToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new Error("Reset link is invalid or expired.");
  }

  const hashedPassword = await encryptpassword(password);
  await dbService.findOneAndUpdateRecord("userModel",
    { _id: user._id },
    { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null }
  );

  return { message: "Password reset successful. Please log in with your new password." };
};
