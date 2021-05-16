
function loadDoc() {
    $('#confirma').text('Não Realizada');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 0) {
            $('#confirma').text ('0: request not initialized') ;
        }
        if (this.readyState == 1) {
            $('#confirma').text ('server connection established') ;
        }
        if (this.readyState == 2) {
            $('#confirma').text('request received');
        }
        if (this.readyState == 3) {
            $('#confirma').text('processing request');
        }
        if (this.readyState == 4 && this.status == 200) {
           // alert('recebi');
            var myObj = JSON.parse(this.responseText);
            $('#confirma').text(this.responseText);

            for (let key in myObj) {
                $('#ProductBacklog > tbody:last').append('<td >'+ myObj[key]+'</td>');

            }
        }
       
    };

    xhttp.open("GET", "RetornaTabela.php?q="+"eu", true);
  //  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // var text = "usr=" + user + "&" + "pwd=" + pwd;
    xhttp.send();
}