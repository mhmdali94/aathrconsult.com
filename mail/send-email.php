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

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo($email, $name);

    $mail->Subject = "طلب استشارة استراتيجية: {$company} - {$name}";

    $bodyLines = [
        "الاسم: {$name}",
        "الشركة: {$company}",
        "البريد: {$email}",
        "الهاتف: {$phone}",
        "المجال المطلوب: {$serviceName}",
        "الفرع: {$branchName}",
        '',
        'التفاصيل:',
        $message !== '' ? $message : '(لا يوجد)',
    ];

    $mail->isHTML(false);
    $mail->Body = implode("\n", $bodyLines);

    $mail->send();

    respond(true, 'Email sent successfully');
} catch (PHPMailerException $e) {
    error_log('Consultation form mail error: ' . $mail->ErrorInfo);
    respond(false, 'Failed to send email', 500);
}
