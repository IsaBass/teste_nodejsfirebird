'use strict';
const express = require('express');
var dateFormat = require('dateformat');
const app = express();


// usa body parser para converter tuudo body em json
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// fim body parser

const rotaFirebird = require('./firebird-rota');
app.use('/fb', rotaFirebird);

const authService = require('./ags_authentic');
app.post('/geretoken',authService.geretoken );

app.get('/', (req, res, next) => {

  res.status(200).send({
    "title": "Minha API Node by IsaiasBass",
    "versao": "0.0.2",
    "DateNow": dateFormat(new Date(), "dd-mm-yyyy h:MM:ss")
    /*
    "isoDateTime": dateFormat(new Date(), 'isoDateTime', false),
    
    "Agora": Agora,
    "AgoraVoltada": Date.parse(Agora),
    "agoraAgora" : dateFormat(Date.parse(Agora), 'isoDateTime', true),
    "InformadoOrig": Informado,
    "InformadoFormat": dateFormat(Date.parse(Informado), 'isoDateTime', true),
    "informNum": Date.parse(Informado),
    "deVolta" : dateFormat(Date.parse(Informado), 'isoDateTime', true)
*/

  });
});


module.exports = app;
