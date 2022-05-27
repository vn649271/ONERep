const is_test = true;
module.exports={
    SERVER_URL: (is_test ? "http://localhost" : "http://142.91.3.143"),
    DB_URL: "mongodb://localhost:27017/ntt"
}