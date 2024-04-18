const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

/*
get and home
*/
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "test dummy",
      description: "Simple blog created",
    };
    let perPage = 4;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

// Routes
// router.get("", (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description:
//       "just starting to learn some express staff cause me found it easier",
//   };
//   res.render("index", { locals });
// });

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "The life of pie",
//       body: `where lorem meets its own shit:                 Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero debitis, earum nostrum, exercitationem consequatur ab eum qui commodi fugiat, fugit cum rem magni nihil! Nesciunt aliquam ducimus tempora rem iusto? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo at eum dolores laudantium labore eveniet, temporibus earum optio mollitia ipsam commodi animi illo! Harum, esse officia? Veritatis reprehenderit possimus officiis!` ,
//     },
//   ]);
// }
// insertPostData();

/* blog displaying route */
// router.get("/post/:id", async (req, res) => {
//   try {
//     const locals = {
//       title: "NodeJs Blog",
//       description: "just starting to learn some express staff cause me found it easier",
//     };

//     let slug = req.params.id;

//     const data = await Post.findById({ _id: slug });
//     res.render("post", { locals, data });
//   } catch (error) {
//     console.log(error);
//   }
// });

router.get("/about", (req, res) => {
  res.render("about");
});
router.get("/contact", (req, res) => {
  res.render("contact");
});
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "something here",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

// search route
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "search",
      description:
        "just starting to learn some express staff cause me found it easier",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecial = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecial, "i") } },
        { body: { $regex: new RegExp(searchNoSpecial, "i") } },
      ],
    });

    res.render("search", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
