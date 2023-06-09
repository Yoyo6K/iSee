const Comment = require("../models/commentModel");

exports.getCommentsByVideoId = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const comments = await Comment.find({ videoId: videoId})
      .populate("userId", "username createdAt") //methoed de mongoose pour recuperer les info des users
      .sort({ createdAt: -1 });
    res.status(200).send(comments);
  } catch (error) {
    res.status(500).send({ error: "Error fetching comments" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { videoId, content } = req.body;
    const userId = req.user._id;
   
    const newComment = new Comment({
      videoId,
      userId,
      content,
    });

    const savedComment = await newComment.save();
     const populatedComment = await Comment.findById(savedComment._id).populate(
       "userId"
     );


    res.status(201).send(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error adding comment" });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId).populate(
      "userId",
      "username createdAt"
    );
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    const userHasLiked = comment.likes.includes(userId);
    const userHasDisliked = comment.dislikes.includes(userId);

    if (userHasLiked) {
      // retire son like s'il a deja like
      comment.likes.pull(userId);
      comment.likesCount--;
    } else {
      comment.likes.addToSet(userId);
      comment.dislikes.pull(userId);
      comment.likesCount++;
      if (userHasDisliked) {
        // retire le dislike s'il a deja dislike
        comment.dislikesCount--;
      }
    }

    await comment.save();

    res.status(200).send(comment);
  } catch (error) {
    res.status(500).send({ error: "Error liking the comment" });
  }
};

exports.dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId).populate(
      "userId",
      "username createdAt"
    );
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    const userHasLiked = comment.likes.includes(userId);
    const userHasDisliked = comment.dislikes.includes(userId);

    if (userHasDisliked) {
      comment.dislikes.pull(userId);
      comment.dislikesCount--;
    } else {
      comment.dislikes.addToSet(userId);
      comment.likes.pull(userId);
      comment.dislikesCount++;
      if (userHasLiked) {
        comment.likesCount--;
      }
    }

    await comment.save();

    res.status(200).send(comment);
  } catch (error) {
    res.status(500).send({ error: "Error disliking the comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;
  
    const comment = await Comment.findById(commentId);
  
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }
  
    if (
      comment.userId.toString() !== userId.toString() &&
      req.user.isAdmin !== true
    ) {
      return res.status(403).send({ error: "You don't have the permission" });
    }
  
    await Comment.findByIdAndDelete(commentId);
    res.status(200).send({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting comment" });
  }
  };