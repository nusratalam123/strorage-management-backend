const secrets = {
  client_url: "",
  email_user: process.env.EMAIL_USER,

  PORT: process.env.PORT || 8080,
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017",

  authorization_secret: process.env.AUTHORIZATION_SECRET as string,

  token_secret: process.env.TOKEN_SECRET as string,
  jwt_secret: process.env.JWT_SECRET as string,
};

export default secrets;
