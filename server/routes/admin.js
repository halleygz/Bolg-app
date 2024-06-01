const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const middleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message:
        "The heck are you doing here?? No spot for you, off you go!!!!!!!",
    });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Not again babe, shoot, shoot shoot",
    });
  }
};

//admin route
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "flenn",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// admin check login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid cridentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid cridentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
    // res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// admin register page
router.get("/dashboard", middleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "admin dash",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
//success page
router.get("/register", middleware, async (req, res) => {
  try {
    const locals = {
      title: "Register",
      description: "flenn",
    };
    res.render("admin/register", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
//success page
router.get("/success", middleware, (req, res) => {
  try {
    const locals = {
      title: "Sucess",
      description: "flenn",
    };
    res.render("admin/success", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
//admin registerer page
router.post("/register", middleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedpassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ messge: "internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});
// admin post
router.get("/admin-post", middleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin Post",
      description: "admin dash",
    };
    res.render("admin/admin-post", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
router.post("/admin-post", middleware, async (req, res) => {
  try {
    const nPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });
    await Post.create(nPost);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
router.get("/edit-post/:id", middleware, async (req, res) => {
  try {
    const locals = {
      title: Post.title,
      description: Post.body,
    };
    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      data,
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});
router.put("/edit-post/:id", middleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});
router.delete("/delete-post/:id", middleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
  }
});
router.get('/logout', middleware, async (req, res) => {
  res.clearCookie('token')
  res.redirect('/')
})
module.exports = router;
