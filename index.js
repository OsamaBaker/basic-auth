'use strict';

const server = require('./server')
require('dotenv').config();

let sequelizeOptions = {
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        }
      }
};
let sequelize = new Sequelize(POSTGRES_URI,sequelizeOptions);

server.start(process.env.PORT)