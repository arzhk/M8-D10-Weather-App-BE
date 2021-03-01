const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is missing."],
      unique: [true, "Username already taken."],
      minLength: [3, "Username is too short (3 characters minimum)."],
    },
    password: String,
    firstName: {
      type: String,
      required: [true, "First name is missing."],
      minLength: [3, "Name is too short (3 characters minimum)."],
    },
    lastName: String,
    favourites: [],
    role: {
      type: String,
      enum: ["admin", "user"],
    },
    img: {
      type: String,
      default: "https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else return null;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  return userObject;
};

userSchema.pre("save", async function (next) {
  const user = this;
  user.role = "user";
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const user = this.getUpdate();

  const current = await UserSchema.findOne({ username: user.username });
  const isMatch = await bcrypt.compare(user.password, current.password);

  if (!isMatch) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

const UserSchema = model("users", userSchema);

module.exports = UserSchema;
