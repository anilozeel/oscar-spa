<?php
/**
 * Oscar Spa - WhatsApp gonderim ucu (Twilio proxy)
 *
 * Tarayici bu dosyaya POST atar; dosya Twilio'yu sunucu tarafinda cagirir,
 * boylece Auth Token hicbir zaman istemciye gitmez.
 *
 * Kurulum: ayni klasore (public_html/spa/) elle "wa.config.json" yukleyin:
 * {
 *   "sid":  "AC....",                     // Twilio Account SID
 *   "token":"....",                       // Twilio Auth Token (GIZLI)
 *   "from": "whatsapp:+17372508034",      // Twilio sandbox/gonderen numarasi
 *   "key":  ""                            // opsiyonel paylasimli anahtar
 * }
 *
 * Saglik kontrolu: tarayicida  https://www.oscarseasidehotel.com/spa/wa.php
 * JSON donerse PHP calisiyor demektir.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$cfgPath = __DIR__ . '/wa.config.json';
if (!file_exists($cfgPath)) { echo json_encode(array('ok'=>false,'error'=>'config_missing')); exit; }
$cfg = json_decode(file_get_contents($cfgPath), true);
if (!$cfg || empty($cfg['sid']) || empty($cfg['token']) || empty($cfg['from'])) {
  echo json_encode(array('ok'=>false,'error'=>'config_invalid')); exit;
}

// Saglik kontrolu (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(array('ok'=>true,'service'=>'wa','from'=>$cfg['from'])); exit;
}

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { $in = $_POST; }
$to   = isset($in['to'])   ? trim($in['to'])   : '';
$body = isset($in['body']) ? trim($in['body']) : '';

// Opsiyonel paylasimli anahtar
if (!empty($cfg['key'])) {
  $k = isset($in['key']) ? (string)$in['key'] : '';
  if (!hash_equals((string)$cfg['key'], $k)) { echo json_encode(array('ok'=>false,'error'=>'unauthorized')); exit; }
}

if ($to === '' || $body === '') { echo json_encode(array('ok'=>false,'error'=>'missing_params')); exit; }

// Numarayi E.164'e cevir (Turkiye varsayilan)
$digits = preg_replace('/\D+/', '', $to);
if ($digits === '') { echo json_encode(array('ok'=>false,'error'=>'bad_number')); exit; }
if (substr($digits,0,2) === '90')      { $e164 = '+'.$digits; }
elseif (substr($digits,0,1) === '0')   { $e164 = '+90'.substr($digits,1); }
elseif (strlen($digits) === 10)        { $e164 = '+90'.$digits; }
else                                   { $e164 = '+'.$digits; }

$toWa   = 'whatsapp:'.$e164;
$fromWa = (strpos($cfg['from'],'whatsapp:') === 0) ? $cfg['from'] : ('whatsapp:'.$cfg['from']);

$url  = 'https://api.twilio.com/2010-04-01/Accounts/'.$cfg['sid'].'/Messages.json';
$post = http_build_query(array('From'=>$fromWa, 'To'=>$toWa, 'Body'=>$body));

$ch = curl_init($url);
curl_setopt_array($ch, array(
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => $post,
  CURLOPT_USERPWD        => $cfg['sid'].':'.$cfg['token'],
  CURLOPT_TIMEOUT        => 20,
));
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$cerr = curl_error($ch);
curl_close($ch);

if ($res === false) { echo json_encode(array('ok'=>false,'error'=>'curl','detail'=>$cerr)); exit; }
$data = json_decode($res, true);
if ($code >= 200 && $code < 300) {
  echo json_encode(array('ok'=>true,'sid'=>isset($data['sid'])?$data['sid']:null));
} else {
  echo json_encode(array('ok'=>false,'error'=>'twilio','code'=>$code,'detail'=>isset($data['message'])?$data['message']:$res));
}
