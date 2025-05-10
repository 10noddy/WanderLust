const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { ListingSchema } = require("../schema.js"); // ✅
const Listing = require("../models/listing.js");
const{isLoggedIn} =require("../middleware.js");


const validateListings =(req, res, next) => {
    let { error } = ListingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs", { allListings });
     }));
 
 //new route
 router.get("/new", isLoggedIn, (req, res) => {
    console.log(req.user);
     res.render("listings/new.ejs");
 });
 
 //show route
 router.get("/:id", wrapAsync(async (req, res) =>{
     let {id} = req.params;
     const listing = await Listing.findById(id).populate("reviews"); 

     if(!listing) {
        req.flash("error", "listing you requested for doess not exist");
        return res.redirect("/listings");
     }
     res.render("listings/show.ejs", { listing });
 }));
 
 //create route
 router.post("/",
      validateListings,isLoggedIn ,
       wrapAsync(async (req, res, next) => {
     // if(!req.body.listing) {
     //     throw new ExpressError(400, "send valid data for listing");
     // }
         const newListing= new Listing(req.body.listing);
         await newListing.save();
         req.flash("success", "New Listing Created!");
         res.redirect("/listings");
     })
 );
 
 //edit route
 router.get("/:id/edit",isLoggedIn , wrapAsync(async (req, res) => {
     let {id} = req.params;
     const listing = await Listing.findById(id);
     res.render("listings/edit.ejs", { listing });
 }));
 
 //update route
 router.put("/:id",isLoggedIn , validateListings, wrapAsync(async (req, res) => {
     // if(!req.body.listing) {
     //     throw new ExpressError(400, "send valid data for listing");
     // }
     let { id } = req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing });
    req.flash("success", "Listing Updated");

     res.redirect(`/listings/${id}`);
 }));
 
 //delete route
 router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
     let { id } = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success", "Listing Deleted!");
     res.redirect("/listings");
 }));

 module.exports = router;
 