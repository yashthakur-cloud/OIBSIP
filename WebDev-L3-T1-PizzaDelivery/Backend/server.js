const dotenv = require('dotenv');
const connectDB = require('./src/db/db');

dotenv.config();

const app = require("./src/app");

connectDB();

const port = process.env.PORT || 3000;
app.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
})

