import { Mongo, app } from '../index';
import { Application } from "express";
import e from "express";
import { User, NewUser } from '../typedef/types';
import { Collection } from 'mongodb';
import { json } from 'body-parser';
import { TOKEN } from '../helpers/helper';

export class Users {
   static Login(request: e.Request, response: e.Response): void {
      try {
         Mongo.client.db("Mordor").collection<User>("users").findOne({ "username": request.body.username }, async function(err, doc) {
            if (err || Object.keys(doc).length === 0) {
               response.status(400).send({ "message": "No User Found" }).end();
            } else if (doc) {
               TOKEN.generate(`${doc.username}:${doc.password}`);
               let res = await TOKEN.findToken(`${doc.username}:${doc.password}`).then(resp => { return resp; });
               console.log(res);
               response.status(200).send({ "user": doc, "token": res });
            }
         });
      } catch (e) {
         console.log(e);
         response.status(500).send(e).end();
      } 
   }

   static SignUp(request: e.Request, response: e.Response): void {
      try {
         let collection: Collection<User> = Mongo.client.db("Mordor").collection<User>("users");
         collection.findOne({ "username": request.body.username }, function(err, doc) {
            let obj: NewUser = {
               username: request.body.username,
               firstname: request.body.firstname,
               lastname: request.body.lastname,
               password: request.body.password,
               isAdmin: request.body.isAdmin,
            }
         });
      } catch (e) {
         console.log(e);  
         response.status(500).send(e).end();
      }
   }
}