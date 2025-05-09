const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const Listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

//added commnet in line 12

const mongo_url= "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);   
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions ={
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,  
        httpOnly: true,
    },
}
//use before requires of listing and reviews in line 59
// first flash then routes
app.get("/", (req, res) => {
    res.send("hi ,i am root");
});

app.use(session(sessionOptions));
app.use(flash());


app.use((req, res, next) =>{
    res.locals.success = req.flash("success");

    next();
})


app.use("/listings", Listings);
app.use("/listings/:id/reviews", reviews);



// app.get("/testListening",async  (req, res) => {
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) =>{
    let { statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});
// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = "Something went wrong!";
//     res.status(statusCode).render("error", { err, message: err.message });
// });


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});