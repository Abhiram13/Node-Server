import {LoginCredentials} from '../typedef/types';
import {Mongo} from '../index';
import {User} from '../typedef/types';
import {Collection} from 'mongodb';
import {string} from '../methods/string';
import Http from 'http';

export class DefaultUser implements User {
   firstname: string;
   isAdmin: boolean;
   lastname: string;
   password: string;
   username: string;
   [key: string]: string | number | boolean | undefined;

   constructor() {
      this.firstname = "";
      this.isAdmin = false;
      this.lastname = "";
      this.password = "";
      this.username = "";
   }
}

var cookieCache = new Map();

export default class Cookie {
   /** @private */
   static fetchFromHeaders(headers: Http.IncomingHttpHeaders): string {
      const cookie: string = headers.cookie || "";
      const cookies: string[] = cookie?.split(";") || [];
      var encodedAuthentication: string = "";

      for (var i = 0; i < cookies.length; i++) {
         const [name, value] = cookies[i].split("=");

         if (name.trimStart() === "authToken") {
            encodedAuthentication = value;
         }
      }

      return encodedAuthentication || "";
   }

   static create(body: LoginCredentials): string {
      return string.Encode(`${body.username}:${body.password}`);
   }

   /** @private */
   private static decode(cookie: string): LoginCredentials {
      const [usr, pwd] = string.Decode(cookie).split(":");

      return {
         password: pwd,
         username: usr
      };
   }

   static async findUser(headers: Http.IncomingHttpHeaders): Promise<User> {
      const COOKIE: string = this.fetchFromHeaders(headers);
      const USER_CRED: LoginCredentials = this.decode(COOKIE);
      const collection: Collection<User> = Mongo?.client.db("Mordor").collection<User>("users");
      const USER: User = await collection.findOne({username: USER_CRED.username}) || new DefaultUser();

      cookieCache.set(`user_${COOKIE}`, USER);

      return USER;
   }

   static async isValid(headers: Http.IncomingHttpHeaders): Promise<boolean> {
      const token = this.fetchFromHeaders(headers);
      const hasCookie: boolean = cookieCache.has(`user_${token}`);
      var USER: User = hasCookie ? cookieCache.get(`user_${token}`) : await this.findUser(headers);

      return (!USER || !USER.username) ? false : true;
   }
}