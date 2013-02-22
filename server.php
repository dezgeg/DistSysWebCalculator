<?php
// // Tuomas Tynkkynen, 013770385
// This script either calculates an elementary calculation,
// or plots a whole graph as a PNG, depending on GET params.
//
// If the 'plot' parameter is given, the specified
// expression is plotted with gnuplot, and a PNG
// file is output directly.
//
// If 'arg1', 'arg2, and 'op' are given, the value of
//  arg1 <op> arg2 is calculated and output to the page.
//
// On errors, a JSON string is outputted.


// For debugging
// ini_set('display_errors', 'on');
// error_reporting(E_ALL);

$gnuplot_params = implode('; ', array(
    'set term png size 513,201',
    'set xrange [-3.2:3.2]',
    'set yrange [-1.2:1.2]',
    'set xtics 0.5',
    'set ytics 0.5',
    'set zeroaxis',
    'unset label',
    'unset key',
)) . '; ';

function error($msg) {
    die(json_encode($msg));
}

// Output the calculation result to the page.
// NaNs and infinities need special treatment
// or javascript's Number() won't recogize them...
function result($res) {
    if (is_nan($res))
        echo('NaN');
    else if (is_infinite($res))
        echo($res < 0 ? '-Infinity' : 'Infinity');
    else
        echo($res);
}

// Kinda the same as the previous, but into the opposite direction;
// NaNs and infinities do not convert to PHP numbers from strings properly...
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
// Code starts here

if(isset($_GET['plot'])) {
    // We are plotting to a PNG image

    $func = $_GET['plot'];
    if (preg_match('#^[-+*/x0-9.eEsincos( )]+$#', $func) !== 1)
        error('Plotted function contains invalid characters');
    if (trim($func) === '')
        error('Empty expression');

    $gnuplot_expr = escapeshellarg($gnuplot_params . 'plot ' . $func);

    // First, discard all output and just check the exit status to see
    // if the expression was valid.
    $exit_status = 1;
    $output = array();
    exec('gnuplot 2>&1 1>/dev/null -e ' . $gnuplot_expr, $output, $exit_status);
    if ($exit_status !== 0) {
        header("HTTP/1.1 403 Bad Request\r\n");
        header("Content-type: text/json\r\n");
        error('Server-side plotting failed');
    }

    header("Content-type: image/png\r\n");
    passthru('gnuplot -e ' . $gnuplot_expr);

} else {
    // We are calculating an elementary expression

    // To be strict, we don't have valid JSON if the result is Inf/NaN.
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
}
