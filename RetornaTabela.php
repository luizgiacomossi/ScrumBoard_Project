<?php
  $db_host = 'localhost';
  $db_user = 'root';
  $db_password = 'root';
  $db_db = 'Scrum_v1';
  $db_port = 8889;
  //Dados recebidos// 
  $recebido = $_GET["q"];
  $mysqli = new mysqli(
    $db_host,
    $db_user,
    $db_password,
    $db_db
  );
	
  if ($mysqli->connect_error) {
    echo 'Errno: '.$mysqli->connect_errno;
    echo '<br>';
    echo 'Error: '.$mysqli->connect_error;
    exit();
  }

  //echo 'Conexão Realizada <br>';

  $sql = "SELECT * FROM Productbacklog";

  $stmt = $mysqli->prepare($sql);
  //$stmt->bind_param("s", $_GET['q']);
  $stmt->execute();
  $stmt->store_result();
  $stmt->bind_result($id[], $grupo[], $desc[], $estima[], $pri[], $est[], $sprint[]);
  $stmt->fetch();
 
  $stmt->close();


//-----json-----
    $myObj->id = $id;
    $myObj->grupo = $grupo;
    $myObj->descripcion = $desc;
    $myObj->estimacion = $estima;
    $myObj->prioridad = $pri;
    $myObj->estado = $est;
    $myObj->sprint = $sprint;
    
    $myJSON = json_encode($myObj);

    echo $myJSON;
//----------------

  $mysqli->close();
