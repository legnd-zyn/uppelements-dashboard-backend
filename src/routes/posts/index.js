const express = require("express");
const multer = require("multer");
const PostModel = require("./schema/create-post-schema.js");
const UserModel = require("../schemas/create-user-schema.js");
const RecycledPostModel = require("../recycled/schema/recycled-post-schema.js");
const crypto = require("crypto");
const recycledPost = require("../recycled/recycledposts");

const router = express.Router();

// api/post
router.use("/recycledpost", recycledPost);

router.get("/my-posts", async (req, res) => {
  try {
    const {
      query = "",
      category = "",
      subcategory = "",
      page = 1,
      perPage = 9,
      isascending = false,
      authorId = req?.user?._id,
    } = req.query;

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    const isAuthor = authorId ? { author: authorId } : {};

    const FilterationRegexObject = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } },
      ],
      category: { $regex: category, $options: "i" },
      subCategory: { $regex: subcategory, $options: "i" },
      ...isAuthor,
    };

    const matchingPosts = await PostModel.find(FilterationRegexObject)
      .select("-image -body")
      .sort({ createdAt: isascending == "true" ? "asc" : "desc" })
      .skip(startIndex)
      .limit(perPage);

    const totalDocuments = await PostModel.countDocuments(
      FilterationRegexObject
    );

    const totalPages = Math.ceil(totalDocuments / perPage);

    const posts = matchingPosts.map((post) => ({
      ...post.toObject(),
    }));

    const hasPrevious = page > 1;
    const hasNext = endIndex < totalDocuments;

    res.status(200).json({
      posts,
      total: totalDocuments,
      currentPage: page,
      totalPages,
      hasPrevious,
      hasNext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/postsforfeed", async (req, res) => {
  const postsData = await PostModel.find({}, { body: 0, image: 0 })
    .sort({ createdAt: -1 })
    .exec();
  return res.send({ result: postsData });
});

// Get Single Post

router.get("/image/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const image = await PostModel.findOne({ slug: slug }, { image: 1, _id: 0 });
    const bufObj = Buffer.from(image.image.data, "base64");

    res.contentType(image.image.contentType);
    return res.status(200).send(Buffer.from(bufObj, "binary"));
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Something went wrong please retry!" });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("image"), async (req, res) => {
  if (
    req.role !== "moderator" &&
    req.role !== "admin" &&
    req.role !== "super-admin"
  ) {
    return res.status(403).send({ error: "UNAUTHORIZED" });
  }
  const { title, body, category, subCategory, description } = req.body;

  const slug = crypto
    .createHash("sha256")
    .update(title)
    .digest("hex")
    .substring(0, 16);

  const image = new Buffer.from(req.file.buffer).toString("base64");

  const post = new PostModel({
    title,
    body,
    author: req.user.id.toString(),
    category,
    subCategory,
    description,
    slug,
    image: {
      data: image,
      contentType: req.file.mimetype,
    },
  });
  await post.save().catch((err) => console.log(err));

  res.status(200).send({ message: "SUCCESS" });
});

router.use(async (req, res, next) => {
  try {
    const { id } = req.query;
    const updatedPost = await PostModel.findById(id);

    if (!updatedPost) {
      return res.status(404).send({ message: "No post found!" });
    }

    const requesterId = req.user._id.toString();
    const ownPost = updatedPost?.author.toString() === requesterId;

    const adminId = (
      await UserModel.findById(updatedPost.author.toString(), { promotedBy: 1 })
    )?.promotedBy?.toString();
    const requesterIsAdmin = requesterId === adminId;

    if (!ownPost && !requesterIsAdmin && req.role !== "super-admin") {
      return res
        .status(401)
        .send({ error: "You have no rights to edit or delete this post!" });
    }
    req.post = updatedPost;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "server error" });
  }
});

router.put("/", upload.single("image"), async (req, res) => {
  try {
    let imageBuffer;

    // Getting post from middleware
    const updatedPost = req.post;

    if (req.file) {
      imageBuffer = new Buffer.from(req.file.buffer).toString("base64");
    }

    const { title, body, category, description, subCategory } = req.body;

    if (title) {
      updatedPost.title = title;
    }
    if (body) {
      updatedPost.body = body;
    }
    if (category) {
      updatedPost.category = category;
    }
    if (subCategory) {
      updatedPost.subCategory = subCategory;
    }
    if (description) {
      updatedPost.description = description;
    }
    if (imageBuffer) {
      updatedPost.image = {
        data: imageBuffer,
        contentType: req.file.mimetype,
      };
    }

    await updatedPost.save();
    res.status(200).send({ message: "SUCCESS", slug: updatedPost.slug });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.delete("/", async (req, res) => {
  try {
    const post = req.post;

    const recycledById = req.user._id.toString();

    const recycledPost = new RecycledPostModel({
      title: post.title,
      description: post.description,
      author: post.author,
      body: post.body,
      slug: post.slug,
      category: post.category,
      subCategory: post.subCategory,
      image: post.image,
      comments: post.comments,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
      recycledBy: recycledById,
    });

    await recycledPost.save();

    await post.remove();

    return res.status(200).send({ message: "SUCCESS" });
  } catch (error) {
    console.log("Deleting Post ", error);
    return res
      .status(500)
      .send({ error: "Something went wrong please try again later!" });
  }
});

module.exports = router;
