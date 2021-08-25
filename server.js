'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();

app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL)

app.use(express.urlencoded({ extended: true }));

const Users = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

app.post('/signup', async (req, res) => {
  try {
    let authHeader = req.headers.authorization;
    // console.log(authHeader)
    let encodedCredentials = authHeader.split(' ').pop();

    let decodedCredentials = base64.decode(encodedCredentials);

    let [username, password] = decodedCredentials.split(':');

    let hashedPassword = await bcrypt.hash(password, 10);

    const record = await Users.create({ username, password: hashedPassword })

    res.status(201).json(record)
  } catch (e) { res.status(403).send("Error Creating User"); }
})

app.post('/signin', async (req, res) => {

  let basicHeaderParts = req.headers.authorization.split(' ');
  let encodedString = basicHeaderParts.pop();
  let decodedString = base64.decode(encodedString);
  let [username, password] = decodedString.split(':');

  try {
    const user = await Users.findOne({ where: { username: username } })
    const valid = await bcrypt.compare(password, user.password);

    if (valid) {
      res.status(200).json(user);
    } else {
      throw new Error('Invalid User')
    }
  } catch (error) { res.status(403).send('Invalid Login') }
})





// sequelize.sync()
//   .then(() => {
//     app.listen(process.env.PORT, () => console.log('Server up'));
//   })
//   .catch(e => {
//     console.error('Could not start server', e.message)
//   })

module.exports = {
  server: app,
  start: port => {
    app.listen(port, () => {
      console.log(`Server is up on port ${port}`)
    })
  }
}