'use strict';

const app = require('./app');
const router = require('express').Router();

var Firebird = require('node-firebird');
var options = {};
options.host = '127.0.0.1';
options.port = 3051;
options.database = 'd:/bdcli/DISCLOSIL/base27092019/BASEWKL.FDB';
//'c:/FLUTTER/NodeProjects/NodeBalta/src/wklifood.GDB';
//'d:/bdcli/DISCLOSIL/base27092019/BASEWKL.FDB';
//
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 4096;        // default when creating database

const authService = require('./ags_authentic');
const formataData = require('dateformat');


router.get('/', authService.authorize , async (req, res, next) => {
  
    let token = req.headers['x-access-token'] || req.body.token || req.query.token  ;
    const data = await authService.decodeToken( token );
 
    console.log(' >> 1 >> entrou no GET  firebird');

    console.log(' <<< o data inteiro = '+data+'<<<< o token name é '+data.name+ ' e o email é '+data.email
    +'  a lista é '+ data.lista + '  /// o cabeçalho é '+data.header + ' /// o payload é '+data.payload );

    // let cnpjpesquisado = req.header('pjfind');
    // if (cnpjpesquisado in data.lista ) {
    //     return res.status(200).json(data);
    // } else {
    //     return res.status(200).json(cnpjpesquisado + ' nao encontrado ');
    // }

    
    
    let tabela = req.header('tabela');
    if (!(tabela > ''))
        tabela = 'SEG';


    pegarSEQUENT(tabela)
        .then((resultado) => {
            
            res.status(200).send(resultado);

        }).catch((erro) => {
            console.log('mandou status 400');
            res.status(400).send({ mensagem: "erro = " + erro });
        });


});


router.get('/semnulos', (req, res, next) => {

    let tabela = req.header('tabela');
    if (!(tabela > ''))
        tabela = 'SEG';

    console.log(' >> 1 >> entrou no GET  firebird');



   // EM FUNCIONAMENTO OK...ESSA É BOA PQ CONSEGUE FILTRAR OS CAMPOS QUE VIERAM NULO
    pegarQUERY(tabela)
        .then((resultado) => {
            let lista = [];

            resultado.forEach((r) => {  // LOOP EM CADA REGISTRO DA BASE
                let Keys = Object.keys(r);
                let Valores = Object.values(r);
                var valor = '';
                var obj = {};

                for (let index = 0; index < Keys.length; index++) { // LOOP EM CADA CAMPO DO REGISTRO
                    valor = (typeof Valores[index] == 'string' || typeof Valores[index] == 'object')
                        ? String(Valores[index])
                        : Valores[index];
                    if (valor != null && valor != 'null')    // << ISSO AQUI CONSGUE NAO LEVAR OS NULOS PARA A RESPOSTA
                        obj[Keys[index]] = valor;  // adiciona property dinamico ao obj semelhante ao json
                }
                lista.push(obj);


            });
            console.log('mandou status 200');
            res.status(200).send(lista);

        }).catch((erro) => {
            console.log('mandou status 400');
            res.status(400).send({ mensagem: "erro = " + erro });
        });
});


/// EM FUNCIONAMENTO OK...ESSA É BOA PQ CONSEGUE FILTRAR OS CAMPOS QUE VIERAM NULO
const pegarQUERY = param => new Promise((resolve, reject) => {

    console.log(' >> 2 >> entrou na promisse pegar Firebird param = ' + param);

    Firebird.attach(options, function (err, db) {

        if (err) {
            console.log(' >> 2.e >> ERRO PRIMEIRO ATTACH = ' + err);
            reject(' reject = mensagem de erro 1: ' + err);
            return;
            //  throw err;
        }

        console.log(' >> 3 >> NAO TEVE ERRO NO ATATACH ');
        // db = DATABASE
        db.query('SELECT * FROM ' + param, function (err, result) {
            console.log(' >> 4 >> ENTROU NO QUERY ');

            if (err) {
                console.log(' >>  ERRO NO QUERY = ' + err);
                reject(' reject = mensagem de erro DO QUERY: ' + err);
                return;
                //throw err;
            }

            console.log(' >> >> PASSOU DO ERRO QUERY ');
            //let retorno = result;
            //console.log(' 5 result = ' + result[0].NAMEPC);
            //console.log('6 err 2 = ' + err);
            resolve(result);

            db.detach(); // IMPORTANT: close the connection
            console.log(' >> 7 >> EXECUTOU DETACH ');
            //res.status(200).send({mensagem:'executou os comandos'});

        });

        console.log(' >> 8 >> EXECUTOU FORA DO QUERY ');

    });

    console.log(' 999 !!!!!!!! @@@ EXECUTOU ULTIMA LINHA DO CODIGO ');
});


/// DESVANTAGEM...NAO CONSEGUE FILTRAR OS CAMPOS QUE VIERAM NULO
const pegarSEQUENT = param => new Promise((resolve, reject) => {

    console.log(' >> 2 >> entrou na promisse SEQUENTIALLY Firebird param = ' + param);

    Firebird.attach(options, function (err, db) {

        if (err) {
            console.log(' >> 2.e >> ERRO PRIMEIRO ATTACH = ' + err);
            reject(' reject = mensagem de erro 1: ' + err);
            return;
            //  throw err;
        }

        console.log(' >> 3 >> NAO TEVE ERRO NO ATATACH ');
        // db = DATABASE
        let retorna = '[';
        db.sequentially('SELECT * FROM ' + param, function (row, index) {
            if (retorna > '[')
                retorna = retorna + ' , ';

            retorna = retorna + JSON.stringify(row);
        }, function (err) {

            if (err) {
                console.log(' >>  ERRO NO QUERY = ' + err);
                reject(' reject = mensagem de erro DO SEQUETIALLY: ' + err);
                return;
                //throw err;
            }

            console.log(' >> >> PASSOU DO ERRO SEQUENT ');
            retorna = retorna + ' ] ';
            console.log('retorna = ' + retorna);
            resolve(retorna);

            db.detach(); // IMPORTANT: close the connection
            console.log(' >> 7 >> EXECUTOU DETACH ');
            //res.status(200).send({mensagem:'executou os comandos'});

        });

        console.log(' >> 8 >> EXECUTOU FORA DO QUERY ');

    });

    console.log(' 999 !!!!!!!! @@@ EXECUTOU ULTIMA LINHA DO CODIGO ');
});




router.post('/', (req, res, next) => {

    let COD = req.header('CODIGO');
    // if (!(tabela > ''))
    //     tabela = 'SEG';

    console.log(' >> 1 >> entrou no POST  firebird');

    let tabela = req.header('tabela');

    // let oj = JSON.stringify(req.body);
    // console.log(oj);

    // let Keys = Object.keys(oj);
    // let Valores = Object.values(oj);
    // var valor = '';
    // var obj = {};


    // for (let index = 0; index < Keys.length; index++) { // LOOP EM CADA CAMPO DO REGISTRO
    //     valor = (typeof Valores[index] == 'string' || typeof Valores[index] == 'object')
    //         ? String(Valores[index])
    //         : Valores[index];
    //     if (valor != null && valor != 'null')
    //         obj[Keys[index]] = valor;  // adiciona property dinamico ao obj semelhante ao json
    // }
    // //lista.push(obj);

    // console.log(obj);

    // let camposEvalores = {};
    // camposEvalores.CODAREA = COD; //parseInt(COD);
    // camposEvalores.DESCRICAO = 'aqui a descricao '+ COD;

    gravarTabela(tabela, req.body)
        .then((resultado) => {

            console.log('mandou status 200');
            res.status(200).send(resultado);

        }).catch((erro) => {
            console.log('mandou status 400');
            res.status(400).send({ mensagem: "erro = " + erro });
        });
});


const gravarTabela = (tabela, camposEvalores) => new Promise((resolve, reject) => {

    console.log(' >> 2 >> entrou na promisse gravar Firebird ');

    let SqlCampos = '';
    let SqlValues = '';
    let ArrParams = [];

    let Keys = Object.keys(camposEvalores);
    let Valores = Object.values(camposEvalores);
    
    for (let index = 0; index < Keys.length; index++) { // LOOP EM CADA CAMPO DO REGISTRO
        if (SqlCampos > '')
            SqlCampos = SqlCampos + ', ';
        SqlCampos = SqlCampos + Keys[index];
        if (SqlValues > '')
            SqlValues = SqlValues + ', ';
        SqlValues = SqlValues + '? ';

        ArrParams.push(Valores[index]);
    }
    
    //console.log(' campo = ' + SqlCampos + '  values = ' + SqlValues + ' array  = ' + ArrParams);

    Firebird.attach(options, function (err, db) {

        if (err) {
            reject(' reject = mensagem de erro no attach: ' + err);
            return;
        }
        // db = DATABASE
        db.query(' INSERT INTO ' + tabela + ' ( ' + SqlCampos + ' ) VALUES (' + SqlValues + ')'
            , ArrParams, function (err, result) {
                console.log(' >> 4 >> ENTROU NO QUERY ');

                if (err) {
                    reject(' reject = mensagem de erro DO QUERY: ' + err);
                    db.detach(); // IMPORTANT: close the connection
                    return;
                }
                
                resolve(result);

                db.detach(); // IMPORTANT: close the connection
                                
            });

        //console.log(' >> 8 >> EXECUTOU FORA DO QUERY ');

    });

    //console.log(' 999 !!!!!!!! @@@ EXECUTOU ULTIMA LINHA DO CODIGO ');
});


module.exports = router;


// const promise1 = parametro => new Promise((resolve, reject) => {
//     let val1 = 5;
//     let val2 = 10;

//     if (val1 < val2)
//         resolve('tudo certo');
//     else
//         reject('deu errado');
// });
