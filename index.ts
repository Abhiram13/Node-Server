import { Application, NextFunction } from "express";
import e from "express";
import bodyparser from "body-parser";
import { MongoClient } from "mongodb";
import { Authorisation, TOKEN } from './helpers/helper';
import { Item } from './src/Items';
import { Users } from './src/Users';

export const app: Application = e();
export class Mongo {
   static URI: string = "mongodb+srv://abhiramDB:abhiram13@myfirstdatabase.l8kvg.mongodb.net/Mordor?retryWrites=true&w=majority";
   static client: MongoClient = new MongoClient(Mongo.URI, { useUnifiedTopology: true });   
   static async Connect(): Promise<void> {
      try {
         await Mongo.client.connect();
         Mongo.client.db("Mordor");         
      } catch (e: any) {
         console.log(e.Message);
      }
   }
}

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// All Routes including /item/ will be needed authorisation
// Once approved, the function will trigger next() method 
app.all("/item/*", async function(req: e.Request, res: e.Response, next: NextFunction) {
   if (await Authorisation.Token(req.headers.token!)) {
      next();
   } else {
      res.status(401).send("UnAuthorised").end();
   }
});

app.get("/", function(req: e.Request, res: e.Response) {   
   res.send("Sent Data");
});

app.get("/item/findall", (req: e.Request, res: e.Response) => Item.FetchAll(req, res));
app.get("/item/findone/:id", (req: e.Request, res: e.Response) => Item.FindById(req, res));
app.post("/item/search", (req: e.Request, res: e.Response) => Item.Search(req, res));
app.post("/users/login", (req: e.Request, res: e.Response) => Users.Login(req, res));

app.listen(1996, function() {
   Mongo.Connect();
   console.log('Example app listening on port 1996!');
});