<?php
// SMTP credentials for the contact form mailer.
// Copy to mail-config.php, fill in real values, and keep it out of git
// and ideally outside the public web root.

return [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'your-account@gmail.com',
    'smtp_password' => 'your-app-password',
    'from_email' => 'your-account@gmail.com',
    'from_name' => 'Website Contact Form',
    'to_email' => 'inbox@example.com',
    'to_name' => 'Site Owner',
];
