const { sendError } = require("../utils/helper");
const cloudinary = require("../cloud");
const Movie = require("../models/movie");
const { isValidObjectId } = require("mongoose");

exports.uploadTrailer = async (req, res) => {
  const { file } = req;
  if (!file) return sendError(res, "Video file is missing!");

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );
  res.status(201).json({ url, public_id });
};

exports.createMovie = async (req, res) => {
  const { file, body } = req;
  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genre,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = body;

  /*console.log(req.body);
  
  console.log(typeof req.body.trailerInfo);
  console.log(typeof req.body.cast);
  console.log(typeof req.body.genres);
  console.log(typeof req.body.tags);
  console.log(typeof req.body.writers);
  
  res.send("ok");*/

  const newMovie = new Movie({
    title,
    storyLine,
    releaseDate,
    status,
    type,
    genre,
    tags,
    cast,
    trailer,
    language,
  });

  if (director) {
    if (!isValidObjectId(director))
      return sendError(res, "Invalid director id!");
    newMovie.director = director;
  }

  if (writers) {
    for (let writer of writers) {
      if (!isValidObjectId(writer)) return sendError(res, "Invalid writer id!");
    }

    newMovie.writers = writers;
  }

  //uploading poster
  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(file.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 5,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];
  if (breakpoints.length) {
    for (let b of breakpoints) {
      const { secure_url } = b;
      finalPoster.responsive.push(secure_url);
    }
  }

  newMovie.poster = finalPoster;

  await newMovie.save();

  res.status(201).json({
    id: newMovie._id,
    title,
  });
};
