<?php
// newsletter.php

// Configuration
$db_host = 'localhost';
$db_username = 'root';
$db_password = '';
$db_name = 'rootandvine';

// Connect to the database
$conn = new mysqli($db_host, $db_username, $db_password, $db_name);
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Get the email address from the request
$email = $_POST['email'];

// Validate the email address
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo 'Invalid email address';
  exit;
}

// Check if the email address is already subscribed
$query = "SELECT * FROM newsletter_subscribers WHERE email = '$email'";
$result = $conn->query($query);

if ($result->num_rows > 0) {
  http_response_code(400);
  echo 'You are already subscribed to our newsletter';
  exit;
}

// Insert the email address into the database
$query = "INSERT INTO newsletter_subscribers (email) VALUES ('$email')";
if ($conn->query($query) === TRUE) {
  http_response_code(200);
  echo 'Thank you for subscribing to our newsletter!';
} else {
  http_response_code(500);
  echo 'Error subscribing to newsletter. Please try again later.';
}

// Close the database connection
$conn->close();
?>