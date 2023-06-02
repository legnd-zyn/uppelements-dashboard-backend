const express = require("express");
const ToolsModel = require("./schema/ToolsModel");
const router = express.Router();

router.get("/my-tools", async (req, res) => {
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

    const matchingPosts = await ToolsModel.find(FilterationRegexObject)
      .select("-image -body")
      .sort({ createdAt: isascending == "true" ? "asc" : "desc" })
      .skip(startIndex)
      .limit(perPage);

    const totalDocuments = await ToolsModel.countDocuments(
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

router.get("/image/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const image = await ToolsModel.findOne({ _id: id }, { image: 1, _id: 0 });
    const bufObj = Buffer.from(image.image.data, "base64");

    res.contentType(image.image.contentType);
    return res.status(200).send(Buffer.from(bufObj, "binary"));
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Something went wrong please retry!" });
  }
});

router.post("/", async (req, res) => {
  const { name, description, keywords, link, image } = req.body;

  try {
    const NewTool = new ToolsModel({
      name,
      description,
      keywords,
      link,
      image,
    });

    await NewTool.save();
    return res.status(201).json({ message: "Tool Added Sucessfully" });
  } catch (error) {
    return res.status(500).json({ error: "something wen't wrong" });
  }
});

module.exports = router;
