const crypto = require("crypto");
const cloudinary = require("../cloud");

exports.sendError = (res, error, statusCode = 401) => {
  return res.status(statusCode).json({ error });
};

exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const buffString = buff.toString("hex");
      console.log(buffString);

      resolve(buffString);
    });
  });
};

exports.uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    {
      gravity: "face",
      height: 500,
      width: 500,
      crop: "thumb",
    }
  );

  return { url, public_id };
};

exports.handleNotFound = (req, res) => {
  this.sendError(res, "Not found", 404);
};

exports.formatActor = (actor) => {
  const { name, gender, about, _id, avatar } = actor;
  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url,
  };
};

exports.parseData = (req, res, next) => {
  const { trailer, cast, genres, tags, writers } = req.body;

  console.log("trailerInfo:", trailer);
  console.log("cast:", cast);
  console.log("genres:", genres);
  console.log("tags:", tags);
  console.log("writers:", writers);

  if (cast) req.body.cast = JSON.parse(cast);
  if (genres) req.body.genres = JSON.parse(genres);
  if (tags) req.body.tags = JSON.parse(tags);
  if (writers) req.body.writers = JSON.parse(writers);
  if (trailer) req.body.trailerInfo = JSON.parse(trailer);

  next();
};
