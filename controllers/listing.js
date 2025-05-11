const Listing = require("../models/listing");

module.exports.index= async (req, res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs", { allListings });
     };

module.exports.renderNewForm= (req, res) => {
    console.log(req.user);
     res.render("listings/new.ejs");
 };

module.exports.showListing= async (req, res) =>{
     let {id} = req.params;
     const listing = await Listing.findById(id)
     .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
     })
     .populate("owner"); 

     if(!listing) {
        req.flash("error", "listing you requested for doess not exist");
        return res.redirect("/listings");
     }
     res.render("listings/show.ejs", { listing });
 };

 module.exports.createListing =async (req, res, next) => {
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "send valid data for listing");
    // }
        const newListing= new Listing(req.body.listing);
       newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    };


module.exports.renderEditForm= async (req, res) => {
     let {id} = req.params;
     const listing = await Listing.findById(id);
     res.render("listings/edit.ejs", { listing });
 };


 module.exports.updateLisitng=async (req, res) => {
      // if(!req.body.listing) {
      //     throw new ExpressError(400, "send valid data for listing");
      // }
      let { id } = req.params;
      
      await Listing.findByIdAndUpdate(id, {...req.body.listing });
     req.flash("success", "Listing Updated");
 
      res.redirect(`/listings/${id}`);
  };

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
