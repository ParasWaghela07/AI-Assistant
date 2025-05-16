const express = require('express');
const app=express();
const cors = require('cors');
require('dotenv').config();
const dbconnect=require('./config/database')
const router=require('./routes/route')
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(router);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

dbconnect();