const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const path = require('path')

app.use(express.json())
app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
  res.redirect('/home/index.html');
});


app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
})
