export default () => ({
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expireAccess: process.env.JWT_ACCESS_EXPIRES_IN,
    expireRefresh: process.env.JWT_REFRESH_EXPIRES_IN,
  },
});
