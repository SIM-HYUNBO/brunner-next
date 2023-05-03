import mysql from 'mysql2'

export const connect=()=>{
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'admin',
      database : 'brunner'
  });
       
  connection.connect();
  return connection;      
}

export const close=(connection)=>{
    connection.end();
}

export function execSql(connection, sql, params) {
  let pro = new Promise((resolve,reject) => {
    connection.query(sql, params, function (err, result) {
        if (err) {
          console.log(`Error: ${error} \n ${err.sqlMessage}`);
          reject(err)
        }
        resolve(result);
    });
  })
  return pro;
}