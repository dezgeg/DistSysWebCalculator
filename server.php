<?php
// ini_set('display_errors', 'on');
// error_reporting(E_ALL);

function error($msg) {
    print(json_encode(array('error' => $msg)));
    exit();
}

function result($res) {
    print(json_encode(array('result' => $res)));
    exit();
}

////////////////////////////////////////////////////////////////////////////////
header("Content-type: text/json\r\n");

if(!isset($_GET['arg1']) || !isset($_GET['arg2']) || !isset($_GET['op']))
    error('Invalid GET params.');

$arg1 = $_GET['arg1'];
$arg2 = $_GET['arg2'];

if(!is_numeric($arg1) || !is_numeric($arg2))
    error('Non-numeric args');

switch($_GET['op']) {
    case '+': result($arg1 + $arg2); break;
    case '-': result($arg1 - $arg2); break;
    case '*': result($arg1 * $arg2); break;
    case '/': result($arg1 / $arg2); break;
    default: error('Invalid operator'); break;
}
