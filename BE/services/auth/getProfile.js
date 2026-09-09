import dbService from "../../utilities/dbService";

export const getProfile = async ({ user }) => {
  const userId = user.userId || user.id;
  const userDoc = await dbService.findOneRecord("userModel", { _id: userId });
  if (!userDoc) {
    throw new Error("User not found");
  }
  const userObj = userDoc.toObject();
  delete userObj.password;
  return { user: userObj };
};
