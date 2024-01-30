import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const databaseConnection = async () => {
    mongoose.connect(`${process.env.DATABASE_URL}${DB_NAME}`)
    .then((res) => console.log(`database is connected with ${res.connection.host}`))
    .catch((err) => console.log(err.message));
}
export default databaseConnection;