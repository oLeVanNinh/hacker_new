const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(5000, function() {
    console.log("App is running at port 5000")
})