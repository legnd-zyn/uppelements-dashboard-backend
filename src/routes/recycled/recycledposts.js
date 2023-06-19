const express = require("express");
const postModel = require("../posts/schema/create-post-schema");
const UserModel = require("../schemas/create-user-schema.js");
const RecycledPostModel = require("./schema/recycled-post-schema.js");
const router = express.Router();

///post/recycledpost endpoint
router.get("/", async (req, res) => {
  let { q, filter, subcategory, page, perPage } = req.query;

  page = parseInt(page) || 1;
  perPage = parseInt(perPage) || 10;

  const queryTitle = q ? { title: { $regex: q, $options: "i" } } : {};
  const queryCategory = filter ? { category: filter } : {};
  const querySubcategory = subcategory ? { subCategory: subcategory } : {};
  const finalQuery = {
    $and: [queryTitle, queryCategory, querySubcategory],
  };

  const totalDocuments = await postModel.countDocuments(finalQuery);
  const totalPages = Math.ceil(totalDocuments / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalDocuments);

  const postsData = await RecycledPostModel.find(finalQuery, {
    image: 0,
    body: 0,
  })
    .skip(startIndex)
    .sort({ createdAt: "desc" })
    .limit(perPage)
    .exec();

  const posts = postsData.map((data) => {
    const post = data.toObject();
    const published = new Date(post.createdAt).toDateString();
    return { ...post, published };
  });

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  res.status(200).json({
    result: posts,
    total: totalDocuments,
    showing: `${startIndex + 1}-${endIndex}`,
    hasPrevious,
    hasNext,
  });
});

router.get("/image/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const image = await RecycledPostModel.findOne(
      { slug: slug },
      { image: 1, _id: 0 }
    );
    const bufObj = Buffer.from(image.image.data, "base64");

    res.contentType(image.image.contentType);
    return res.status(200).send(Buffer.from(bufObj, "binary"));
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Something went wrong please retry!" });
  }
});

router.use(async (req, res, next) => {
  try {
    const { id } = req.query;
    const updatedPost = await RecycledPostModel.findById(id);
    const requesterId = req.user._id.toString();
    // const ownPost = updatedPost.author.toString() === requesterId;

    const adminId = (
      await UserModel.findById(updatedPost.author.toString(), { promotedBy: 1 })
    )?.promotedBy?.toString();
    const requesterIsAdmin = requesterId === adminId;

    if (!requesterIsAdmin && req.role !== "super-admin") {
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

router.get("/restore", async (req, res) => {
  try {
    const post = req.post;

    const originalPost = new postModel({
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
    });

    await originalPost.save();

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
