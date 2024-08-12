<?php
  // Contact.php file

 // Get the form data
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$message = $_POST['message'];

// Validate the form data
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    exit;
}

// Send the email
$to = 'mikendizihiwe@gmail.com'; 
$subject = 'Contact Us Form Submission';
$body = "Name: $name\nEmail: $email\nPhone: $phone\nMessage: $message";
$headers = "From: $email\r\nReply-To: $email";

if (mail($to, $subject, $body, $headers)) {
    http_response_code(200);
    echo 'Email sent successfully!';
} else {
    http_response_code(500);
    echo 'Failed to send email!';
}
?>