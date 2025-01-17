<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
/**
 * src : source folder 
 * encrypted : Output folder
 */
$php_blot_key = "GuaraNWJS";
function getDirContents($dir, &$results = array()) {
    echo $dir;
    $files = scandir($dir);
    foreach ($files as $key => $value) {
        $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
        if (!is_dir($path)) {
            $results[] = $path;
        } else if ($value != "." && $value != "..") {
            getDirContents($path, $results);
            $results[] = $path;
        }
    }
    return $results;
}
print_r($argv);
$AllFiles = getDirContents(realpath($argv[1]));
echo "PHPBolt Files -> ".count($AllFiles);
foreach ($AllFiles as $file) {
    if (!is_dir($file) && strpos($file, '.php') !== false && strpos($file, '\\vendor') === false) {
        $contents = file_get_contents($file);
        $preppand = '<?php bolt_decrypt( __FILE__ , "' . $php_blot_key . '"); return 0;
        ##!!!##';
        $re = '/\<\?php/m';
        preg_match($re, $contents, $matches);
        if (!empty($matches[0])) {
            $contents = preg_replace($re, '', $contents);
            ##!!!##';
        }
        /*$cipher   = bolt_encrypt( "?> ".$contents, $php_blot_key );*/
        $cipher = bolt_encrypt($contents, $php_blot_key);
        file_put_contents($file, $preppand . $cipher);
    }
}