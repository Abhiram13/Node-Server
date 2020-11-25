import { Mongo } from "..";
import { IOperations } from '../typedef/types';
import { Collection, ObjectID, UpdateWriteOpResult } from "mongodb";

export function Database<T, O>(collection: string, options: O): IOperations<T> {
   let database: Collection<T> = Mongo.client.db("Mordor").collection<T>(collection);

   return {
      FindAll: async () => await database.find({}).toArray(),

      FindById: async () => await database.findOne(options),

      Search: async (request) => {
         if (options) {
            let array: T[] = await database.find({}).toArray();
            let items: T[] = [];
            let string: string = request.body.string;

            for (let i: number = array.length; i--;) {
               let item: { [key: string]: any; } = array[i];

               if (item[options as unknown as string].substring(0, string.length).toUpperCase() === string.toUpperCase()) {
                  items.push(array[i]);
               }
            }

            return items;
         }

         return await database.find({}).toArray();
      },

      Update: async (query) => {
         let updated: UpdateWriteOpResult = await database.updateOne(query, { $set: options }, { upsert: true });
         return updated;
      },
   };
}