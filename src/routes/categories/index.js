const express = require("express");
const CategoryModel = require("./schema");
const router = express.Router();

// api/categoris

router.get("/", async (req, res) => {
  const { type = "posts" } = req.query;
  try {
    const categories = await CategoryModel.find(
      { type },
      { category: true, childCategories: 1 }
    );
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong on server" });
  }
});

//  Add New Category
router.post("/", async (req, res) => {
  const { category, childCategories, type } = req.body;

  try {
    const newCategory = await CategoryModel.addCategory({
      category,
      childCategories,
      type,
    });
    res.status(201).json({ message: "Category added successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// extends subcategory
router.post("/add-subcategory/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { subcategory } = req.body;

  try {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.childCategories.push(subcategory);
    category.updatedAt = Date.now();

    const updatedCategory = await category.save();
    res.status(200).json({ childCategories: updatedCategory.childCategories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add subcategory" });
  }
});

router.delete("/add-subcategory/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { subcategory } = req.body;

  try {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.childCategories = category.childCategories.filter(
      (childCateg) => childCateg !== subcategory
    );
    category.updatedAt = Date.now();

    const updatedCategory = await category.save();
    res.status(200).json({ childCategories: updatedCategory.childCategories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to remove subcategory" });
  }
});
router.delete("/delete-category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await CategoryModel.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "SUCESS" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to Delete Category" });
  }
});

module.exports = router;
