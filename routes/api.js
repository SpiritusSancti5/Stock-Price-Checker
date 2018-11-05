'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var request = require('request');

var StockHandler = require('../controllers/stockHandler.js');

module.exports = (app,db) => {
  
  var stockHandler = new StockHandler();
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      let stock = req.query.stock;
      let like  = req.query.like || false;
      let ip    = req.connection.remoteAddress;
      
      if(!Array.isArray(stock))
        stock = (req.query.stock).toUpperCase();
    
      async function addLike(stock){
        let obj = await stockHandler.stockData(stock,db,ip);
        if(obj.likes == 0)
          stockHandler.saveLike(obj.stock,db,ip).then((data) => {
            if(data.insertedCount === 1)
              obj.likes = JSON.stringify(data);
          });
        else {
          obj.likes++;
        }
      }
    
    if(!Array.isArray(stock)) {
      addLike(stock);
      stockHandler.stockData(stock,db,ip).then((stkObj) => {
        res.json({stockData: stkObj})
      }).catch(err => console.log(err));
    }
    
    
    if(Array.isArray(stock)){
      let stockData = [];
      stock.forEach((obj,i)=>{
        stock[i] = stock[i].toUpperCase();
        addLike(stock[i]);  
      });
      stockHandler.stockData(stock[0],db,ip).then((obj1) => {
          stockHandler.stockData(stock[1],db,ip).then((obj2) => {
              let stockData = [
                {
                  stock: obj1.stock,
                  price: obj1.price,
                  rel_likes: stockHandler.relLikes(obj1, obj2)
                },
                {
                  stock: obj2.stock,
                  price: obj2.price,
                  rel_likes: stockHandler.relLikes(obj2, obj1)
                }
              ] 
              res.json({stockData});
          })
      })
    }
      
  });
    
};
