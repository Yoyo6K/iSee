const Video = require("../models/videoModel");
const mongoose = require("mongoose");

const EnumVideo = {
  Private: "Private",
  Public: "Public",
  Unlisted: "Unlisted",
};
const formatVideo = (video) => {
  return {
    _id: video._id,
    description: video.description,
    dislikes: video.dislikes,
    dislikesCount: video.dislikesCount,
    likes: video.likes,
    likesCount: video.likesCount,
    user: {
      ownerId: video.ownerId?._id,
      username: video.ownerId?.username,
      logo_path: video.ownerId?.logo_path,
    },
    state: video.state,
    thumbnail_path: video.thumbnail_path,
    title: video.title,
    updatedAt: video.updatedAt,
    uploadAt: video.uploadAt,
    video_path: video.video_path,
    views: video.views,
  };
};

exports.getAllVideos = async (req, res) => {
  try {
    const defaultState = EnumVideo.Public;
    const { page, perPage } = req.query; // Récupérer les paramètres de pagination

    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 1;

    const offset = (pageNumber - 1) * itemsPerPage;

    const videos = await Video.find({ state: defaultState })
      .populate("ownerId")
      .skip(offset)
      .limit(itemsPerPage);
    // Créer un tableau pour stocker les résultats formatés
    let formattedVideos = [];

    // Parcourir chaque document retourné
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      // Extraire les propriétés nécessaires du document et les stocker dans un nouvel objet JSON
      const formattedVideo = formatVideo(video);

      // Ajouter l'objet formaté au tableau des résultats
      formattedVideos.push(formattedVideo);
    }

    res.status(200).send(formattedVideos);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all videos" });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const defaultState = [EnumVideo.Public, EnumVideo.Unlisted];
    const video = await Video.findOne({
      _id: req.params.id.trim(),
      state: defaultState,
    }).populate("ownerId");

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }
    const formattedVideo = formatVideo(video);
    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error fetching video" });
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;

    const isAuthenticated = req.isAuthenticated;

    let videos;

    const { page, perPage } = req.query; // Récupérer les paramètres de pagination

    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    const offset = (pageNumber - 1) * itemsPerPage;

    if (isAuthenticated && userId === req.user?._id?.toString()) {
      videos = await Video.find({ ownerId: userId })
        .populate("ownerId")
        .skip(offset)
        .limit(itemsPerPage);
    } else {
      const defaultState = EnumVideo.Public;
      videos = await Video.find({ ownerId: userId, state: defaultState })
        .populate("ownerId")
        .skip(offset)
        .limit(itemsPerPage);
    }
    if (!videos.length) {
      return res.status(404).send({ error: "No videos found for this user" });
    }
    // Créer un tableau pour stocker les résultats formatés
    let formattedVideos = [];

    // Parcourir chaque document retourné
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      // Extraire les propriétés nécessaires du document et les stocker dans un nouvel objet JSON
      const formattedVideo = formatVideo(video);

      // Ajouter l'objet formaté au tableau des résultats
      formattedVideos.push(formattedVideo);
    }

    res.status(200).send(formattedVideos);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user's videos" });
  }
};

exports.searchVideos = async (req, res) => {
  const query = req.params.query;
  const defaultState = EnumVideo.Public;
   const { page, perPage } = req.query; // Récupérer les paramètres de pagination

   const pageNumber = parseInt(page) || 1;
   const itemsPerPage = parseInt(perPage) || 1;

   const offset = (pageNumber - 1) * itemsPerPage;

  try {
    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
      state: defaultState,
    })
      .populate("ownerId")
      .skip(offset)
      .limit(itemsPerPage);

    if (!videos) {
      return res
        .status(404)
        .send({ error: "No videos found, try something else" });
    }
    // Créer un tableau pour stocker les résultats formatés
    let formattedVideos = [];

    // Parcourir chaque document retourné
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      // Extraire les propriétés nécessaires du document et les stocker dans un nouvel objet JSON
      const formattedVideo = formatVideo(video);

      // Ajouter l'objet formaté au tableau des résultats
      formattedVideos.push(formattedVideo);
    }

    res.status(200).send(formattedVideos);
  } catch (error) {
    res.status(500).send({ error: "Error searching videos" });
  }
};

exports.incrementViewCount = async (req, res) => {
  try {
    const videoId = req.params.id;

    const video = await Video.findById(videoId).populate("ownerId");

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }
    video.views += 1;

    await video.save();

    const formattedVideo = formatVideo(video);

    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error incrementing view count" });
  }
};

exports.likeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId).populate("ownerId");
    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    const userHasLiked = video.likes.includes(userId);
    const userHasDisliked = video.dislikes.includes(userId);

    if (userHasLiked) {
      // retire son like s'il a deja like
      video.likes.pull(userId);
      video.likesCount--;
    } else {
      video.likes.addToSet(userId);
      video.dislikes.pull(userId);
      video.likesCount++;
      if (userHasDisliked) {
        // retire le dislike s'il a deja dislike
        video.dislikesCount--;
      }
    }

    await video.save();
    const formattedVideo = formatVideo(video);

    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error liking the video" });
  }
};

exports.dislikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId).populate("ownerId");
    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    const userHasLiked = video.likes.includes(userId);
    const userHasDisliked = video.dislikes.includes(userId);

    if (userHasDisliked) {
      video.dislikes.pull(userId);
      video.dislikesCount--;
    } else {
      video.dislikes.addToSet(userId);
      video.likes.pull(userId);
      video.dislikesCount++;
      if (userHasLiked) {
        video.likesCount--;
      }
    }

    await video.save();

      const formattedVideo = formatVideo(video);

    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error disliking the video" });
  }
};

exports.changeVideoState = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id?.toString();
    const newState = req.body.state;

    if (!Object.values(EnumVideo).includes(newState)) {
      return res.status(400).send({ error: "Invalid state value" });
    }

    const video = await Video.findById(videoId).populate("ownerId");

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    if (video.ownerId?._id?.toString() !== userId) {
      return res
        .status(403)
        .send({
          error: "You do not have permission to change the state of this video",
        });
    }

    video.state = newState;

    await video.save();

     const formattedVideo = formatVideo(video);

    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error changing video state" });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const destServer = process.env.DEST_SERVER;
    const FILE_URL_PATH = process.env.FILE_URL

    const uploadIdSTR = req.locals.uploadId;
 
    const videoPathLocal = req.files["video"][0].path;
    const videoPath = videoPathLocal.replace(destServer, FILE_URL_PATH);

    const thumbnailPathLocal = req.files["thumbnail"][0].path;
    const thumbnailPath = thumbnailPathLocal.replace(destServer, FILE_URL_PATH);

    const uploadId = mongoose.Types.ObjectId(uploadIdSTR).toString();

    const newVideo = new Video({
      _id: uploadId,
      ownerId: req.user._id,
      thumbnail_path: thumbnailPath,
      video_path: videoPath,
      state: EnumVideo[req.body.state],
      ...req.body,
    });

    const savedVideo = await newVideo.save();

    const formattedVideo = formatVideo(savedVideo);

    res.status(201).send(formattedVideo);
  } catch (error) {
    res.status(500).send({ error: "Error uploading video" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.user._id;

    const video = await Video.findById(videoId)

    if (!video) {
      return res.status(404).send({ error: "Video not found" });
    }

    if (video.ownerId.toString() !== userId.toString()) {
      return res.status(403).send({ error: "You don't have the permission" });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate("ownerId");

    const formattedVideo = formatVideo(updatedVideo);


    res.status(200).send(formattedVideo);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteVideo = async (req, res) => {
try {
  const videoId = req.params.videoId;
  const userId = req.user._id;

const video = await Video.findById(videoId);

if (!video) {
  return res.status(404).send({ error: "Video not found" });
}

if (
  video.ownerId.toString() !== userId.toString() &&
  req.user.isAdmin !== true
) {
  return res.status(403).send({ error: "You don't have the permission" });
}

await Video.findByIdAndDelete(videoId);
  res.status(200).send({ message: "Video deleted" });
} catch (error) {
  res.status(500).send({ error: "Error deleting video" });
}
};