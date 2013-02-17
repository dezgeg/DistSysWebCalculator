<?php
// ini_set('display_errors', 'on');
// error_reporting(E_ALL);

function error($msg) {
    die(json_encode($msg));
}

function result($res) {
    if (is_nan($res))
        echo('NaN');
    else if (is_infinite($res))
        echo($res < 0 ? '-Infinity' : 'Infinity');
    else
        echo($res);
}

function really_to_float($str)  {
    switch (strtolower($str)) {
        case '-infinity': return -INF;
        case 'infinity': return INF;
        case 'nan': return NAN;
        default:
            return is_numeric($str) ? (float)$str : NULL;
    }
}

// Float division by zero is not handled correctly. GO PHP GO!
// Negative zero still bugs since it won't even convert properly from a string.
function really_divide($arg1, $arg2) {
    if (is_nan($arg1) || is_nan($arg2) || $arg2 != 0.0)
        return $arg1 / $arg2;

    if ($arg1 < 0.0)
        return -INF;
    else if ($arg1 > 0.0)
        return INF;
    else
        return NAN;
}

////////////////////////////////////////////////////////////////////////////////
header("Content-type: text/json\r\n");

if(!isset($_GET['arg1']) || !isset($_GET['arg2']) || !isset($_GET['op']))
    error('Invalid GET params.');

$arg1 = really_to_float($_GET['arg1']);
$arg2 = really_to_float($_GET['arg2']);

if ($arg1 === NULL || $arg2  === NULL)
    error('Non-numeric args');

switch($_GET['op']) {
    case '+': result($arg1 + $arg2); break;
    case '-': result($arg1 - $arg2); break;
    case '*': result($arg1 * $arg2); break;
    case '/': result(really_divide($arg1, $arg2)); break;
    default: error('Invalid operator.'); break;
}
