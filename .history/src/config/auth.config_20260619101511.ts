export default () => ({
  auth: {
    accessSecret: process.env.DATABASE_URL,
    refreshSecret: process.env.DATABASE_URL,
    expireAccess: process.env.DATABASE_URL,
    ex: process.env.DATABASE_URL,
  },
});
