import { Router } from "express";
import { copyFavoriteItem, deleteFavoriteItem, duplicateFavoriteItem, getFavoriteItems, renameFavoriteItem, toggleFavoriteItem } from "../controller/favorite.controller";

const router = Router();

//Get All Favorite Items
router.get("/all/:userId", getFavoriteItems);

//copy favorite item
router.post("/copy/:itemId", copyFavoriteItem);

//rename favorite item
router.put("/rename/:itemId", renameFavoriteItem); 

// Duplicate favorite item
router.post("/duplicate/:itemId", duplicateFavoriteItem); 

// Delete favorite item
router.delete("/delete/:itemId", deleteFavoriteItem);

// Share favorite item
// router.post("/share/:itemId", shareFavoriteItem);

// Mark as unfavorite
router.put("/unfavorite/:itemId", toggleFavoriteItem);


export default router;
