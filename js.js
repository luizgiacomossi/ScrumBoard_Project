
$(document).ready(function () {


  $("#moverQ").on("click", function () { //Mover quadro

    if ($('#moverQ').is(":checked")) {
      $(".quadro").draggable({ disabled: false });
    }
    else {
      $(".quadro").draggable({ disabled: true });
    }
  });


  $("#moverH").on("click", function () {//mover historia

    if ($('#moverH').is(":checked")) {
      $(".postit1").draggable({ disabled: false });
      $(".postit2").draggable({ disabled: false });
      $(".postit3").draggable({ disabled: false });
      $(".postit4").draggable({ disabled: false });
    }
    else {
      $(".postit1").draggable({ disabled: true });
      $(".postit2").draggable({ disabled: true });
      $(".postit3").draggable({ disabled: true });
      $(".postit4").draggable({ disabled: true });
    }
  });

  $("#fullscreen").on("click", function () { //para colocar fullscreen
    var el = document.documentElement,
      rfs = el.requestFullscreen
        || el.webkitRequestFullScreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen
      ;
    rfs.call(el);
  });

  $('.Editavel').on("click", function () { //Mudar o nome da coluna
    jQuery.noConflict();
    $('#myModal').modal('show');
  });

  $("#contar").click(function () {
    conta = document.getElementsByTagName('tr');
    alert();
  });

});
