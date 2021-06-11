'use strict';
const MINHACHAVE = '----';
const QTDHORAS = 10;

const jwt = require('jsonwebtoken');
var dateFormat = require('dateformat');


//esta nao está sendo  utilizada pois foi incorporada na POST geretoken
// exports.generateToken = async (data) => {
//     return jwt.sign(data, MINHACHAVE, { expiresIn: '1h' });
// }


// chamada pelas funcoes que querem alguma informacao de dentro do token
exports.decodeToken = async (token) => {
    var data = await jwt.decode(token, { complete: false, JSON: true });
    return data;
}

// funcao principal chamada em todas as requisicoes
exports.authorize = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        res.status(401).json({ message: "Acesso restrito" });
    } else {
        jwt.verify(token, MINHACHAVE, function (error, decoded) {
            if (error) {
                res.status(401).json({ message: "Token Inválido" });
            } else {
                next();
            }
        });
    }
}



// /gerartoken
//exports.post('/geretoken', async (req, res, next) => {
exports.geretoken = function (req, res, next) {

    console.log('entrou no post de gere token ' + req.header('user') + ' ' + req.header('senha'));

    // aqui localiza e valida os dados do usuario na tabela atraves dos campos enviados
    if (!(req.header('user') == 'fulano' && req.header('senha') == '1234')) {
        return res.status(401).send({ message: 'dados inválidos' });
    }

    let userEmail = 'fulano@fulano';
    let userName = 'Fulano da Silva'

    // dados que irao dentro do token
    const data = {
        email: userEmail,
        name: userName,
        lista: ['umcnpj', 'outrocnpj', 'terceirocnpj']
     };

    const aux = Date.now() + (QTDHORAS * 60 * 60 * 1000); // QTDhoras * 60 MIN * 60 SEG * 1000 MILISEGUNDOS
    const expira = dateFormat(aux, 'isoDateTime', false);
    const expStr = String(QTDHORAS)+'h'; 
    const token = jwt.sign(data, MINHACHAVE, { expiresIn: expStr });

    // dados retornados junto com a requisicao   
    return res.status(200).send({
        token: token,
        data: {
            email: userEmail,
            name: userName,
            expireDate: expira
        }
    });
};



