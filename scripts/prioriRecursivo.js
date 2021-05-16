
var TimeBudget = 120; // INT em horas
var prefer = [47, 45, 33, 48, 52, 46, 53, 51, 49, 50, 43, 44];

var features = [
    { id: 33, story: "A", normalEst: 20, safeEst: 40, depend: [43, 44] },
    { id: 43, story: "B", normalEst: 7, safeEst: 9, depend: null },
    { id: 44, story: "C", normalEst: 20, safeEst: 30, depend: null },
    { id: 45, story: "D", normalEst: 5, safeEst: 7, depend: [46] },
    { id: 46, story: "E", normalEst: 6, safeEst: 7, depend: null },
    { id: 47, story: "F", normalEst: 5, safeEst: 6, depend: null },
    { id: 48, story: "G", normalEst: 20, safeEst: 40, depend: null },
    { id: 49, story: "H", normalEst: 10, safeEst: 20, depend: [51, 52] },
    { id: 50, story: "I", normalEst: 15, safeEst: 30, depend: null },
    { id: 51, story: "J", normalEst: 12, safeEst: 15, depend: null },
    { id: 52, story: "K", normalEst: 8, safeEst: 10, depend: null },
    { id: 53, story: "L", normalEst: 10, safeEst: 18, depend: null },
];

var priorizarMoscowRules = function (features, prefer, TimeBudget) {
    // ===================== funçoes =============================

    var calcBuffer = function (setx, tB) {
        let sumNormal = 0;
        let sumSafe = 0;
        for (i of setx) {
            sumNormal += i.normalEst;
            sumSafe += i.safeEst;
        }
        return tB - sumNormal; // tempo disponivel para Should Have
    }

    var atualiza = function (setX, features, prefer) {
        for (x of setX) {
            var a = features.indexOf(x);
            var b = prefer.indexOf(x.id);
            prefer.splice(b, 1);
            features.splice(a, 1);
        }

    }

    // ----------------------------------------
    var mustHave, couldHave, shouldHave = [];

    var priorizaFeatures = function (featur, prefere, timeBox) {
        var preferen = prefere.filter(function (f) { return f; })// cria copy do array preferencia para n alterar original
        // --- começa logica --- // 
        var setPrefer = [];
        for (i of preferen) {
            let temp = featur.find(o => o.id === i); // Obtem obj da feature
            let tam = 0;
            var depTemp = null;
            if(temp.depend){ //--verifica se tem dependencia --
                tam = temp.depend.length; // obtem qnts dependencias 
                depTemp = temp.depend;// salva dependencias
            }

            // ====================
            let somaSafeDepend;
            let aux = 0;
            if (tam > 0) { // tem dependencias
                let j = 0;
                for (j; j < tam; j++) { // Para cada elemento da dependencia
                    somaSafeDepend = featur.find(o => o.id === temp.depend[j]);
                    if (featur.find(o => o.id === temp.depend[j]))// checar se dependencia esta na lista de features
                        aux += somaSafeDepend.safeEst;
                }
                temp.safeEst += aux;
            }
            // ===================

            // Procede ao calculo de safe timebox
            if (timeBox - temp.safeEst >= 0) {
                timeBox -= temp.safeEst;
                temp.safeEst -= aux;
                setPrefer.push(temp);
                if (tam > 0) {
                    let j = 0;
                    for (j; j < tam; j++) { // add dependencias
                        let aux = featur.find(o => o.id === depTemp[j]);
                        setPrefer.push(aux);
                        preferen.splice(preferen.indexOf(aux.id), 1); // elimina dependencia ja adicionada da lista
                    }
                }
            }
        }
        return setPrefer;
    }

    mustHave = priorizaFeatures(features, prefer, TimeBudget);
    // calcula buffer
    // tempo disponivel para Should Have
    var mustHaveBuffer = calcBuffer(mustHave, TimeBudget);
    // elimina features e prefer que ja estao em mustHave
    atualiza(mustHave, features, prefer);

    //----------- FIM MUSTHAVE -------------------
    // --- shouldHave ---
    shouldHave = priorizaFeatures(features, prefer, mustHaveBuffer);
    // calcula buffer shouldHave
    // tempo disponivel para could Have
    shouldHaveBuffer = calcBuffer(shouldHave, mustHaveBuffer);
    atualiza(shouldHave, features, prefer);

    // --- FIM SHOULDHAVE -------------------------
    couldHave = priorizaFeatures(features, prefer, shouldHaveBuffer);
    // calcula buffer couldHave
    // tempo disponivel para wont Have
    couldHaveBuffer = calcBuffer(couldHave, shouldHaveBuffer);
    atualiza(couldHave, features, prefer);
    // --- FIM COULDHAVE -------------------------

    return {
        "MustHave": mustHave,
        "ShouldHave": shouldHave,
        "CouldHave": couldHave,
        "WontHave": features
    };

}


var retorno = priorizarMoscowRules(features, prefer, TimeBudget);