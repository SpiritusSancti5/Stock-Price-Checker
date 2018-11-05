var https = require("https"); 
var url = `https://api.iextrading.com/1.0/stock/`;

module.exports = function StockHandler() {
  
  this.fetchStock = (stock) =>
    new Promise((resolve,reject) => 
      https.get(url + stock + "/price" , res =>
        res.on('data', (data) => resolve({stock:stock, price:JSON.parse(data)}))));
    
  this.findLike = (stock,db,ip) => db.collection(ip).findOne({name:stock});
    
  this.saveLike = (stock,db,ip) => db.collection(ip).insertOne({name: stock});
    
  this.relLikes = (stock1, stock2) => stock1.likes - stock2.likes;
    
  this.stockData = async function stockData(stock,db,ip){
    var stockObj = await this.fetchStock(stock);
    if(stockObj)
      return {
        stock: stockObj.stock,
        price: stockObj.price,
        likes: this.findLike(stock,db,ip) ? 1 : 0
      }
  }.bind(this)
}