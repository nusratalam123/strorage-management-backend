import { Router } from "express";
import { getFavoriteItems } from "../controller/favorite.controller";

const router = Router();

router.get("/all/:userId", getFavoriteItems);

export default router;
