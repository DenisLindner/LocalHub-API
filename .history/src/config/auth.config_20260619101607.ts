export default () => ({
  auth: {
    accessSecret: process.env.DATABASE_URL,
    refreshSecret: process.env.JWT_ACCESS_SECRET,
    expireAccess: process.env.JWT_ACCESS_EXPIRES_IN,
    expireRefresh: process.env.JWT_REFRESH_EXPIRES_IN,
  },
});
