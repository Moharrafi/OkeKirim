-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql206.infinityfree.com
-- Generation Time: Oct 24, 2025 at 10:38 PM
-- Server version: 11.4.7-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_36220999_okekirim`
--

-- --------------------------------------------------------

--
-- Table structure for table `debts`
--

CREATE TABLE `debts` (
  `id` int(11) NOT NULL,
  `driver` varchar(255) DEFAULT NULL,
  `vehicle` varchar(128) DEFAULT NULL,
  `type` varchar(64) DEFAULT 'kasbon',
  `amount` int(11) DEFAULT 0,
  `date` date DEFAULT NULL,
  `dueDate` date DEFAULT NULL,
  `status` varchar(32) DEFAULT 'belum_lunas',
  `paidAmount` int(11) DEFAULT 0,
  `lastPaidAt` datetime DEFAULT NULL,
  `paidOffAt` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `debts`
--

INSERT INTO `debts` (`id`, `driver`, `vehicle`, `type`, `amount`, `date`, `dueDate`, `status`, `paidAmount`, `lastPaidAt`, `paidOffAt`, `notes`, `created_at`) VALUES
(1, 'Pudini', NULL, 'hutang', 250000, '2025-09-15', NULL, 'belum_lunas', 0, NULL, NULL, 'Bop', '2025-09-19 03:29:30'),
(2, 'Asep', NULL, 'hutang', 7900000, '2024-09-30', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang', '2025-09-19 03:30:54'),
(3, 'Asep', NULL, 'hutang', 3750000, '2024-12-31', NULL, 'belum_lunas', 0, NULL, NULL, 'Kasbon', '2025-09-19 03:32:42'),
(4, 'Asep', NULL, 'hutang', 4000000, '2024-12-31', NULL, 'belum_lunas', 0, NULL, NULL, 'buat sim', '2025-09-19 03:33:19'),
(5, 'Asep', NULL, 'hutang', 3750000, '2024-04-10', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang Lebaran', '2025-09-19 03:34:25'),
(6, 'Jhon', NULL, 'hutang', 9250000, '2025-04-19', NULL, 'belum_lunas', 815136, NULL, NULL, 'Kasbon + hp + motor', '2025-09-19 03:39:37'),
(7, 'Ade', NULL, 'hutang', 3500000, '2025-04-19', NULL, 'belum_lunas', 659000, NULL, NULL, 'Hutang', '2025-09-19 03:48:15'),
(8, 'Ade', NULL, 'hutang', 1250000, '2025-03-31', NULL, 'belum_lunas', 0, NULL, NULL, 'Kasbon Lebaran', '2025-09-19 03:49:12'),
(9, 'Ade', NULL, 'hutang', 670000, '2025-03-11', NULL, 'belum_lunas', 0, NULL, NULL, 'setoran dari data lubeng', '2025-09-19 03:50:24'),
(10, 'Ade', NULL, 'hutang', 637500, '2025-04-24', NULL, 'belum_lunas', 0, NULL, NULL, 'BOP (Biaya Operasional ) 150+105', '2025-09-19 03:51:16'),
(11, 'Ade', NULL, 'hutang', 625000, '2025-06-20', NULL, 'belum_lunas', 0, NULL, NULL, 'BOP', '2025-09-19 03:52:01'),
(12, 'Ade', NULL, 'hutang', 5000000, '2025-06-25', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang', '2025-09-19 03:52:47'),
(13, 'Ade', NULL, 'hutang', 375000, '2025-07-04', NULL, 'belum_lunas', 0, NULL, NULL, 'Sewa Mobil', '2025-09-19 03:53:22'),
(14, 'Ade', NULL, 'hutang', 62500, '2025-08-14', NULL, 'belum_lunas', 0, NULL, NULL, 'Bop', '2025-09-19 03:53:49'),
(15, 'Ael', NULL, 'hutang', 10950000, '2025-09-19', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang Setoran ( tanggal baru dibuat )', '2025-09-19 04:10:23'),
(16, 'Ael', NULL, 'hutang', 5185000, '2025-09-19', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang +setoran & BOP ( Tanggal baru dibuat )', '2025-09-19 04:12:48'),
(17, 'Jawa', NULL, 'hutang', 4587500, '2025-09-10', NULL, 'belum_lunas', 0, NULL, NULL, 'Hutang Beli Aki', '2025-09-19 04:14:49'),
(18, 'Ade', NULL, 'hutang', 375000, '2025-10-02', NULL, 'lunas', 150000, NULL, NULL, 'BOP ( rafi )', '2025-10-02 14:14:08'),
(19, 'Jhon', '', 'hutang', 200000, '2025-10-12', NULL, 'lunas', 200000, '2025-10-12 17:00:00', '2025-10-12 17:00:00', 'BOP', '2025-10-16 23:23:11'),
(20, 'Jhon', '', 'hutang', 200000, '2025-10-21', NULL, 'lunas', 200000, '2025-10-20 17:00:00', '2025-10-20 17:00:00', 'BOP', '2025-10-21 08:27:04');

-- --------------------------------------------------------

--
-- Table structure for table `debt_payments`
--

CREATE TABLE `debt_payments` (
  `id` int(11) NOT NULL,
  `debt_id` int(11) NOT NULL,
  `driver` varchar(255) DEFAULT NULL,
  `amount` int(11) NOT NULL DEFAULT 0,
  `paid_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `debt_payments`
--

INSERT INTO `debt_payments` (`id`, `debt_id`, `driver`, `amount`, `paid_at`, `notes`, `created_at`) VALUES
(0, 19, 'Jhon', 200000, '2025-10-12 17:00:00', 'BOP', '2025-10-16 23:23:24');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `vehicle` varchar(128) DEFAULT NULL,
  `type` varchar(128) DEFAULT NULL,
  `expiry` date DEFAULT NULL,
  `renewalCost` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `vehicle`, `type`, `expiry`, `renewalCost`, `created_at`) VALUES
(2, 'B 9289 TDC', 'Pajak', '2025-05-21', 1450000, '2025-09-19 04:32:31'),
(3, 'B 9467 TYW', 'Pajak', '2026-04-14', 1000000, '2025-09-19 04:33:46'),
(4, 'F 8450 MC', 'Pajak', '2025-08-01', 1200000, '2025-09-19 04:37:14'),
(5, 'B 9319 UDB', 'Pajak', '2025-06-04', 1450000, '2025-09-19 04:37:55'),
(6, 'F 8387 MC', 'Pajak', '2025-06-21', 1200000, '2025-09-19 04:40:17'),
(7, 'F 8387 MC', 'KIR', '2026-03-18', 1200000, '2025-10-01 14:03:38'),
(8, 'B 9289 TDC', 'KIR', '2026-02-28', 1450000, '2025-10-01 14:11:33'),
(9, 'F 8450 MC', 'KIR', '2026-03-17', 1200000, '2025-10-01 14:13:12'),
(10, 'B 9467 TYW', 'KIR', '2025-12-20', 1450000, '2025-10-01 14:15:32'),
(11, 'B 9319 UDB', 'KIR', '2026-02-28', 1450000, '2025-10-01 14:18:13');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `vehicle` varchar(128) DEFAULT NULL,
  `vehicleType` varchar(64) DEFAULT NULL,
  `vehicleYear` varchar(16) DEFAULT NULL,
  `status` varchar(32) DEFAULT 'aktif',
  `joinDate` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `phone`, `email`, `address`, `vehicle`, `vehicleType`, `vehicleYear`, `status`, `joinDate`, `created_at`) VALUES
(1, 'Asep', '+62 812-3456-7890', 'asep@okekkirim.com', 'Grand Kahuripan', 'B 9289 TDC', 'CDE', '2021', 'aktif', '2025-03-01', '2025-09-17 14:07:07'),
(2, 'Ade', '+62 897-3192-770', 'ade@okekirim.com', 'Cileungsi Kidul', 'F 8450 MC', 'CDE', '2023', 'aktif', '2025-04-17', '2025-09-17 14:54:02'),
(3, 'Pudini', '+62 838-0874-8900', 'pudini@okekirim.com', 'Singasari', 'B 9467 TYW', 'CDE', '2023', 'aktif', '2025-03-01', '2025-09-17 14:56:10'),
(4, 'Jhon', '+62 819-0829-7952', 'jhon@okekirim.com', 'Jonggol', 'F 8387 MC', 'CDE', '2023', 'aktif', '2024-12-01', '2025-09-17 15:10:42'),
(5, 'Jawa', '+62 857-7618-8150', 'jawa@okekirim.com', 'Mampir', 'B 9319 UDB', 'CDD', '2015', 'aktif', '2025-08-06', '2025-09-17 15:12:58'),
(6, 'Ael', '+62 822-6659-8622', 'ael@okekirim.com', 'Mampir', 'Mobil Sudah Ditarik', 'CDD', '2018', 'nonaktif', '2025-04-21', '2025-09-19 04:04:46');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `driver` varchar(255) DEFAULT NULL,
  `vehicle` varchar(128) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `rit` varchar(32) DEFAULT NULL,
  `orderType` varchar(32) DEFAULT 'online',
  `fare` int(11) DEFAULT 0,
  `status` varchar(32) DEFAULT 'nunggak',
  `companyShare` int(11) DEFAULT 0,
  `paidCompanyAmount` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_notes` text DEFAULT NULL,
  `lastPaidAt` datetime DEFAULT NULL,
  `paidOffAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `driver`, `vehicle`, `date`, `origin`, `destination`, `rit`, `orderType`, `fare`, `status`, `companyShare`, `paidCompanyAmount`, `notes`, `created_at`, `payment_notes`, `lastPaidAt`, `paidOffAt`) VALUES
(1, 'Asep', NULL, '2025-09-29', 'PT Fuchs Indonesia', 'Ciangsana', '1', 'online', 381850, 'lunas', 152740, 152740, 'lunas', '2025-09-19 02:54:23', 'lunas', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(2, 'Pudini', NULL, '2025-09-25', 'Cikarang', 'Cilamaya', '1', 'offline', 741000, 'lunas', 296400, 296400, '', '2025-09-19 02:59:32', '', '2025-10-24 17:00:00', '2025-10-24 17:00:00'),
(3, 'Asep', NULL, '2025-09-03', 'Jakarta Timur', 'Cilacap', '1', 'offline', 2000000, 'lunas', 800000, 800000, 'lunas', '2025-09-19 03:00:55', 'lunas', '2025-10-07 17:00:00', '2025-10-07 17:00:00'),
(4, 'Asep', NULL, '2025-09-10', 'Gandoang', 'Jakarta Selatan', '1', 'offline', 450000, 'lunas', 180000, 180000, '', '2025-09-19 03:02:08', '', '2025-10-07 17:00:00', '2025-10-07 17:00:00'),
(5, 'Asep', NULL, '2025-09-12', 'Bekasi', 'Cikarang, Bandung', '1', 'online', 960300, 'nunggak', 384120, 0, '', '2025-09-19 03:03:24', NULL, NULL, NULL),
(6, 'Ade', NULL, '2025-05-06', 'Jatiasih', 'Jakarta Selatan', '1', 'online', 480000, 'nunggak', 192000, 0, '', '2025-09-19 03:08:33', NULL, NULL, NULL),
(7, 'Ade', NULL, '2025-05-07', 'Bekasi', 'Jakarta Barat', '1', 'online', 567000, 'nunggak', 226800, 0, '', '2025-09-19 03:10:49', NULL, NULL, NULL),
(8, 'Ade', NULL, '2025-05-08', 'Kosambi', 'Bandung', '1', 'online', 918000, 'nunggak', 367200, 0, '', '2025-09-19 03:12:12', NULL, NULL, NULL),
(9, 'Ade', NULL, '2025-05-13', 'Pt Halarag Baja Utama', 'Cipanas', '1', 'offline', 750000, 'nunggak', 300000, 0, '', '2025-09-19 03:13:03', NULL, NULL, NULL),
(10, 'Ade', NULL, '2025-05-31', 'Jakarta Selatan', 'Cimanggis', '2', 'online', 800000, 'nunggak', 320000, 250000, '', '2025-09-19 03:14:20', NULL, NULL, NULL),
(11, 'Ade', NULL, '2025-08-02', 'Pangkalan 2', 'Wanaherang', '1', 'offline', 300000, 'nunggak', 120000, 0, '', '2025-09-19 03:20:18', NULL, NULL, NULL),
(12, 'Ade', NULL, '2025-09-13', 'Cibarusah', 'Citeureup', '1', 'offline', 400000, 'nunggak', 160000, 0, '', '2025-09-19 03:21:12', NULL, NULL, NULL),
(32, 'Ade', NULL, '2025-09-26', 'Bogor', 'Karawang', '1', 'online', 645000, 'nunggak', 258000, 218000, 'cicil dlu', '2025-09-19 04:18:02', NULL, NULL, NULL),
(34, 'Asep', NULL, '2025-09-29', 'Cimahpar', 'Jakarta', '1', 'online', 415927, 'nunggak', 166371, 0, '', '2025-09-30 23:22:53', NULL, NULL, NULL),
(35, 'Ade', NULL, '2025-09-27', 'Mal Ciputra Cibubur', 'Serpong', '1', 'offline', 450000, 'nunggak', 180000, 0, '', '2025-09-30 23:33:45', NULL, NULL, NULL),
(36, 'Ade', NULL, '2025-09-29', 'Cipeucang', 'Karawang', '1', 'offline', 500000, 'lunas', 200000, 200000, 'bayar 1 okt', '2025-09-30 23:34:34', NULL, NULL, NULL),
(37, 'Jawa', NULL, '2025-09-29', 'Pt. Galvindo Ampuh', 'PT HASTA PRIMA SEJAHTERA', '1', 'online', 468810, 'lunas', 187524, 187524, '', '2025-09-30 23:37:52', '', '2025-10-11 17:00:00', '2025-10-11 17:00:00'),
(38, 'Jawa', NULL, '2025-09-30', 'Cipeucang', 'Bogor', '1', 'offline', 750000, 'lunas', 300000, 300000, '300000', '2025-09-30 23:38:41', NULL, NULL, NULL),
(40, 'Asep', NULL, '2025-10-01', 'Jakarta Utara', 'Kudus, Jawa Tengah', '1', 'online', 2393636, 'nunggak', 957454, 933189, 'nyicil', '2025-10-01 01:02:38', 'nyicil', '2025-10-16 17:00:00', NULL),
(41, 'Jhon', NULL, '2025-10-01', 'Bekasi', 'Bekasi', '1', 'offline', 304920, 'lunas', 121968, 121968, 'bayar tanggal 2 okt', '2025-10-01 13:17:14', NULL, NULL, NULL),
(42, 'Ade', NULL, '2025-10-01', 'Cipeucang', 'Cimanggis', '1', 'offline', 350000, 'lunas', 140000, 140000, 'bayar 1 okt', '2025-10-01 13:19:08', NULL, NULL, NULL),
(43, 'Ade', NULL, '2025-10-01', 'Klapanunggal', 'Cileungsi', '1', 'offline', 250000, 'lunas', 100000, 100000, 'bayar tanggal 1 okt', '2025-10-01 13:20:21', NULL, NULL, NULL),
(44, 'Pudini', NULL, '2025-10-01', 'Bekasi', 'Cikarang', '1', 'online', 253444, 'lunas', 101378, 101378, '', '2025-10-01 13:22:52', NULL, NULL, NULL),
(46, 'Ade', NULL, '2025-10-02', 'Yasmin', 'Cikuda', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-02 14:14:49', NULL, NULL, NULL),
(47, 'Ade', NULL, '2025-10-02', 'Cileungsi ', 'Pamulang', '1', 'online', 453000, 'lunas', 181200, 181200, '', '2025-10-02 14:15:28', NULL, NULL, NULL),
(48, 'Ade', NULL, '2025-10-02', 'Pamulang ', 'Rawa Lumbu', '1', 'online', 325000, 'lunas', 130000, 130000, '', '2025-10-02 14:16:06', NULL, NULL, NULL),
(49, 'Pudini', NULL, '2025-10-02', 'Bojong ', 'Nambo', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-03 00:18:17', NULL, NULL, NULL),
(50, 'Jhon', NULL, '2025-10-02', 'Cileungsi Kidul', 'Bekasi', '1', 'online', 267023, 'lunas', 106809, 106809, '', '2025-10-03 00:29:09', NULL, NULL, NULL),
(51, 'Ade', NULL, '2025-10-03', 'Jatiasih', 'Harapan Indah', '1', 'online', 315000, 'lunas', 126000, 126000, '', '2025-10-03 10:48:24', '', '2025-10-05 07:05:03', '2025-10-05 07:05:03'),
(52, 'Pudini', NULL, '2025-10-02', 'Cikarang', 'Cikarang', '1', 'offline', 250000, 'lunas', 100000, 100000, 'bayarnya tanggal 3', '2025-10-03 23:44:27', 'bayarnya tanggal 3', '2025-10-05 07:10:34', '2025-10-05 07:10:34'),
(53, 'Pudini', NULL, '2025-10-03', 'Klapanunggal', 'Jakarta', '1', 'offline', 500000, 'lunas', 200000, 200000, 'bayarnya tanggal 3', '2025-10-03 23:45:23', 'bayarnya tanggal 3', '2025-10-05 07:10:46', '2025-10-05 07:10:46'),
(54, 'Ade', NULL, '2025-10-04', 'Cikuda', 'Cikarang', '1', 'online', 450000, 'lunas', 180000, 180000, '', '2025-10-04 09:10:45', '', '2025-10-05 07:05:07', '2025-10-05 07:05:07'),
(55, 'Ade', NULL, '2025-10-04', 'Cikarang Pusat', 'Sadang', '1', 'online', 492000, 'lunas', 196800, 196800, '', '2025-10-04 09:11:20', '', '2025-10-05 07:05:10', '2025-10-05 07:05:10'),
(56, 'Jawa', NULL, '2025-10-04', 'Cikarang Selatan', 'Klapanunggal', '1', 'online', 500000, 'lunas', 200000, 200000, 'aslinya 563.633, potongan lalamove', '2025-10-05 07:12:46', 'aslinya 563.633, potongan lalamove', '2025-10-09 17:00:00', '2025-10-09 17:00:00'),
(57, 'Asep', NULL, '2025-10-05', 'Bogor', 'Cimahpar', '1', 'offline', 500000, 'nunggak', 200000, 0, '', '2025-10-06 00:26:45', NULL, NULL, NULL),
(58, 'Pudini', NULL, '2025-10-04', 'Citra Indah', 'Cileungsi', '1', 'offline', 300000, 'lunas', 120000, 120000, '', '2025-10-06 00:33:10', '', '2025-10-06 12:33:54', '2025-10-06 12:33:54'),
(59, 'Pudini', NULL, '2025-10-06', 'Griya Alam Sentosa', 'Jakarta', '1', 'online', 500000, 'lunas', 200000, 200000, 'lunas', '2025-10-06 12:35:36', 'lunas', '2025-10-23 17:00:00', '2025-10-23 17:00:00'),
(60, 'Ade', NULL, '2025-10-07', 'Cileungsi', 'Citeureup', '1', 'online', 305000, 'lunas', 122000, 122000, '', '2025-10-07 14:06:03', '', '2025-10-06 17:00:00', '2025-10-06 17:00:00'),
(61, 'Pudini', NULL, '2025-10-07', 'Cikarang', 'Ciangsana', '1', 'online', 366000, 'lunas', 146400, 146400, '', '2025-10-07 14:08:13', '', '2025-10-07 17:00:00', '2025-10-07 17:00:00'),
(62, 'Asep', NULL, '2025-10-08', 'Sukabumi', 'Leuwiliyang', '1', 'offline', 850000, 'nunggak', 340000, 0, '', '2025-10-08 10:06:57', NULL, NULL, NULL),
(63, 'Ade', NULL, '2025-10-09', 'Gandoang', 'Karawang', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-09 14:00:47', '', '2025-10-08 17:00:00', '2025-10-08 17:00:00'),
(64, 'Pudini', NULL, '2025-10-09', 'Jatiasih', 'Nanggewer', '1', 'online', 373000, 'lunas', 149200, 149200, '', '2025-10-09 14:02:15', '', '2025-10-08 17:00:00', '2025-10-08 17:00:00'),
(65, 'Jawa', NULL, '2025-10-09', 'Subang', 'Tangerang', '1', 'offline', 2500000, 'lunas', 1000000, 1000000, '', '2025-10-09 14:09:03', '', '2025-10-09 17:00:00', '2025-10-09 17:00:00'),
(66, 'Asep', NULL, '2025-10-09', 'Karawang Barat', 'Bandung', '1', 'online', 812000, 'lunas', 324800, 324800, '', '2025-10-09 14:10:23', '', '2025-10-11 17:00:00', '2025-10-11 17:00:00'),
(67, 'Ade', NULL, '2025-10-11', 'Jambu 2', 'Cikuda', '1', 'offline', 450000, 'lunas', 180000, 180000, '', '2025-10-13 03:59:19', '', '2025-10-12 17:00:00', '2025-10-12 17:00:00'),
(68, 'Ade', NULL, '2025-10-11', 'Cikuda', 'Karawang', '1', 'online', 503000, 'lunas', 201200, 201200, '', '2025-10-13 04:00:02', '', '2025-10-12 17:00:00', '2025-10-12 17:00:00'),
(69, 'Ade', NULL, '2025-10-12', 'Cikarang', 'Sadang', '1', 'online', 500000, 'lunas', 200000, 200000, '', '2025-10-13 04:00:48', '', '2025-10-12 17:00:00', '2025-10-12 17:00:00'),
(70, 'Asep', NULL, '2025-10-10', 'bekasi', 'pangkalan 2', '1', 'online', 370449, 'lunas', 148180, 148180, '', '2025-10-13 04:11:12', '', '2025-10-11 17:00:00', '2025-10-11 17:00:00'),
(71, 'Asep', NULL, '2025-10-11', 'Depok', 'Bogor', '1', 'online', 461500, 'lunas', 184600, 184600, '', '2025-10-13 04:14:20', '', '2025-10-14 17:00:00', '2025-10-14 17:00:00'),
(72, 'Asep', NULL, '2025-10-13', 'tangerang', 'Cipayung', '1', 'online', 510616, 'lunas', 204246, 204246, '', '2025-10-13 04:16:38', '', '2025-10-14 17:00:00', '2025-10-14 17:00:00'),
(73, 'Jawa', NULL, '2025-10-11', 'Kotawisata', 'Kotawisata', '1', 'offline', 400000, 'lunas', 160000, 160000, '', '2025-10-13 04:20:37', '', '2025-10-11 17:00:00', '2025-10-11 17:00:00'),
(74, 'Jhon', NULL, '2025-10-11', 'Jonggol', 'Jakarta Barat', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-13 04:24:11', '', '2025-10-10 17:00:00', '2025-10-10 17:00:00'),
(75, 'Pudini', NULL, '2025-10-11', 'Cikarang', 'Tangerang', '1', 'online', 486000, 'lunas', 194400, 194400, '', '2025-10-13 04:28:21', '', '2025-10-11 17:00:00', '2025-10-11 17:00:00'),
(76, 'Asep', NULL, '2025-10-14', 'Bekasi', 'Bogor', '1', 'online', 558225, 'lunas', 223290, 223290, '', '2025-10-14 13:50:09', '', '2025-10-14 17:00:00', '2025-10-14 17:00:00'),
(77, 'Ade', NULL, '2025-10-14', 'Citereup', 'Bogor', '1', 'online', 500000, 'lunas', 200000, 200000, '', '2025-10-14 13:51:06', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(78, 'Pudini', NULL, '2025-10-13', 'Cikarang', 'Cikarang', '1', 'online', 442000, 'lunas', 176800, 176800, '', '2025-10-14 13:52:37', '', '2025-10-12 17:00:00', '2025-10-12 17:00:00'),
(79, 'Pudini', NULL, '2025-10-14', 'Cibitung', 'Burangkeng', '1', 'online', 276000, 'lunas', 110400, 110400, '', '2025-10-14 13:53:26', '', '2025-10-13 17:00:00', '2025-10-13 17:00:00'),
(80, 'Jawa', NULL, '2025-10-14', 'Cibutut', 'Tangerang', '1', 'online', 1000000, 'lunas', 400000, 400000, '', '2025-10-14 13:55:43', '', '2025-10-15 17:00:00', '2025-10-15 17:00:00'),
(81, 'Ade', NULL, '2025-10-15', 'Cikiwul', 'Lippo Cikarang', '1', 'online', 302000, 'lunas', 120800, 120800, '', '2025-10-15 12:33:34', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(82, 'Asep', NULL, '2025-10-15', 'Cileungsi', 'Rawamangun', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-15 12:34:58', '', '2025-10-14 17:00:00', '2025-10-14 17:00:00'),
(83, 'Asep', NULL, '2025-10-15', 'Cempaka Putih', 'Bekasi', '1', 'online', 301556, 'lunas', 120622, 120622, '', '2025-10-15 12:36:56', '', '2025-10-14 17:00:00', '2025-10-14 17:00:00'),
(84, 'Ade', NULL, '2025-10-16', 'Cibarush', 'Pik', '1', 'online', 550000, 'lunas', 220000, 220000, '', '2025-10-16 23:04:33', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(85, 'Ade', NULL, '2025-10-15', 'Mal Ciputra Cibubur', 'Mampir', '1', 'offline', 250000, 'lunas', 100000, 100000, '', '2025-10-16 23:07:33', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(86, 'Asep', NULL, '2025-10-16', 'Tapos, depok', 'Tangerang', '1', 'online', 500000, 'lunas', 200000, 200000, '', '2025-10-16 23:10:40', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(87, 'Asep', NULL, '2025-10-16', 'Jakarta Utara', 'Gunung Putri', '1', 'online', 431876, 'lunas', 172750, 172750, '', '2025-10-16 23:12:29', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(89, 'Jawa', NULL, '2025-10-16', 'Bekasi', 'Purwakarta', '1', 'offline', 750000, 'lunas', 300000, 300000, '', '2025-10-16 23:17:22', '', '2025-10-15 17:00:00', '2025-10-15 17:00:00'),
(90, 'Pudini', NULL, '2025-10-16', 'Cikuda', 'Priok', '1', 'offline', 550000, 'lunas', 220000, 220000, '', '2025-10-16 23:20:38', '', '2025-10-15 17:00:00', '2025-10-15 17:00:00'),
(91, 'Asep', NULL, '2025-10-17', 'Citereup', 'Cikarang & serang', '1', 'offline', 1200000, 'lunas', 480000, 480000, '', '2025-10-17 06:26:15', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(92, 'Ade', NULL, '2025-10-17', 'Cikuda', 'Tangerang', '1', 'offline', 900000, 'lunas', 360000, 360000, '', '2025-10-17 12:34:46', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(93, 'Pudini', NULL, '2025-10-17', 'Jonggol', 'Cikarang', '1', 'online', 436000, 'lunas', 174400, 174400, '', '2025-10-18 02:21:01', '', '2025-10-16 17:00:00', '2025-10-16 17:00:00'),
(94, 'Ade', NULL, '2025-10-18', 'keranggan', 'Senayan', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-19 13:57:44', '', '2025-10-19 17:00:00', '2025-10-19 17:00:00'),
(95, 'Jhon', NULL, '2025-10-18', 'Griya Bukit Jaya', 'Gunung Putri', '1', 'offline', 750000, 'nunggak', 300000, 250000, '50 lagi', '2025-10-19 13:59:44', '50 lagi', '2025-10-19 17:00:00', NULL),
(96, 'Pudini', NULL, '2025-10-18', 'Jonggol', 'Jonggol', '1', 'offline', 400000, 'lunas', 160000, 160000, 'Lunas', '2025-10-19 14:03:42', 'Lunas', '2025-10-20 17:00:00', '2025-10-20 17:00:00'),
(97, 'Pudini', NULL, '2025-10-20', 'Jonggol', 'Tangerang', '1', 'online', 657000, 'lunas', 262800, 262800, '', '2025-10-21 06:51:14', '', '2025-10-20 17:00:00', '2025-10-20 17:00:00'),
(98, 'Pudini', NULL, '2025-10-20', 'tangerang', 'Jakarta', '1', 'online', 418000, 'lunas', 167200, 167200, '', '2025-10-21 06:51:57', '', '2025-10-20 17:00:00', '2025-10-20 17:00:00'),
(99, 'Ade', NULL, '2025-10-21', 'Cikarang', 'Ciangsana', '1', 'online', 355000, 'lunas', 142000, 142000, '', '2025-10-22 02:13:43', '', '2025-10-21 17:00:00', '2025-10-21 17:00:00'),
(100, 'Asep', NULL, '2025-10-21', 'Bekasi', 'Ciangsana', '1', 'online', 356976, 'nunggak', 142790, 0, '', '2025-10-22 02:16:35', NULL, NULL, NULL),
(101, 'Asep', NULL, '2025-10-22', 'Bogor', 'Bandung', '1', 'online', 829500, 'nunggak', 331800, 0, '', '2025-10-22 02:18:25', NULL, NULL, NULL),
(102, 'Jawa', NULL, '2025-10-21', 'Klapanunggal', 'Jakarta', '1', 'online', 800000, 'lunas', 320000, 320000, '', '2025-10-22 02:22:26', '', '2025-10-21 17:00:00', '2025-10-21 17:00:00'),
(103, 'Jhon', NULL, '2025-10-21', 'Cibarusah', 'Kerawang', '1', 'offline', 560000, 'lunas', 224000, 224000, '', '2025-10-22 02:27:12', '', '2025-10-21 17:00:00', '2025-10-21 17:00:00'),
(104, 'Pudini', NULL, '2025-10-21', 'Jababeka', 'Ciangsana', '1', 'online', 356000, 'lunas', 142400, 142400, '', '2025-10-22 02:31:24', '', '2025-10-24 17:00:00', '2025-10-24 17:00:00'),
(105, 'Jawa', NULL, '2025-10-22', 'Cileungsi', 'Cianjur', '1', 'online', 750000, 'lunas', 300000, 300000, '', '2025-10-22 14:43:39', '', '2025-10-22 17:00:00', '2025-10-22 17:00:00'),
(106, 'Pudini', NULL, '2025-10-22', 'Klapanunggal', 'Cikarang Jati', '1', 'online', 277574, 'lunas', 111030, 111030, '', '2025-10-22 14:47:18', '', '2025-10-21 17:00:00', '2025-10-21 17:00:00'),
(107, 'Asep', NULL, '2025-10-23', 'Bekasi', 'Cianjur', '1', 'online', 605898, 'nunggak', 242359, 0, '', '2025-10-23 12:39:33', NULL, NULL, NULL),
(108, 'Jawa', NULL, '2025-10-24', 'Tambun', 'Bogor', '1', 'online', 716400, 'nunggak', 286560, 0, '', '2025-10-24 14:44:32', NULL, NULL, NULL),
(109, 'Jhon', NULL, '2025-10-24', 'Cileungsi', 'Bandung', '1', 'online', 700000, 'lunas', 280000, 280000, '', '2025-10-24 14:54:20', '', '2025-10-23 17:00:00', '2025-10-23 17:00:00'),
(110, 'Pudini', NULL, '2025-10-24', 'Cileungsi', 'Kasablanka', '1', 'online', 494475, 'nunggak', 197790, 27600, '', '2025-10-24 14:56:50', '', '2025-10-24 17:00:00', NULL),
(111, 'Ade', NULL, '2025-10-25', 'Gunung Putri', 'Tangerang', '1', 'offline', 600000, 'nunggak', 240000, 0, '', '2025-10-24 15:13:22', NULL, NULL, NULL),
(112, 'Pudini', NULL, '2025-10-23', 'Cileungsi', 'Bogor', '1', 'offline', 500000, 'lunas', 200000, 200000, '', '2025-10-24 23:12:31', '', '2025-10-24 17:00:00', '2025-10-24 17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `vehicle` varchar(128) DEFAULT NULL,
  `driver` varchar(255) DEFAULT NULL,
  `type` varchar(128) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `status` varchar(32) DEFAULT 'terjadwal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `receipt` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `vehicle`, `driver`, `type`, `date`, `cost`, `status`, `created_at`, `receipt`) VALUES
(2, 'F 8450 MC', NULL, 'Beli Minyak Rem', '2025-10-02', 55000, 'selesai', '2025-10-06 00:35:32', 'img/service-receipts/receipt_20251005_203622_2c64e15f.jpg'),
(3, 'B 9467 TYW', NULL, 'Seal ban kanan dan minyak rem', '2025-10-20', 110000, 'selesai', '2025-10-22 02:34:06', NULL),
(4, 'F 8450 MC', NULL, 'ganti dinamo', '2025-10-23', 1100000, 'selesai', '2025-10-23 12:36:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `created_at`, `reset_token`, `reset_expires`) VALUES
(1, 'Arafi', 'mohamadarraafi@gmail.com', '$2y$10$moTktD1Yis0ZkWRWDiP5kOMT2Tdth8L9Clcl2WEV4xfyWXJJBEnmG', '2025-09-17 16:26:09', '76bce12834ef65bbd4a5562c9aadf53aa639fbcfe1fdc5f82b38876bbdc04712', '2025-09-18 18:49:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `debts`
--
ALTER TABLE `debts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `debt_payments`
--
ALTER TABLE `debt_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_debt_payments_debt` (`debt_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `debts`
--
ALTER TABLE `debts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `debt_payments`
--
ALTER TABLE `debt_payments`
  ADD CONSTRAINT `fk_debt_payments_debt` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
