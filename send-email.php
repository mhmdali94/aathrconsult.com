<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Only same-site form submissions are expected.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require __DIR__ . '/vendor/phpmailer/src/Exception.php';
require __DIR__ . '/vendor/phpmailer/src/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function respond(bool $success, string $message, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

$config = require __DIR__ . '/mail-config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$name = trim((string)($data['name'] ?? ''));
$company = trim((string)($data['company'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$serviceName = trim((string)($data['serviceName'] ?? ''));
$branchName = trim((string)($data['branchName'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$answers = trim((string)($data['answers'] ?? ''));

// "Explore with Aathr" journey: the message is the client's initial reading
$isExplore = ($data['source'] ?? '') === 'explore';
$sendCopy = $isExplore && !empty($data['sendCopy']);
$isEnglish = ($data['lang'] ?? 'ar') === 'en';

// Honeypot: a hidden field legitimate users never fill in.
if (!empty($data['website'] ?? '')) {
    respond(true, 'OK');
}

if ($name === '' || $company === '' || $email === '' || $phone === '') {
    respond(false, 'Missing required fields', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email address', 422);
}

if (mb_strlen($message) > 8000 || mb_strlen($answers) > 12000 || mb_strlen($name) > 120 || mb_strlen($company) > 160) {
    respond(false, 'Message too long', 422);
}

// Basic per-IP rate limit (the client copy goes to a visitor-supplied address)
$ipKey = sys_get_temp_dir() . '/aathr_mail_' . hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? ''));
$recent = array_filter(
    is_file($ipKey) ? (array)json_decode((string)file_get_contents($ipKey), true) : [],
    static fn($t) => is_int($t) && $t > time() - 3600
);
if (count($recent) >= 5) {
    respond(false, 'Too many requests', 429);
}
$recent[] = time();
@file_put_contents($ipKey, json_encode(array_values($recent)), LOCK_EX);

// WhatsApp-style *bold* / _italic_ markers read as noise in a plain-text email
$plainMessage = preg_replace('/(^|\s)[*_]+|[*_]+(\s|$)/u', '$1$2', $message);

function newMailer(array $config): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->isHTML(false);
    return $mail;
}

$mail = newMailer($config);

try {
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo($email, $name);

    $mail->Subject = $isExplore
        ? "استكشف مع آثر | {$serviceName} - {$name}"
        : "طلب استشارة استراتيجية: {$company} - {$name}";

    $bodyLines = [
        "الاسم: {$name}",
        "الشركة: {$company}",
        "البريد: {$email}",
        "الهاتف: {$phone}",
        "المجال المطلوب: {$serviceName}",
        "الفرع: {$branchName}",
        '',
        $isExplore ? 'القراءة الأولية:' : 'التفاصيل:',
        $plainMessage !== '' ? $plainMessage : '(لا يوجد)',
        '',
        $sendCopy ? '(أُرسلت نسخة من القراءة إلى العميل)' : '',
    ];

    // Team only: every question with the client's exact answer (never in the client copy)
    if ($isExplore && $answers !== '') {
        array_push($bodyLines, '', '------------------------------------', 'كل الإجابات:', '', $answers);
    }

    $mail->Body = rtrim(implode("\n", $bodyLines));

    $mail->send();
} catch (PHPMailerException $e) {
    error_log('Consultation form mail error: ' . $mail->ErrorInfo);
    respond(false, 'Failed to send email', 500);
}

// "Email me the summary": send the client their reading; the team already has the request
if ($sendCopy) {
    $copy = newMailer($config);
    try {
        $copy->addAddress($email, $name);
        $copy->addReplyTo($config['to_email'], $config['to_name']);
        $copy->Subject = $isEnglish ? 'Your initial reading from Aathr Consulting' : 'قراءتك الأولية من آثر للاستشارات';
        $copy->Body = implode("\n", $isEnglish ? [
            "Hello {$name},",
            '',
            'Thank you for using "Explore with Aathr". Here is your initial reading:',
            '',
            $plainMessage,
            '',
            'Reply to this email any time if you would like to discuss it with one of our consultants.',
            '',
            'Aathr Consulting · Impact that stays',
            'https://aathrconsult.com',
        ] : [
            "مرحبًا {$name}،",
            '',
            'شكرًا لاستخدامك «استكشف مع آثر». هذه قراءتك الأولية:',
            '',
            $plainMessage,
            '',
            'يمكنك الرد على هذه الرسالة في أي وقت إذا رغبت في مناقشتها مع أحد مستشارينا.',
            '',
            'آثر للاستشارات · أثرٌ يبقى',
            'https://aathrconsult.com',
        ]);
        $copy->send();
    } catch (PHPMailerException $e) {
        error_log('Explore client copy mail error: ' . $copy->ErrorInfo);
        respond(true, 'Request received; client copy failed');
    }
}

respond(true, 'Email sent successfully');
