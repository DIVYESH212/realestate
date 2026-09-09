export const getOwnerId = (user) => user?.userId || user?.id || user?._id;
