<?php
/**
 * Oscar Spa - WhatsApp gonderim ucu (Meta WhatsApp Cloud API proxy)
 *
 * Tarayici bu dosyaya POST atar; dosya Meta Graph API'yi SUNUCU tarafinda cagirir,
 * boylece erisim token'i (access token) hicbir zaman istemciye gitmez.
 *
 * Kurulum: ayni klasore (public_html/spa/) elle "wa.config.json" yukleyin:
 * {
 *   "token":    "EAAG....",          // Kalici (permanent) WhatsApp erisim token'i
 *   "phone_id": "123456789012345",   // WhatsApp telefon numarasi ID'si (Phone number ID)
 *   "key":      ""                   // opsiyonel paylasilan anahtar (bos birakilabilir)
 * }
 *
 * Istek govdesi (JSON):
 *   { "to":"05xx...", "template":"randevu_olusturuldu", "lang":"tr", "params":["Ali Veli","12 Ekim","15:00","Klasik Masaj"] }
 *   veya 24 saat penceresi icinde serbest metin:  { "to":"05xx...", "body":"metin" }
 *
 * Saglik kontrolu (GET): https://www.oscarseasidehotel.com/spa/wa.php  -> JSON donerse PHP calisiyor.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$cfgPath = __DIR__ . '/wa.config.json';
if (!file_exists($cfgPath)) { echo json_encode(array('ok'=>false,'error'=>'config_missing')); exit; }
$cfg = json_decode(file_get_contents($cfgPath), true);
if (!$cfg || empty($cfg['token']) || empty($cfg['phone_id'])) {
  echo json_encode(array('ok'=>false,'error'=>'config_invalid')); exit;
}

// Saglik kontrolu (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(array('ok'=>true,'service'=>'wa-cloud','phone_id'=>$cfg['phone_id'])); exit;
}

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { $in = $_POST; }

// Opsiyonel paylasilan anahtar
if (!empty($cfg['key'])) {
  $k = isset($in['key']) ? (string)$in['key'] : '';
  if (!hash_equals((string)$cfg['key'], $k)) { echo json_encode(array('ok'=>false,'error'=>'unauthorized')); exit; }
}

$to       = isset($in['to'])       ? trim((string)$in['to'])       : '';
$template = isset($in['template']) ? trim((string)$in['template']) : '';
$lang     = isset($in['lang'])     ? trim((string)$in['lang'])     : 'tr';
$body     = isset($in['body'])     ? trim((string)$in['body'])     : '';
$params   = (isset($in['params']) && is_array($in['params'])) ? $in['params'] : array();

if ($to === '') { echo json_encode(array('ok'=>false,'error'=>'missing_to')); exit; }
if ($template === '' && $body === '') { echo json_encode(array('ok'=>false,'error'=>'missing_message')); exit; }

// Numarayi E.164 rakamlarina cevir (Turkiye varsayilan, '+' YOK)
$digits = preg_replace('/\D+/', '', $to);
if ($digits === '') { echo json_encode(array('ok'=>false,'error'=>'bad_number')); exit; }
if (substr($digits,0,2) === '90')      { $e164 = $digits; }
elseif (substr($digits,0,1) === '0')   { $e164 = '90'.substr($digits,1); }
elseif (strlen($digits) === 10)        { $e164 = '90'.$digits; }
else                                   { $e164 = $digits; }

// Mesaj govdesini olustur
if ($template !== '') {
  $msg = array(
    'messaging_product' => 'whatsapp',
    'to'   => $e164,
    'type' => 'template',
    'template' => array(
      'name' => $template,
      'language' => array('code' => $lang),
    ),
  );
  if (count($params) > 0) {
    $comp = array();
    foreach ($params as $p) {
      // Sablon govde parametreleri: tek satir, 4+ ardisik bosluk olmasin
      $txt = preg_replace('/\s+/', ' ', (string)$p);
      $comp[] = array('type' => 'text', 'text' => $txt);
    }
    $msg['template']['components'] = array(
      array('type' => 'body', 'parameters' => $comp),
    );
  }
} else {
  $msg = array(
    'messaging_product' => 'whatsapp',
    'to'   => $e164,
    'type' => 'text',
    'text' => array('preview_url' => false, 'body' => $body),
  );
}

$url = 'https://graph.facebook.com/v21.0/'.rawurlencode($cfg['phone_id']).'/messages';
$ch = curl_init($url);
curl_setopt_array($ch, array(
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => json_encode($msg),
  CURLOPT_HTTPHEADER     => array(
    'Authorization: Bearer '.$cfg['token'],
    'Content-Type: application/json',
  ),
  CURLOPT_TIMEOUT        => 20,
));
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$cerr = curl_error($ch);
curl_close($ch);

if ($res === false) { echo json_encode(array('ok'=>false,'error'=>'curl','detail'=>$cerr)); exit; }
$data = json_decode($res, true);
if ($code >= 200 && $code < 300 && isset($data['messages'])) {
  echo json_encode(array('ok'=>true,'id'=>isset($data['messages'][0]['id'])?$data['messages'][0]['id']:null));
} else {
  $emsg = isset($data['error']['message']) ? $data['error']['message'] : $res;
  echo json_encode(array('ok'=>false,'error'=>'graph','code'=>$code,'detail'=>$emsg));
}
