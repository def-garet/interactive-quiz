-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 16, 2024 at 03:03 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quizmaker`
--

-- --------------------------------------------------------

--
-- Table structure for table `quiz`
--

CREATE TABLE `quiz` (
  `quiz_id` int(11) NOT NULL,
  `doctype` varchar(255) NOT NULL,
  `upload_quiz` varchar(255) DEFAULT NULL,
  `upload_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`upload_response`)),
  `user_score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`quiz_id`, `doctype`, `upload_quiz`, `upload_response`, `user_score`) VALUES
(26, 'multiple_choice', 'uploadscc158b29ed90d326e15537be19931fe6', '[\n  {\n    \"question\": \"Why are plants considered as autotrophs?\",\n    \"options\": [\n      \"They can produce their own food\",\n      \"They need other organisms for survival\"\n    ],\n    \"answer\": \"They can produce their own food\"\n  },\n  {\n    \"question\": \"How do human beings prepare their food?\",\n    \"options\": [\n      \"By combining ingredients and cooking them in the presence of heat\",\n      \"By photosynthesis\"\n    ],\n    \"answer\": \"By combining ingredients and cooking them in the presence of heat\"\n  },\n  {\n    \"question\": \"In what way do plants produce their food?\",\n    \"options\": [\n      \"Through combustion\",\n      \"Through photosynthesis\"\n    ],\n    \"answer\": \"Through photosynthesis\"\n  },\n  {\n    \"question\": \"What are the essential components for photosynthesis?\",\n    \"options\": [\n      \"Light energy, carbon dioxide (CO2), and water (H2O)\",\n      \"Sunlight, soil, and air\"\n    ],\n    \"answer\": \"Light energy, carbon dioxide (CO2), and water (H2O)\"\n  },\n  {\n    \"question\": \"Where does photosynthesis primarily take place in plants?\",\n    \"options\": [\n      \"In the stems\",\n      \"In the leaves\"\n    ],\n    \"answer\": \"In the leaves\"\n  }\n]', 4),
(30, 'multiple_choice', 'uploads8c22f7bcf107abbc0911a9eb7dd982a9', '[\n  {\n    \"question\": \"What makes plants autotrophs?\",\n    \"options\": [\n      \"Photosynthesis\",\n      \"Chemical reactions\"\n    ],\n    \"answer\": \"Photosynthesis\"\n  },\n  {\n    \"question\": \"Where does photosynthesis primarily take place in plants?\",\n    \"options\": [\n      \"In stems\",\n      \"In leaves\"\n    ],\n    \"answer\": \"In leaves\"\n  },\n  {\n    \"question\": \"What are the parts of a chloroplast?\",\n    \"options\": [\n      \"Thylakoids, stroma, intermembrane space\",\n      \"Stomata, mesophyll, vascular bundles\"\n    ],\n    \"answer\": \"Thylakoids, stroma, intermembrane space\"\n  },\n  {\n    \"question\": \"Which color of light is not absorbed by chlorophyll?\",\n    \"options\": [\n      \"Red\",\n      \"Blue\"\n    ],\n    \"answer\": \"Green\"\n  },\n  {\n    \"question\": \"What are the end products of the light reaction in photosynthesis?\",\n    \"options\": [\n      \"ATP and NADPH\",\n      \"Carbon dioxide and oxygen\"\n    ],\n    \"answer\": \"ATP and NADPH\"\n  }\n]', 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `user_email`, `user_name`, `user_password`) VALUES
(1, 'undefined', 'undefined', 'undefined', 'undefined'),
(2, 'undefined', 'undefined', 'undefined', 'undefined'),
(3, 'undefined', 'undefined', 'undefined', 'undefined'),
(4, 'undefined', 'undefined', 'undefined', 'undefined'),
(5, 'undefined', 'undefined', 'undefined', 'undefined'),
(6, 'undefined', 'undefined', 'undefined', 'undefined'),
(7, 'test', 'test123@gmail.com', 'test123', '123');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`quiz_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `quiz_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
