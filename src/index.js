// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
import databaseConnection from "./db/index.js";
import app from './app.js';
dotenv.config(
    {path: './.env'}
    );
databaseConnection();

app.listen(process.env.PORT, () => {
    console.log(`server is running at port: ${process.env.PORT}`);
});