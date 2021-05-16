var app = angular.module('myApp', [angularDragula(angular), 'ngAnimate']);
app.controller('myCtrl', function ($scope, $http, $interval, dragulaService) {
    $scope.items1 = [{ item: '1' }, { item: '2' }, { item: '3' }];
    $scope.items2 = [{ item: '4' }, { item: '5' }, { item: '6' }];
    $scope.listaSprint = [];

    dragulaService.options($scope, { // logica do dragula 
        removeOnSpill: false
    });

    $scope.criaSprint = function (story) {
        var aux = $scope.listaSprint.indexOf(story);
        if (aux == -1) {// -1 = nao encontrado 
            if (story.depend)
                story.depend = story.depend.split(',').map(x => +x);
            $scope.listaSprint.push(story);
        }
        else { $scope.listaSprint.splice($scope.listaSprint.indexOf(story), 1); }
    }


    $scope.ordem = function (x) {
        $scope.minhaordem = x;
    }
    $scope.loaddata = function () {
        $http({
            method: "GET",
            url: "http://localhost:8000/backlog",
        }).then(function mySuccess(response) {
            console.log('recebi ok');
            $scope.resposta = response.data;
        }, function myError(response) {
            console.log('recebi erro');
            $scope.resposta = "Erro no recebimento";
        });
    }

    $scope.carregaQuadro = function (id) {
        $http({
            method: "POST",
            url: "http://localhost:8000/backlog",
            params: { load: id.idBoard }
        }).then(function mySuccess(response) {

            if (response.data != null) {
                $scope.tabela = response.data;
                for (x of $scope.tabela) {
                    if (x.depend)
                        x.depend = x.depend.split(',').map(x => +x);
                }
                $scope.nomequadro = id.nameBoard;
                $scope.quadroAberto = id.idBoard;
            }
            else {
                alert('Projeto Vazio');
            }
        }, function myError(response) {
            console.log('recebi erro');
            alert("Erro no recebimento");
        });
    }

    $scope.salvarStory = function () {
        $http({
            method: "POST",
            url: "http://localhost:8000/backlog",
            params: { story: $scope.story, normalEst: $scope.normalEst, safeEst: $scope.safeEst, idboard: $scope.quadroAberto, depend: $scope.depend }
        }).then(function sucesso(response) {
            //alert(JSON.stringify(response));
            $scope.carregaQuadro({ idBoard: $scope.quadroAberto }); // tem q passar objeto pra função reconhecer
        });
    }
    // Configuraçao do dragula 

    /*$interval(function () {
        $scope.loaddata();
    }, 5000);*/

    $scope.removeItem = function (story) {
        if (confirm("Esta seguro que deseja Apagar Historia?")) {
            $http({
                method: "POST",
                url: "http://localhost:8000/backlog",
                params: { del: story.id }
            }).then(function mySuccess(response) {
                console.log('Apagado');
                $scope.carregaQuadro({ idBoard: $scope.quadroAberto });

            }, function myError(response) {
                console.log('Erro ao Apagar');
                $scope.resposta = "Erro no recebimento";
            });
        }
    }


    // ============  logica prioridade =============

    $scope.priorizarMoscowRules = function (feat, prefer, TimeBudget) {
        if($scope.tabela == null) return alert(" Tabela Vazia"); // assertion que existe tabela carregada
        // ===================== funçoes =============================
        var features = feat.filter(function (f) { return f; })// cria copy do array preferencia para n alterar original
        

        var calcBuffer = function (setx, tB) {
            let sumNormal = 0;
            let sumSafe = 0;
            for (i of setx) {
                sumNormal += i.normalEst;
                sumSafe += i.safeEst;
            }
            return tB - sumNormal; // tempo disponivel para prox set
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
                if (temp.depend) { //--verifica se tem dependencia --
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
                            let aux2 = featur.find(o => o.id === depTemp[j]);
                            setPrefer.push(aux2);
                            preferen.splice(preferen.indexOf(aux2.id), 1); // elimina dependencia ja adicionada da lista
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

        $scope.prioridades = {
            MustHave: mustHave,
            ShouldHave: shouldHave,
            CouldHave: couldHave,
            WontHave: features
        };
       let keys = Object.keys($scope.prioridades);

       let aux = [];

       for(x of keys){ // para cada tipo de prioridade
            for(i of $scope.prioridades[x]){ // adiciona prioridade ao objeto
                i.prioridade = x;
                aux.push(i);
            }
    
       }
       $scope.listaSprint = aux;
 
    }

});
