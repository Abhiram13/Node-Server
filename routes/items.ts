import express from "express";
import { Database } from '../methods/database';
import { Items } from '../typedef/types';
import { ObjectID } from "mongodb";
import { ServerResponse } from '../methods/response';

const itemRouter = express.Router();

type ObjId = {
   _id: ObjectID
}

itemRouter.get('/findone/:id', (req, res) => {
   const obj: ObjId = {
      _id: new ObjectID(req.params.id),
   }

   Database<Items, ObjId>("items", obj).FindById(req, res);
});

itemRouter.post('/search', async (req, res) => {
   try {
      let items: Items[] = await Database<Items, string>("items", "itemName").Search(req, res);
      new ServerResponse<Items[]>(items, res).Send();
   } catch (e) {
      new ServerResponse<any>(e, res).Send();
   }
});

itemRouter.get('/findall', async (req, res) => {   
   try {
      let items: Items[] = await Database<Items, string>("items", "").FindAll(req, res);
      new ServerResponse<Items[]>(items, res).Send();
   } catch (e: any) {
      new ServerResponse<any>(e, res).Send();
   }
});

export default itemRouter;