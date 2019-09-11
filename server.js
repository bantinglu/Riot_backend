const express = require('express');
const { Kayn, REGIONS } = require('kayn');
const cors = require('cors');
const searchRouter = require('./routes/search');


const kayn = Kayn(process.env.API_KEY)();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.listen(port, () =>{
    console.log(`Server running on port: ${port}`);
});


app.use('/search', searchRouter);
