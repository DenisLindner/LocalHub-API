export default () => ({
  auth: {
    accessSecret: process.env.DATABASE_URL,
    refreshSecret: process.env.DATABASE_URL,
    expireAccess: process.env.DATABASE_URL,
    accessSecret: process.env.DATABASE_URL,
  },
});
