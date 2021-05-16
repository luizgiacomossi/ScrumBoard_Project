var mysql = require('mysql');// Para DBase em MYSQL
const http = require('http');//Para lidar com requisiçoes e servidor
const host = 'localhost';
const port = 8000;
var url = require('url'); // para ler URL

const requestListener = function (req, res) {
    let q = url.parse(req.url, true);
    console.log("Minha Query============");

    console.log(q.se);// usa a hash del para selecionar apagar
    var novoUsuario = q.query;
    res.setHeader("Content-Type", "application/json");
    res.setHeader('Access-Control-Allow-Origin', '*'); // permite requisiçoes
    switch (q.pathname) {
        case "/teste":
            res.writeHead(200);
            if (q.search != null) { // para escrever no banco de dados
                // inserir usuario na tabela de usuarios ========================

                let sql = "INSERT INTO tabelaTest(name,year) VALUES ( '" + novoUsuario.adm + "'," + novoUsuario.ano + ")";
                con.query(sql, function (err, result, fields) {
                    if (err) {
                        if (err.errno == 1062) {
                            console.log('Usuario já existe'); //we send the flash msg
                        }
                        else {
                            throw err;
                        }
                    }
                    console.log('Requisição de Novo Usuario');
                });
                var idUser;

                // banco de dados retorna valor do ID do usuario e cria Board =======================
                sql = "SELECT tabelatest.id FROM tabelatest WHERE name = '" + novoUsuario.adm + "' AND year = " + novoUsuario.ano;
                con.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    console.log('Usuario Criado');
                    idUser = result;
                    idUser = JSON.parse(JSON.stringify(idUser));
                    console.log('-------------------------------------------');
                    console.log(idUser[0].id);
                    console.log('-------------------------------------------');


                    // relacionar ADM com board de novo projeto ==================
                    sql = "INSERT INTO board(nameBoard,idadm) VALUES ('" + novoUsuario.board + "'," + idUser[0].id + ")";
                    console.log(sql);
                    con.query(sql, function (err, result, fields) {
                        if (err) throw err;
                        console.log("Projeto Criado");
                        res.end(JSON.stringify(result));
                    });

                });

            }
            else {  // para enviar dados
                let sql = "SELECT tabelatest.name, board.nameboard FROM tabelatest INNER JOIN board ON  tabelatest.id=board.idadm ORDER BY id ASC";
                con.query(sql, function (err, result, fields) {
                    if (err) throw err;
                    console.log('Requisição de Leitura Enviada');
                    res.end(JSON.stringify(result));
                });
            }


            break
        case "/apagar":
            res.writeHead(200);
            console.log("Entrei para apagar usuario");
            let user = JSON.parse(q.query.del);
            let sql = "DELETE FROM board WHERE nameboard='";
            sql += user.nameboard + "'";
            con.query(sql, function (err, result, fields) {
                if (err) throw err;
                console.log('Usuario apagado');
                res.end(JSON.stringify(result));
            });

            break

        case "/backlog":
            console.log("Backlog");
            console.log(q.query);
            // para CARREGAR no QUADRO , load tem id do quadro
            if (q.query.load != null) {
                res.writeHead(200);
                console.log("Carregar Backlog especifico");
                let sql = "SELECT * FROM backlogs WHERE idboard="; // sql para obter backlog
                console.log(q.query.load);
                sql += q.query.load;
                con.query(sql, function (err, result, fields) {
                    if (err) console.log(err);
                    console.log('Enviando backlog da tabela');
                    res.end(JSON.stringify(result));
                });
            }
            // para GUARDAR STORY no QUADRO
            else if (q.query.story != null) {
                res.writeHead(200);
                console.log("Guardar story Backlog especifico");
                let sql = "INSERT INTO backlogs(story,normalEst, safeEst, idboard, depend) VALUES (' "; // sql INSERIR no backlog
                sql += q.query.story + "',";
                sql += q.query.normalEst + ',';
                sql += q.query.safeEst + ',';
                sql += q.query.idboard + ', "'; // id do PROJETO
                sql += q.query.depend + '"';
                sql += ")";

                con.query(sql, function (err, result, fields) {
                    if (err) console.log(err);
                    console.log('Enviando backlog da tabela');
                    res.end(JSON.stringify(result));
                });
            }
            // para APAGAR STORY no QUADRO
            else if (q.query.del!= null) {
                res.writeHead(200);
                console.log("Apagar story Backlog especifico");
                let sql = "DELETE FROM backlogs WHERE id = "; // sql INSERIR no backlog
                sql += q.query.del ;
                con.query(sql, function (err, result, fields) {
                    if (err) console.log(err);
                    console.log('Elemento backlog apagado');
                    res.end(JSON.stringify(result));
                });
            }

            else { // carregar lista de tabelas 
                res.writeHead(200);
                console.log("Acessando lista de Backlogs");
                console.log(q.query.load);
                let sql = "SELECT nameBoard, idBoard FROM board"; // sql para obter backlog
                //sql += q.server.id;
                con.query(sql, function (err, result, fields) {
                    if (err) console.log(err);
                    console.log('Enviando backlog da tabela');
                    res.end(JSON.stringify(result));
                });
            }

            break

        default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Recurso não encontrado" }));
    }
}
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "alejuedu",
    database: "testeDB"
});

con.connect(function (err) {
    if (err) throw err;
    console.log('Conectado ao Banco de Dados');
});
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
