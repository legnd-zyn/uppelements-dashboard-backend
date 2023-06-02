const express = require("express");
const UserModel = require("./schemas/create-user-schema.js");
const PostModel = require("./schemas/create-post-schema.js");
const ITSolutionModel = require("./it-solutions/schemas/ITSolutionSchema.js");

const router = express.Router();

router.get("/", async (req, res) => {
  if (
    req.role !== "admin" &&
    req.role !== "moderator" &&
    req.role !== "super-admin"
  ) {
    return res.status(401).json({ error: "Permission Denied" });
  }

  const { filter: searchRole, q: searchUsername, page: initPage } = req.query;

  let page = parseInt(initPage) || 1;
  const perPage = 10;

  const finalQuery = {};

  if (searchRole) {
    finalQuery.role = searchRole;
  }
  if (searchUsername) {
    finalQuery.username = { $regex: searchUsername, $options: "i" };
  }
  finalQuery._id = { $ne: req.user?.id.toString() };

  const startIndex = (page - 1) * perPage;

  const data = await UserModel.find(finalQuery, { password: 0, thumbnail: 0 })
    .sort({
      createdAt: -1,
    })
    .skip(startIndex)
    .limit(perPage + 1);

  const users = data.slice(0, perPage).map((item) => {
    const user = item.toObject();
    return { ...user, createdAt: new Date(user.createdAt).toDateString() };
  });

  const hasMore = data.length > perPage;
  const hasPrevious = startIndex > 0;

  res.status(200).json({ result: users, hasMore, hasPrevious });
});

router.get("/userInfo", async (req, res) => {
  const { userId } = req.query;

  if (req.role === "guest") {
    return res.status(401).json({ message: "Please include user ID" });
  }

  try {
    if (!userId) {
      const counts = await PostModel.countDocuments({
        author: req?.user?._id,
      });

      return res.status(200).send({
        message: "user found",
        user: {
          username: req.user?.username,
          email: req.user?.email,
          moderators: req.user?.moderators,
          totalPosts: counts,
          role: req.user?.role,
        },
      });
    }
    // Find user with matching ID
    const user = await UserModel.findById(userId, {
      username: 1,
      role: 1,
    }).lean();

    const counts = await PostModel.countDocuments({
      author: user._id,
    });

    if (!user) {
      // User not found, return 404 error
      return res.status(404).send({ error: "User not found" });
    }

    // Return user information as JSON
    res
      .status(200)
      .send({ message: "user found", user: { ...user, totalPosts: counts } });
  } catch (err) {
    // Handle error
    console.log(err);
    res.status(500).send({ error: "Internel Server Error!" });
  }
});

router.get("/super-admin", async (req, res) => {
  const adminsFromDb = await UserModel.find(
    { role: "admin" },
    { _id: 1 }
  ).lean();
  const moderatorsFromDb = await UserModel.find(
    { role: "moderator" },
    { _id: 1 }
  ).lean();
  const adminsIdArray = adminsFromDb.map((admin) => admin._id.toString());
  const moderatorsIdArray = moderatorsFromDb.map((moderator) =>
    moderator._id.toString()
  );

  return res
    .status(200)
    .send({ admins: adminsIdArray, moderators: moderatorsIdArray });
});

router.put("/", async (req, res) => {
  if (req.role !== "admin" && req.role !== "super-admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id, newRole } = req.body;
  const adminId = req.user._id.toString();
  try {
    const user = await UserModel.findById(id);
    const admin = await UserModel.findById(adminId);

    if (user.role === "user") {
      user.role = newRole;
      user.promotedBy = adminId;
      admin.moderators = [
        ...new Set([...admin.moderators, user._id.toString()]),
      ];
      await user.save();
      await admin.save();
      return res.status(200).send({ message: "SUCCESS" });
    }

    if (
      ((user.role === "moderator" || user.role === "admin") &&
        adminId === user.promotedBy?.toString()) ||
      req.role === "super-admin"
    ) {
      user.role = newRole;
      if (newRole === "user") {
        admin.moderators =
          [
            ...new Set(
              admin.moderators.filter(
                (item) => item && item.toString() !== user?._id.toString()
              )
            ),
          ] || [];
        await admin.save();
      }
      await user.save();
      return res.status(200).send({ message: "SUCCESS" });
    }

    return res.status(403).send({ error: "UNAUTHORIZED" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Something went wrong please try again later!" });
  }
});

router.post("/thumbnail", async (req, res) => {
  const userId = req.query?.userId || req?.user?.id;
  const { data: imageData } = req.body;

  // decode base64 image data
  const base64Image = imageData.split(";base64,").pop();
  const imageBuffer = Buffer.from(base64Image, "base64");

  try {
    // find user by ID
    const user = await UserModel.findById(userId);

    if (userId !== user._id.toString()) {
      res.status(401).send({ error: "Unauthorized" });
    }

    // update user thumbnail
    user.thumbnail = {
      name: user.username + "_thumbnail",
      data: imageBuffer,
    };

    // save user
    await user.save();

    res.status(200).send({ message: "Image saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving image");
  }
});

router.get("/thumbnail", async (req, res) => {
  const userId = req.query.userId;

  try {
    // find user by ID and select thumbnail field only
    const user = await UserModel.findById(userId).select("thumbnail");

    if (!user || !user.thumbnail || !user.thumbnail.data) {
      res.status(404).send("Image not found");
      return;
    }

    // send image data to client
    res.set("Content-Type", "image/jpeg");
    res.status(200).send(user.thumbnail.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting image");
  }
});

router.get(
  "/admins",
  (req, res, next) => {
    if (req.role !== "super-admin") {
      return res.status(401).send({ error: "Permission denied" });
    }
    next();
  },
  async (req, res) => {
    try {
      const admins = await UserModel.find(
        { role: "admin" },
        { _id: 1, username: 1 }
      );
      const adminIds = admins?.map(({ _id, username }) => ({
        id: _id.toString(),
        username,
      }));
      return res.status(200).send({ admins: adminIds });
    } catch (error) {
      res.status(500).send({ error: "Server Error" });
    }
  }
);

module.exports = router;
