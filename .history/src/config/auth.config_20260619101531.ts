export default () => ({
  auth: {
    accessSecret: process.env.DATABASE_URL,
    refreshSecret: process.env.DATABASE_URL,
    expireAccess: process.env.JWT_ACCESS_EXPIRES_IN,
    expireRefresh: process.env.DATABASE_URL,
  },
});
