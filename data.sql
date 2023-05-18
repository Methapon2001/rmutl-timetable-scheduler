-- MariaDB dump 10.19  Distrib 10.6.12-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dev
-- ------------------------------------------------------
-- Server version	10.6.12-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Building`
--

DROP TABLE IF EXISTS `Building`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Building` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Building_createdByUserId_fkey` (`createdByUserId`),
  KEY `Building_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Building_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Building_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Building`
--

LOCK TABLES `Building` WRITE;
/*!40000 ALTER TABLE `Building` DISABLE KEYS */;
INSERT INTO `Building` VALUES ('_UBY8Kqv-OWOZRcR','ทค1','เทคนิคคอมพิวเตอร์ 1','v1__FVXkUN5VLSxK','2023-05-01 05:08:26.648','v1__FVXkUN5VLSxK','2023-05-01 05:08:26.648'),('-h9dadJ_Sn2JMlHp','ทค2','เทคนิคคอมพิวเตอร์ 2','v1__FVXkUN5VLSxK','2023-05-01 05:08:40.691','v1__FVXkUN5VLSxK','2023-05-01 05:08:40.691');
/*!40000 ALTER TABLE `Building` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Course`
--

DROP TABLE IF EXISTS `Course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Course` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Course_createdByUserId_fkey` (`createdByUserId`),
  KEY `Course_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Course_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Course_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Course`
--

LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` VALUES ('2ldmRMZhdgCDBW4d','60E04 Electrical engineering','v1__FVXkUN5VLSxK','2023-05-01 05:28:06.743','ANZSYjC5h5m4JfFp','2023-05-11 04:48:35.820');
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CourseDetail`
--

DROP TABLE IF EXISTS `CourseDetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CourseDetail` (
  `id` varchar(191) NOT NULL,
  `type` enum('compulsory','elective') NOT NULL,
  `subjectId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CourseDetail_subjectId_fkey` (`subjectId`),
  KEY `CourseDetail_courseId_fkey` (`courseId`),
  CONSTRAINT `CourseDetail_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CourseDetail_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CourseDetail`
--

LOCK TABLES `CourseDetail` WRITE;
/*!40000 ALTER TABLE `CourseDetail` DISABLE KEYS */;
INSERT INTO `CourseDetail` VALUES ('_OjtTUtv95q_8wQ8','elective','cJ0Xl9qcYs-BAOTY','2ldmRMZhdgCDBW4d'),('_R1OmsH2ZnU8QJ8K','compulsory','F9Ug5J8D9KBko-oA','2ldmRMZhdgCDBW4d'),('02oQbc5UknVV0fa6','compulsory','a_NtFkjBd_COL95C','2ldmRMZhdgCDBW4d'),('1HtiHn0ItrTmp7k9','compulsory','A9EXVwbaPYmeC7c1','2ldmRMZhdgCDBW4d'),('20E0a1tfRhKtj7SQ','elective','-_76Q8Kp4ZxAPC8i','2ldmRMZhdgCDBW4d'),('2ufv3qs3Wr8ymFRN','compulsory','frtJPTLed4mHaAzR','2ldmRMZhdgCDBW4d'),('2wKD-AjjMU1vjMTi','elective','02qL-tvBaBG2-eB5','2ldmRMZhdgCDBW4d'),('3EIRb8y5ze_VADnL','elective','5k9lCsvGbODftDpt','2ldmRMZhdgCDBW4d'),('3l23XFctQL6Jo6EV','elective','w2jrGsaUlgA2XP21','2ldmRMZhdgCDBW4d'),('3N7hQc4ZVpelFign','elective','ttRVIbKaTp41ZlLq','2ldmRMZhdgCDBW4d'),('4-2NVz0-g-zSrsKo','elective','edTfYP7E4kLgejfP','2ldmRMZhdgCDBW4d'),('4mdRFh3-zZ2mWLXp','compulsory','XFnv3bmRsKh1j6oD','2ldmRMZhdgCDBW4d'),('5FOwfcOiWhIv3UAw','elective','gR0Hv2BaBvzAlhzc','2ldmRMZhdgCDBW4d'),('78lyxJMPKotmUf6z','compulsory','v4stLcCnK_M8mr4C','2ldmRMZhdgCDBW4d'),('7zmoVCCRd-gA70Ix','compulsory','ohmJlcATcBwdzIi4','2ldmRMZhdgCDBW4d'),('8yWk5yXVq_16fCVI','elective','csr__4_5GitP86wW','2ldmRMZhdgCDBW4d'),('9wNGTI4q_qDmzUqw','elective','uT4ojUY8OTZRoz5y','2ldmRMZhdgCDBW4d'),('AmZWgLScoT6IUABS','compulsory','Er87vHcaZHVG0Y80','2ldmRMZhdgCDBW4d'),('aqiUOANRwzq7Wxwm','compulsory','G2eXvBtb4yjf30RQ','2ldmRMZhdgCDBW4d'),('avtc1sOpDrx88iU2','elective','_Gd0sE1nqNKfwhYF','2ldmRMZhdgCDBW4d'),('btIx67gjMMt_AlEq','elective','xDBrS8j0TljY8sSZ','2ldmRMZhdgCDBW4d'),('ckqOKqX7ZFyFuWIe','compulsory','vvIlcQySMjSu56Cl','2ldmRMZhdgCDBW4d'),('CP6L6c65SXNWbuyt','elective','0FAhC3a1m5zRRl_w','2ldmRMZhdgCDBW4d'),('cyuNFb6diTbISdmn','compulsory','qVwN_Yc7OGXyduxT','2ldmRMZhdgCDBW4d'),('cZlGf6k3lfDAh7c8','elective','-AzkZog5_EK3WsAT','2ldmRMZhdgCDBW4d'),('CzUPxCisQtabOQes','elective','mUwHHAAxC6n1ELNg','2ldmRMZhdgCDBW4d'),('f5vIYvpE_JEMhN2C','elective','9htVs8xQ2kDnzpYC','2ldmRMZhdgCDBW4d'),('GFk0KZcUl-boUW48','elective','j9Q9Jihn2ZOmt1pw','2ldmRMZhdgCDBW4d'),('grURq-O_RrXkGbsw','elective','bSit2S-lgaOaNrfK','2ldmRMZhdgCDBW4d'),('HbVQg3xeXuhL1245','compulsory','SGwIWCcr28SzLWN5','2ldmRMZhdgCDBW4d'),('Hg50e0LbLrPstJoP','compulsory','67QfVq1FKLsChcR5','2ldmRMZhdgCDBW4d'),('hgRB-zfvdh0_oAbc','elective','4sEIBXCGcvvy5y0a','2ldmRMZhdgCDBW4d'),('HSG1oQ-uzEOaKKN0','elective','8hx8lEV2ooEMLQ8M','2ldmRMZhdgCDBW4d'),('i6PL1hKYzywIbVR2','compulsory','XnbxtuKiC1uOV-wt','2ldmRMZhdgCDBW4d'),('iofYzYdJs0BQ8ILD','compulsory','tIGParx304tXl0Hg','2ldmRMZhdgCDBW4d'),('JKQuP6Ygvp_-YGbS','compulsory','U4GLeSYZXNwJdUBp','2ldmRMZhdgCDBW4d'),('kaPhQlkAHwa3Uiq0','compulsory','nbSMkaVEnUDRVY7V','2ldmRMZhdgCDBW4d'),('KC8CG0gqBFSMpT-u','compulsory','sd77q3Yj9Syq53Rp','2ldmRMZhdgCDBW4d'),('KjeAieUgqWI7jzYE','elective','_tcl9h058VlvoRSx','2ldmRMZhdgCDBW4d'),('KWhadFlvlHIcSrvc','elective','naBrJZ5Phw6EdJDj','2ldmRMZhdgCDBW4d'),('LCZ2hrQMt2crAFYS','elective','-1ljsjDwLtPeDib0','2ldmRMZhdgCDBW4d'),('LhKTNqzXpw7kGZig','compulsory','K0ZJ0fVQse0Sd4nj','2ldmRMZhdgCDBW4d'),('LpK6CjnIFq3KLrrv','elective','lGIp23WzLYAScv1l','2ldmRMZhdgCDBW4d'),('luXokekDlB6iNUzK','elective','bIKvjZkdXU5_iVOp','2ldmRMZhdgCDBW4d'),('mcTNEzHzcDDmw0pT','compulsory','h8bsZGd3RBFOwe4u','2ldmRMZhdgCDBW4d'),('Mn2OkChz805uUM85','elective','XaJk6RJoQH_3_GtT','2ldmRMZhdgCDBW4d'),('NAfETPRZ0oLcRGXX','elective','HqZ31CwquA_wwXtN','2ldmRMZhdgCDBW4d'),('NKBefkTEf_P0DzFY','elective','AV9Aqx9EfF_47M9t','2ldmRMZhdgCDBW4d'),('NNTgAhhjF-kQLlK3','elective','yxWz5brifgbXrae2','2ldmRMZhdgCDBW4d'),('O6NETBV5mXICRkJA','compulsory','z_67M6WcnXqDNXvi','2ldmRMZhdgCDBW4d'),('OA5486iWgbBGcIjJ','elective','qdkiwzmlqMfPzbOq','2ldmRMZhdgCDBW4d'),('OcAOdc5r_Zmh-FBR','elective','nTtmfcDJjXwJxC1K','2ldmRMZhdgCDBW4d'),('PDGldhpfRcHnPIvh','elective','y3Nm6Q-8RDmyEGZa','2ldmRMZhdgCDBW4d'),('PLw_SuwQC-gMyqZz','compulsory','_2Mq-pObCAZGXkh9','2ldmRMZhdgCDBW4d'),('PpUhjAsP7cPYA2e4','compulsory','gyAm_77uAwh2sQbS','2ldmRMZhdgCDBW4d'),('Qe0adfR7mZ_aLQ7h','compulsory','US8ETHTaJcCp1HGL','2ldmRMZhdgCDBW4d'),('qr0E_fSyHcI_8Ijl','elective','gMi4h4N2eG43xBQR','2ldmRMZhdgCDBW4d'),('QWJSHGKxrR_xWQxi','compulsory','j-KqmyGTI-Fee_nn','2ldmRMZhdgCDBW4d'),('r5kTAwYAH6aR9AVz','compulsory','Fcyp7OET_C8fUtsp','2ldmRMZhdgCDBW4d'),('RxTpoOsr6FYtca0s','compulsory','h-Ab_4udDBBjnNzE','2ldmRMZhdgCDBW4d'),('S7A7gD7lPxHHK_aG','elective','qYLjEyWffuEzpYPB','2ldmRMZhdgCDBW4d'),('SkbSLrXokZkumrd1','compulsory','23ioRKkWlxfoZJh_','2ldmRMZhdgCDBW4d'),('smhJcU-FoHkl3pkQ','compulsory','pGqnZ6HP8GcF16rF','2ldmRMZhdgCDBW4d'),('sszd_YvCss-2n28Q','compulsory','4oVgjhC1f2J1utLR','2ldmRMZhdgCDBW4d'),('tYHR8PyVcffv2YNO','elective','puFg5Og4PnZUGamk','2ldmRMZhdgCDBW4d'),('ULTUTEB4LlObUx6W','elective','7SONyKuqMGjZtQME','2ldmRMZhdgCDBW4d'),('UmlgDH7NnQ24otYu','elective','msWIjC3xK6xFoIwk','2ldmRMZhdgCDBW4d'),('uPPNfVvvk_mQXzTa','elective','06YVosy3QrxFrzwD','2ldmRMZhdgCDBW4d'),('uSP7veo4A3iMfpVh','elective','8jVTB0PE73fbRt5Y','2ldmRMZhdgCDBW4d'),('V4kHpcsrYusuFpVm','elective','cPX5IxlkLZspdIPD','2ldmRMZhdgCDBW4d'),('VOblOd_8ROx-W9bZ','elective','5TH_jkRTh5dV8Mml','2ldmRMZhdgCDBW4d'),('VosTivuYeb6cjuEp','elective','e3HEAmaYYXE5smT7','2ldmRMZhdgCDBW4d'),('WacCDcNiOJJ24lw0','elective','sHgFqmzX-6SRDaXq','2ldmRMZhdgCDBW4d'),('wEMYHZYiIyRioCAK','elective','Ysv_QlXBP09E_J46','2ldmRMZhdgCDBW4d'),('X4d57x6J5Kkirndp','compulsory','ggey2na56iaJwxwi','2ldmRMZhdgCDBW4d'),('X5iylwMS-TPELZxh','elective','Nz-kys4FyulnQ9Jx','2ldmRMZhdgCDBW4d'),('X9wc9Xy7nwc4u7Oh','elective','pX81Da7Tz7lVrOxR','2ldmRMZhdgCDBW4d'),('xIcwTdeIfwVxP3fz','compulsory','IBV0ELR5bTAS8BWe','2ldmRMZhdgCDBW4d'),('xmocjdMcoSukDp5V','compulsory','jOrwLyzbP-LyiqqH','2ldmRMZhdgCDBW4d'),('XsLjsxDgC_wLKuPU','elective','U_Pq4xeeenNCIFGh','2ldmRMZhdgCDBW4d'),('Xyc_oOP3WDOdIPI6','elective','YvUfoRXHezEGHjo3','2ldmRMZhdgCDBW4d'),('y4xer7yfov12nq5E','compulsory','q83A8FHsPjWGjIv1','2ldmRMZhdgCDBW4d'),('Yc6n6gYkW-6oiVkt','elective','3mL-uJLgTtbLxPw5','2ldmRMZhdgCDBW4d'),('YLc0xio1NApdgbrI','elective','VAeHPqu0_vwgPeiU','2ldmRMZhdgCDBW4d'),('yPpy4hIrD_Hv0HnC','compulsory','hkrgM2i1h35BnB5J','2ldmRMZhdgCDBW4d'),('yrI_-3XFEE9SUc9R','compulsory','l2fwU0jknq1MkwjP','2ldmRMZhdgCDBW4d'),('zCQ91OK-M-mnvQGV','elective','N6gSo9AQTD05hd5t','2ldmRMZhdgCDBW4d'),('Zpj0A4OQ41CeJf0y','compulsory','Hb3PCpFQUAM1I00L','2ldmRMZhdgCDBW4d');
/*!40000 ALTER TABLE `CourseDetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Exam`
--

DROP TABLE IF EXISTS `Exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Exam` (
  `id` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `roomId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Exam_createdByUserId_fkey` (`createdByUserId`),
  KEY `Exam_updatedByUserId_fkey` (`updatedByUserId`),
  KEY `Exam_roomId_fkey` (`roomId`),
  CONSTRAINT `Exam_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Exam_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Exam_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Exam`
--

LOCK TABLES `Exam` WRITE;
/*!40000 ALTER TABLE `Exam` DISABLE KEYS */;
INSERT INTO `Exam` VALUES ('-_akGAaWkZSc-rlw','v1__FVXkUN5VLSxK','2023-05-04 07:55:27.732','v1__FVXkUN5VLSxK','2023-05-04 07:55:27.732','VlDczOFD_-aCzCnk'),('6utQ5uBrs7OIb63c','v1__FVXkUN5VLSxK','2023-05-04 06:48:34.258','v1__FVXkUN5VLSxK','2023-05-04 06:48:34.258',NULL),('8pp7ZAhGOYlqM86m','v1__FVXkUN5VLSxK','2023-05-04 08:12:56.698','v1__FVXkUN5VLSxK','2023-05-04 08:12:56.698','Rne84YYEN2t0TIOS'),('abIluqNWzTx_MtMb','ANZSYjC5h5m4JfFp','2023-05-11 04:25:10.433','ANZSYjC5h5m4JfFp','2023-05-11 04:25:10.433','u_74IPHKYMIBVnp9'),('EZMC83MRfELgjgWp','v1__FVXkUN5VLSxK','2023-05-08 05:02:18.884','v1__FVXkUN5VLSxK','2023-05-08 05:02:18.884','Rne84YYEN2t0TIOS'),('uoF1d7sfdbBNmyaU','v1__FVXkUN5VLSxK','2023-05-04 07:49:22.100','v1__FVXkUN5VLSxK','2023-05-04 07:49:22.100','Rne84YYEN2t0TIOS');
/*!40000 ALTER TABLE `Exam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Group`
--

DROP TABLE IF EXISTS `Group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Group` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Group_courseId_fkey` (`courseId`),
  KEY `Group_createdByUserId_fkey` (`createdByUserId`),
  KEY `Group_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Group_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Group_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Group_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Group`
--

LOCK TABLES `Group` WRITE;
/*!40000 ALTER TABLE `Group` DISABLE KEYS */;
INSERT INTO `Group` VALUES ('NWef6zN1mZ4xFKas','CE64','2ldmRMZhdgCDBW4d','ANZSYjC5h5m4JfFp','2023-05-11 04:17:59.343','ANZSYjC5h5m4JfFp','2023-05-11 04:17:59.343'),('OKB3625iqpLmzG67','CE65','2ldmRMZhdgCDBW4d','ANZSYjC5h5m4JfFp','2023-05-11 04:18:02.851','ANZSYjC5h5m4JfFp','2023-05-11 04:18:02.851'),('uAlBHr7mDJv9WjgX','CE66','2ldmRMZhdgCDBW4d','v1__FVXkUN5VLSxK','2023-05-01 07:13:20.152','v1__FVXkUN5VLSxK','2023-05-01 07:13:20.152');
/*!40000 ALTER TABLE `Group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Instructor`
--

DROP TABLE IF EXISTS `Instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Instructor` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Instructor_createdByUserId_fkey` (`createdByUserId`),
  KEY `Instructor_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Instructor_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Instructor_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Instructor`
--

LOCK TABLES `Instructor` WRITE;
/*!40000 ALTER TABLE `Instructor` DISABLE KEYS */;
INSERT INTO `Instructor` VALUES ('0SHqN3F3cwPuIsfA','นาง ยุพดี หัตถสิน','v1__FVXkUN5VLSxK','2023-05-01 07:33:28.489','v1__FVXkUN5VLSxK','2023-05-01 07:33:28.489'),('6J26AwXZ13TlFTbB','นาย ณัฐชาสิทธิ์ ชูเกียรติขจร','v1__FVXkUN5VLSxK','2023-05-01 07:36:12.267','v1__FVXkUN5VLSxK','2023-05-01 07:36:12.267'),('9P-MNMNmJSSwJQ5V','นาย สมนึก สุระธง','v1__FVXkUN5VLSxK','2023-05-01 04:34:15.138','v1__FVXkUN5VLSxK','2023-05-01 04:34:15.138'),('EbOURBtfbMvvaPoM','นาย พิชิต ทนันชัย','v1__FVXkUN5VLSxK','2023-05-01 07:32:30.600','v1__FVXkUN5VLSxK','2023-05-01 07:32:30.600'),('ez4IDJtZUdeHy_jx','นาย ปรัชญ์ ปิยะวงศ์วิศาล','v1__FVXkUN5VLSxK','2023-05-01 07:35:02.834','v1__FVXkUN5VLSxK','2023-05-01 07:35:02.834'),('FE3jYf3uI_v6Ef7V','นาย กิตตินันท์ น้อยมณี','v1__FVXkUN5VLSxK','2023-05-01 07:35:41.712','v1__FVXkUN5VLSxK','2023-05-01 07:35:41.712'),('fiepw6p7pLvL1TqW','นาย ธนิต เกตุแก้ว','v1__FVXkUN5VLSxK','2023-05-01 04:31:31.442','v1__FVXkUN5VLSxK','2023-05-01 04:32:39.748'),('HI--X8RYfwLf6NqN','นาย อรรถพล  วิเวก','v1__FVXkUN5VLSxK','2023-05-01 04:29:08.680','v1__FVXkUN5VLSxK','2023-05-01 04:33:03.284'),('iAOMONeueanYTyOH','นาย ศิวศิษฐ์','v1__FVXkUN5VLSxK','2023-05-01 06:47:52.509','v1__FVXkUN5VLSxK','2023-05-01 06:47:52.509'),('iidyYl5NyMXBzafN','นาย จักรภพ ใหม่เสน','v1__FVXkUN5VLSxK','2023-05-01 04:34:12.933','v1__FVXkUN5VLSxK','2023-05-01 04:34:12.933'),('KXnDygIiTSqFu7Em','นาย อนุชล หอมเสียง','v1__FVXkUN5VLSxK','2023-05-01 04:47:47.242','v1__FVXkUN5VLSxK','2023-05-01 04:47:47.242'),('L6csMXqlG7FjnUJ0','นาย ทองคำ สมเพราะ','v1__FVXkUN5VLSxK','2023-05-01 04:45:58.208','v1__FVXkUN5VLSxK','2023-05-01 04:46:05.740'),('MyVjunoxx9rdp-Eu','นาย สัญญา อุทธโยธา','v1__FVXkUN5VLSxK','2023-05-01 07:33:58.480','v1__FVXkUN5VLSxK','2023-05-01 07:33:58.480'),('o2pe7cS9sn6IfMAS','นาย อนันท์ ทับเกิด','v1__FVXkUN5VLSxK','2023-05-01 07:34:26.089','v1__FVXkUN5VLSxK','2023-05-01 07:34:26.089'),('T7vG2VMAGRHAuj4_','นาย อนุพงศ์ ไพโรจน์','v1__FVXkUN5VLSxK','2023-05-01 04:30:47.917','v1__FVXkUN5VLSxK','2023-05-01 04:32:46.402'),('tRwfdfroVEhHS7eA','นาย ปิยพล ยืนยงสถาวร','v1__FVXkUN5VLSxK','2023-05-01 04:30:14.934','v1__FVXkUN5VLSxK','2023-05-01 04:32:52.882'),('w8InueYI5srTkxZW','นาย ขวัญชัย เอื้อวิริยานุกูล ','v1__FVXkUN5VLSxK','2023-05-01 07:31:27.642','v1__FVXkUN5VLSxK','2023-05-01 07:31:27.642'),('xqrTSWnwbriYvo_J','นาย ปณต พุกกะพันธุ์','v1__FVXkUN5VLSxK','2023-05-01 06:47:34.860','v1__FVXkUN5VLSxK','2023-05-01 06:47:34.860'),('XRz39kw6G23bwNDL','นาย ภาณุเดช ทิพย์อักษร','v1__FVXkUN5VLSxK','2023-05-01 07:32:56.761','v1__FVXkUN5VLSxK','2023-05-01 07:32:56.761'),('ZSEXFO25YcoTEDsd','นาย ธีระยุทธ บุนนาค','v1__FVXkUN5VLSxK','2023-05-01 04:47:20.354','v1__FVXkUN5VLSxK','2023-05-01 04:47:20.354');
/*!40000 ALTER TABLE `Instructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Room`
--

DROP TABLE IF EXISTS `Room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Room` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('lecture','lab','both') NOT NULL,
  `buildingId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Room_buildingId_fkey` (`buildingId`),
  KEY `Room_createdByUserId_fkey` (`createdByUserId`),
  KEY `Room_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Room_buildingId_fkey` FOREIGN KEY (`buildingId`) REFERENCES `Building` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Room_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Room_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Room`
--

LOCK TABLES `Room` WRITE;
/*!40000 ALTER TABLE `Room` DISABLE KEYS */;
INSERT INTO `Room` VALUES ('8o1LBot4L3pD9wE3','201','both','-h9dadJ_Sn2JMlHp','v1__FVXkUN5VLSxK','2023-05-01 05:10:14.695','v1__FVXkUN5VLSxK','2023-05-01 05:10:14.695'),('kUUSs_QKQ3DJCOX3','101','lecture','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:12.895','ANZSYjC5h5m4JfFp','2023-05-11 04:17:15.756'),('kXz3gyUMNG7IXNf9','204','both','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:37.937','v1__FVXkUN5VLSxK','2023-05-01 05:09:37.937'),('n0w4EmaNI9FuStvm','301','lab','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:54.229','ANZSYjC5h5m4JfFp','2023-05-11 04:17:31.492'),('O4cYGa5rqp1YMiTw','302','lecture','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:58.779','ANZSYjC5h5m4JfFp','2023-05-11 04:17:27.939'),('plB_bI6BJkApTozN','302','lecture','-h9dadJ_Sn2JMlHp','v1__FVXkUN5VLSxK','2023-05-01 05:10:23.349','ANZSYjC5h5m4JfFp','2023-05-11 04:17:42.189'),('Rne84YYEN2t0TIOS','201','both','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:17.780','v1__FVXkUN5VLSxK','2023-05-01 05:09:17.780'),('Si7AE_dVOX2BGJSF','101','both','-h9dadJ_Sn2JMlHp','v1__FVXkUN5VLSxK','2023-05-01 05:10:08.050','v1__FVXkUN5VLSxK','2023-05-01 05:10:08.050'),('u_74IPHKYMIBVnp9','202','lecture','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:34.061','ANZSYjC5h5m4JfFp','2023-05-11 04:17:20.033'),('UzWk7BnLx5u4szLK','301','lab','-h9dadJ_Sn2JMlHp','v1__FVXkUN5VLSxK','2023-05-01 05:10:18.947','ANZSYjC5h5m4JfFp','2023-05-11 04:17:39.192'),('VlDczOFD_-aCzCnk','205','lab','_UBY8Kqv-OWOZRcR','v1__FVXkUN5VLSxK','2023-05-01 05:09:43.269','ANZSYjC5h5m4JfFp','2023-05-11 04:17:34.353');
/*!40000 ALTER TABLE `Room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Scheduler`
--

DROP TABLE IF EXISTS `Scheduler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Scheduler` (
  `id` varchar(191) NOT NULL,
  `weekday` enum('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
  `start` int(11) NOT NULL,
  `end` int(11) NOT NULL,
  `sectionId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Scheduler_sectionId_fkey` (`sectionId`),
  KEY `Scheduler_createdByUserId_fkey` (`createdByUserId`),
  KEY `Scheduler_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Scheduler_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Scheduler_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Scheduler_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Scheduler`
--

LOCK TABLES `Scheduler` WRITE;
/*!40000 ALTER TABLE `Scheduler` DISABLE KEYS */;
INSERT INTO `Scheduler` VALUES ('1BBgr2JkBb7rJqiJ','wed',1,6,'9Flubxnkl_KNZBI2','ANZSYjC5h5m4JfFp','2023-05-11 06:22:48.248','ANZSYjC5h5m4JfFp','2023-05-11 06:22:48.248',0),('4fmHQ0FIjQCXC8Sg','fri',12,17,'0st41adspk0FJCQi','v1__FVXkUN5VLSxK','2023-05-11 05:23:02.918','v1__FVXkUN5VLSxK','2023-05-11 05:23:02.918',0),('cy1-E5IAD51HZVCo','mon',20,23,'VXPL3k1Tggrjna6X','v1__FVXkUN5VLSxK','2023-05-04 12:26:20.090','v1__FVXkUN5VLSxK','2023-05-04 12:26:20.090',0),('gBsbSM6lDTqtdub_','tue',2,7,'f2D02aMYGxeFAkgR','ANZSYjC5h5m4JfFp','2023-05-11 05:32:18.819','ANZSYjC5h5m4JfFp','2023-05-11 05:32:18.819',0),('gKrShhpoY6yk9jik','mon',5,8,'S0J483AjOBgpp_wP','v1__FVXkUN5VLSxK','2023-05-04 12:41:06.441','v1__FVXkUN5VLSxK','2023-05-04 12:41:06.441',0),('GOLUt7IGBWdEGEl9','tue',1,4,'qc2_z5cuZHPE40aE','ANZSYjC5h5m4JfFp','2023-05-11 05:43:24.524','ANZSYjC5h5m4JfFp','2023-05-11 05:43:24.524',0),('JrlhPyh5OaEaWP1D','mon',8,13,'zlDcS6mNNrSGtJ0J','v1__FVXkUN5VLSxK','2023-05-04 04:10:46.129','v1__FVXkUN5VLSxK','2023-05-04 04:10:46.129',0),('L_QHWjiqPDzccqCr','tue',8,13,'kxB37b37LtBPgUbd','ANZSYjC5h5m4JfFp','2023-05-11 05:43:32.572','ANZSYjC5h5m4JfFp','2023-05-11 05:43:32.572',0),('lLsG6t-umqk90Sqt','thu',13,18,'LABychfdr_r0fPs2','v1__FVXkUN5VLSxK','2023-05-11 05:22:57.472','v1__FVXkUN5VLSxK','2023-05-11 05:22:57.472',0),('oxECJxhl4OR9IBvY','tue',14,19,'QsraLbNNIVjGgOTH','ANZSYjC5h5m4JfFp','2023-05-11 06:00:39.727','ANZSYjC5h5m4JfFp','2023-05-11 06:00:39.727',0),('qcJNLzZTtMmGiL0E','mon',16,21,'aoJEAiAdgp3j9RX3','v1__FVXkUN5VLSxK','2023-05-04 12:26:53.677','v1__FVXkUN5VLSxK','2023-05-04 12:26:53.677',0),('XnoMA8k6-y1L4iIU','tue',14,19,'CUw3AFDC_QA0_Y8j','ANZSYjC5h5m4JfFp','2023-05-11 05:43:34.713','ANZSYjC5h5m4JfFp','2023-05-11 05:43:34.713',0),('YYoTdaGOJw26nJfD','sat',8,13,'4gdUroUMleftxru4','v1__FVXkUN5VLSxK','2023-05-11 05:19:59.202','v1__FVXkUN5VLSxK','2023-05-11 05:19:59.202',0);
/*!40000 ALTER TABLE `Scheduler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SchedulerExam`
--

DROP TABLE IF EXISTS `SchedulerExam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SchedulerExam` (
  `id` varchar(191) NOT NULL,
  `weekday` enum('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
  `start` int(11) NOT NULL,
  `end` int(11) NOT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT 0,
  `examId` varchar(191) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SchedulerExam_examId_fkey` (`examId`),
  KEY `SchedulerExam_createdByUserId_fkey` (`createdByUserId`),
  KEY `SchedulerExam_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `SchedulerExam_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SchedulerExam_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SchedulerExam_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SchedulerExam`
--

LOCK TABLES `SchedulerExam` WRITE;
/*!40000 ALTER TABLE `SchedulerExam` DISABLE KEYS */;
/*!40000 ALTER TABLE `SchedulerExam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Section`
--

DROP TABLE IF EXISTS `Section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Section` (
  `id` varchar(191) NOT NULL,
  `type` enum('lecture','lab') NOT NULL,
  `no` int(11) NOT NULL,
  `lab` int(11) DEFAULT NULL,
  `manual` tinyint(1) NOT NULL DEFAULT 0,
  `subjectId` varchar(191) NOT NULL,
  `roomId` varchar(191) DEFAULT NULL,
  `groupId` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `alt` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Section_subjectId_fkey` (`subjectId`),
  KEY `Section_roomId_fkey` (`roomId`),
  KEY `Section_groupId_fkey` (`groupId`),
  KEY `Section_parentId_fkey` (`parentId`),
  KEY `Section_createdByUserId_fkey` (`createdByUserId`),
  KEY `Section_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Section_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Section_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Section_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Section` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Section_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Section_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Section_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Section`
--

LOCK TABLES `Section` WRITE;
/*!40000 ALTER TABLE `Section` DISABLE KEYS */;
INSERT INTO `Section` VALUES ('_UJOsuy9EGs6FxO3','lab',1,1,1,'j-KqmyGTI-Fee_nn','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX','S0J483AjOBgpp_wP','v1__FVXkUN5VLSxK','2023-05-01 06:27:51.862','v1__FVXkUN5VLSxK','2023-05-01 07:13:29.835',NULL),('0st41adspk0FJCQi','lab',2,1,0,'US8ETHTaJcCp1HGL','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 08:16:49.999','v1__FVXkUN5VLSxK','2023-05-01 08:16:49.999','5, 13'),('4gdUroUMleftxru4','lecture',2,NULL,0,'q83A8FHsPjWGjIv1','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 08:17:19.114','v1__FVXkUN5VLSxK','2023-05-01 08:17:19.114','1, 5, 6'),('4TOZk9I96pz5MDI8','lab',2,1,0,'4oVgjhC1f2J1utLR','kXz3gyUMNG7IXNf9','NWef6zN1mZ4xFKas',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:42:22.994','ANZSYjC5h5m4JfFp','2023-05-11 04:42:22.994',NULL),('9Flubxnkl_KNZBI2','lab',2,1,0,'U4GLeSYZXNwJdUBp','Rne84YYEN2t0TIOS','OKB3625iqpLmzG67','vu1BfIbLhhA2VThe','ANZSYjC5h5m4JfFp','2023-05-11 06:22:38.347','ANZSYjC5h5m4JfFp','2023-05-11 06:22:38.347',NULL),('AfyIF1tRQjG_uwdo','lecture',1,NULL,0,'hkrgM2i1h35BnB5J','u_74IPHKYMIBVnp9','NWef6zN1mZ4xFKas',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:18:51.029','ANZSYjC5h5m4JfFp','2023-05-11 04:18:51.029',NULL),('aoJEAiAdgp3j9RX3','lecture',1,NULL,0,'q83A8FHsPjWGjIv1','Rne84YYEN2t0TIOS','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 07:56:09.508','v1__FVXkUN5VLSxK','2023-05-01 08:15:20.277','4, 5, 6'),('CUw3AFDC_QA0_Y8j','lab',1,2,0,'U4GLeSYZXNwJdUBp','kXz3gyUMNG7IXNf9','OKB3625iqpLmzG67','qc2_z5cuZHPE40aE','ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344','ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344',NULL),('f2D02aMYGxeFAkgR','lecture',3,NULL,0,'q83A8FHsPjWGjIv1','u_74IPHKYMIBVnp9','OKB3625iqpLmzG67',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:21:11.087','ANZSYjC5h5m4JfFp','2023-05-11 04:21:11.087',NULL),('ii-BcdmWx3YLDJ4d','lab',1,1,0,'5k9lCsvGbODftDpt','kXz3gyUMNG7IXNf9','NWef6zN1mZ4xFKas','ZgYLxNbS9z7lFpq-','ANZSYjC5h5m4JfFp','2023-05-11 04:20:23.189','ANZSYjC5h5m4JfFp','2023-05-11 04:42:33.861','3, 4, 5'),('jaJTITg6oB2V3gls','lab',4,1,0,'US8ETHTaJcCp1HGL',NULL,'uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-04 03:59:29.578','v1__FVXkUN5VLSxK','2023-05-04 04:01:48.740',NULL),('jXA0m8mQspDbRSbT','lab',3,1,0,'US8ETHTaJcCp1HGL','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 08:17:03.039','v1__FVXkUN5VLSxK','2023-05-01 08:17:03.039','1, 2, 3'),('KrbGQ0iJs_zxub7Y','lab',1,1,0,'Fcyp7OET_C8fUtsp','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX','sjOeYCDt4WacBiF6','v1__FVXkUN5VLSxK','2023-05-01 08:17:09.130','v1__FVXkUN5VLSxK','2023-05-01 08:17:09.130','2, 3, 4'),('kxB37b37LtBPgUbd','lab',1,1,0,'U4GLeSYZXNwJdUBp','kXz3gyUMNG7IXNf9','OKB3625iqpLmzG67','qc2_z5cuZHPE40aE','ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344','ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344',NULL),('LABychfdr_r0fPs2','lab',1,1,0,'US8ETHTaJcCp1HGL','Rne84YYEN2t0TIOS','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 07:46:28.239','v1__FVXkUN5VLSxK','2023-05-01 07:46:28.239',NULL),('qc2_z5cuZHPE40aE','lecture',1,NULL,0,'U4GLeSYZXNwJdUBp','Rne84YYEN2t0TIOS','OKB3625iqpLmzG67',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344','ANZSYjC5h5m4JfFp','2023-05-11 04:21:30.344',NULL),('QsraLbNNIVjGgOTH','lab',1,1,0,'4oVgjhC1f2J1utLR','VlDczOFD_-aCzCnk','OKB3625iqpLmzG67',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:35:14.744','ANZSYjC5h5m4JfFp','2023-05-11 04:35:14.744',NULL),('S0J483AjOBgpp_wP','lecture',1,NULL,1,'j-KqmyGTI-Fee_nn','Si7AE_dVOX2BGJSF','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 06:27:51.862','v1__FVXkUN5VLSxK','2023-05-01 07:13:26.772',NULL),('sjOeYCDt4WacBiF6','lecture',1,NULL,0,'Fcyp7OET_C8fUtsp','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 08:17:09.130','v1__FVXkUN5VLSxK','2023-05-01 08:17:09.130','2, 3, 4'),('VI4pZ1gdFiEilYmF','lab',6,1,0,'US8ETHTaJcCp1HGL','kXz3gyUMNG7IXNf9','NWef6zN1mZ4xFKas',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 05:28:03.839','ANZSYjC5h5m4JfFp','2023-05-11 05:28:03.839',NULL),('vu1BfIbLhhA2VThe','lecture',2,NULL,0,'U4GLeSYZXNwJdUBp','Rne84YYEN2t0TIOS','OKB3625iqpLmzG67',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 06:22:38.347','ANZSYjC5h5m4JfFp','2023-05-11 06:22:38.347',NULL),('VXPL3k1Tggrjna6X','lecture',1,NULL,0,'a_NtFkjBd_COL95C','kUUSs_QKQ3DJCOX3','uAlBHr7mDJv9WjgX',NULL,'v1__FVXkUN5VLSxK','2023-05-01 05:39:20.099','v1__FVXkUN5VLSxK','2023-05-01 07:13:34.697',NULL),('z7aYYxIKSCxWaCAi','lab',5,1,0,'US8ETHTaJcCp1HGL','kUUSs_QKQ3DJCOX3',NULL,NULL,'v1__FVXkUN5VLSxK','2023-05-05 08:41:34.765','v1__FVXkUN5VLSxK','2023-05-05 08:41:34.765',NULL),('ZgYLxNbS9z7lFpq-','lecture',1,NULL,0,'5k9lCsvGbODftDpt','kUUSs_QKQ3DJCOX3','NWef6zN1mZ4xFKas',NULL,'ANZSYjC5h5m4JfFp','2023-05-11 04:20:23.189','ANZSYjC5h5m4JfFp','2023-05-11 04:20:23.189',NULL),('zlDcS6mNNrSGtJ0J','lab',1,1,0,'a_NtFkjBd_COL95C','u_74IPHKYMIBVnp9','uAlBHr7mDJv9WjgX','VXPL3k1Tggrjna6X','v1__FVXkUN5VLSxK','2023-05-01 05:39:20.099','v1__FVXkUN5VLSxK','2023-05-01 07:13:39.438',NULL);
/*!40000 ALTER TABLE `Section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Subject`
--

DROP TABLE IF EXISTS `Subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Subject` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `credit` int(11) NOT NULL,
  `lecture` int(11) NOT NULL,
  `lab` int(11) NOT NULL,
  `exam` int(11) NOT NULL,
  `createdByUserId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedByUserId` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `learn` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Subject_createdByUserId_fkey` (`createdByUserId`),
  KEY `Subject_updatedByUserId_fkey` (`updatedByUserId`),
  CONSTRAINT `Subject_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Subject_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Subject`
--

LOCK TABLES `Subject` WRITE;
/*!40000 ALTER TABLE `Subject` DISABLE KEYS */;
INSERT INTO `Subject` VALUES ('_2Mq-pObCAZGXkh9','GEBHT101','กิจกรรมเพื่อสุขภาพ',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:56:52.991','v1__FVXkUN5VLSxK','2023-05-01 04:56:52.991',6),('_Gd0sE1nqNKfwhYF','ENGCE162','สัญญาณและระบบ',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:45:41.963','v1__FVXkUN5VLSxK','2023-05-01 04:45:41.963',6),('_tcl9h058VlvoRSx','ENGCE155','หัวข้อเฉพาะทางวิศวกรรมคอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:43:46.360','v1__FVXkUN5VLSxK','2023-05-01 04:43:46.360',5),('-_76Q8Kp4ZxAPC8i','GEBSO104','มนุษยสัมพันธ์',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:06.641','v1__FVXkUN5VLSxK','2023-05-01 04:58:06.641',6),('-1ljsjDwLtPeDib0','ENGCE183','การประมวลผลแบบคลาวด์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:37.919','v1__FVXkUN5VLSxK','2023-05-01 04:53:37.919',5),('-AzkZog5_EK3WsAT','ENGCE179','คอมพิวเตอร์กราฟฟิก',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:52:48.774','v1__FVXkUN5VLSxK','2023-05-01 04:52:48.774',5),('02qL-tvBaBG2-eB5','ENGCE152','การออกแบบระบบดิจิทัล',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:43:02.049','v1__FVXkUN5VLSxK','2023-05-01 04:43:02.049',4),('06YVosy3QrxFrzwD','ENGCE178','ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:52:35.348','v1__FVXkUN5VLSxK','2023-05-01 04:52:35.348',5),('0FAhC3a1m5zRRl_w','ENGCE161','การประมวลผลสัญญาณดิจิทัล',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:45:29.802','v1__FVXkUN5VLSxK','2023-05-01 04:45:29.802',6),('23ioRKkWlxfoZJh_','ENGCC303','วัสดุวิศวกรรม',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:01:28.458','v1__FVXkUN5VLSxK','2023-05-01 05:01:28.458',6),('3mL-uJLgTtbLxPw5','ENGCE170','การกำหนดความต้องการและการออกแบบทางซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:45:58.774','v1__FVXkUN5VLSxK','2023-05-01 04:45:58.774',5),('4oVgjhC1f2J1utLR','ENGCE113','การเตรียมโครงงานวิศวกรรมคอมพิวเตอร์',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:38:13.425','v1__FVXkUN5VLSxK','2023-05-01 04:38:13.425',1),('4sEIBXCGcvvy5y0a','ENGCE160','การโปรแกรมแบบขนานสำหรับระบบคลัสเตอร์คอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:45:17.183','v1__FVXkUN5VLSxK','2023-05-01 04:45:17.183',5),('5k9lCsvGbODftDpt','ENGCE136','การใช้งานเครือข่ายโดยกำหนดจากซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:41:40.601','v1__FVXkUN5VLSxK','2023-05-01 04:41:40.601',5),('5TH_jkRTh5dV8Mml','ENGCE171','การตรวจสอบความสมเหตุสมผลและการทวนสอบซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:46:10.107','v1__FVXkUN5VLSxK','2023-05-01 04:46:10.107',5),('67QfVq1FKLsChcR5','FUNMA106','แคลคูลัส 2 สำหรับวิศวกร',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:00:13.533','v1__FVXkUN5VLSxK','2023-05-01 05:00:13.533',6),('7SONyKuqMGjZtQME','ENGCE186','สถาปัตยกรรมซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:54:08.646','v1__FVXkUN5VLSxK','2023-05-01 04:54:08.646',5),('8hx8lEV2ooEMLQ8M','ENGCE158','การจัดการเทคโนโลยีและนวัตกรรม',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:44:28.816','v1__FVXkUN5VLSxK','2023-05-01 04:44:28.816',5),('8jVTB0PE73fbRt5Y','ENGCE175','การบริหารจัดการโครงการซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:51:56.957','v1__FVXkUN5VLSxK','2023-05-01 04:51:56.957',5),('9htVs8xQ2kDnzpYC','GEBSC105','วิทยาศาสตร์เพื่อสุขภาพ',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:59:37.862','v1__FVXkUN5VLSxK','2023-05-01 04:59:37.862',6),('a_NtFkjBd_COL95C','ENGCE103','โครงสร้างข้อมูลและขั้นตอนวิธี',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:34:43.413','v1__FVXkUN5VLSxK','2023-05-01 04:34:43.413',5),('A9EXVwbaPYmeC7c1','ENGCE110','ความมั่นคงปลอดภัยของคอมพิวเตอร์และข้อมูล',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:36:39.291','v1__FVXkUN5VLSxK','2023-05-01 04:36:39.291',5),('AV9Aqx9EfF_47M9t','GEBSO105','ภูมิสังคมวัฒนธรรมอาเซียน',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:15.276','v1__FVXkUN5VLSxK','2023-05-01 04:58:15.276',6),('bIKvjZkdXU5_iVOp','ENGCE185','ปฏิบัติการซอฟต์แวร์',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:59.241','v1__FVXkUN5VLSxK','2023-05-01 04:53:59.241',1),('bSit2S-lgaOaNrfK','ENGCE159','เทคโนโลยีสารสนเทศสำหรับวิศวกร',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:44:47.862','v1__FVXkUN5VLSxK','2023-05-01 04:44:47.862',5),('cJ0Xl9qcYs-BAOTY','ENGCE134','การรักษาความปลอดภัยบนระบบเครือข่าย',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:41:14.650','v1__FVXkUN5VLSxK','2023-05-01 04:41:14.650',5),('cPX5IxlkLZspdIPD','ENGCE181','การทำเหมืองข้อมูลและระบบสารสนเทศทางธุรกิจ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:12.327','v1__FVXkUN5VLSxK','2023-05-01 04:53:12.327',5),('csr__4_5GitP86wW','ENGCE153','การสั่งงานด้วยอุปกรณ์พกพาอัจฉริยะเคลื่อนที่',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:43:15.758','v1__FVXkUN5VLSxK','2023-05-01 04:43:15.758',5),('e3HEAmaYYXE5smT7','ENGCE184','การพัฒนาโปรแกรมบนระบบคลาวด์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:47.728','v1__FVXkUN5VLSxK','2023-05-01 04:53:47.728',5),('edTfYP7E4kLgejfP','GEBSC101','คณิตศาสตร์และสถิติในชีวิตประจำวัน',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:37.718','v1__FVXkUN5VLSxK','2023-05-01 04:58:37.718',6),('Er87vHcaZHVG0Y80','ENGCE114','โครงงานวิศวกรรมคอมพิวเตอร์',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:38:30.489','v1__FVXkUN5VLSxK','2023-05-01 04:38:30.489',4),('F9Ug5J8D9KBko-oA','ENGCE109','เครือข่ายคอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:36:23.127','v1__FVXkUN5VLSxK','2023-05-01 04:36:23.127',5),('Fcyp7OET_C8fUtsp','ENGCE104','โครงสร้างและสถาปัตยกรรมคอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:35:05.836','v1__FVXkUN5VLSxK','2023-05-01 04:35:05.836',5),('frtJPTLed4mHaAzR','GEBIN102','นวัตกรรมและเทคโนโลยี',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:15.088','v1__FVXkUN5VLSxK','2023-05-01 04:57:15.088',6),('G2eXvBtb4yjf30RQ','ENGEE101','วงจรไฟฟ้า',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:01:50.752','v1__FVXkUN5VLSxK','2023-05-01 05:01:50.752',6),('ggey2na56iaJwxwi','GEBLC102','ภาษาอังกฤษเพื่อทักษะชีวิต',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:56:15.575','v1__FVXkUN5VLSxK','2023-05-01 04:56:15.575',6),('gMi4h4N2eG43xBQR','ENGCE180','การประมวลผลภาพดิจิทัล และการมองเห็นโดยคอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:00.955','v1__FVXkUN5VLSxK','2023-05-01 04:53:00.955',5),('gR0Hv2BaBvzAlhzc','ENGCE151','ทฤษฎีฟัซซีเซต',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:42:49.012','v1__FVXkUN5VLSxK','2023-05-01 04:42:49.012',6),('gyAm_77uAwh2sQbS','ENGEL106','วงจรดิจิทัล',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:39:48.558','v1__FVXkUN5VLSxK','2023-05-01 04:39:48.558',5),('h-Ab_4udDBBjnNzE','ENGEE102','คณิตศาสตร์วิศวกรรมไฟฟ้า',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:02:02.024','v1__FVXkUN5VLSxK','2023-05-01 05:02:02.024',6),('h8bsZGd3RBFOwe4u','ENGCE115','สหกิจศึกษาทางวิศวกรรมคอมพิวเตอร์',6,0,40,1,'v1__FVXkUN5VLSxK','2023-05-01 04:38:47.946','v1__FVXkUN5VLSxK','2023-05-01 04:38:47.946',0),('Hb3PCpFQUAM1I00L','GEBLC201','ศิลปะการใช้ภาษาไทย',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:56:36.715','v1__FVXkUN5VLSxK','2023-05-01 04:56:36.715',6),('hkrgM2i1h35BnB5J','ENGCC302','กลศาสตร์วิศวกรรม',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:01:16.825','v1__FVXkUN5VLSxK','2023-05-01 05:01:16.825',6),('HqZ31CwquA_wwXtN','GEBSC102','เทคโนโลยีสารสนเทศที่จำเป็นในชีวิตประจำวัน',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:47.427','v1__FVXkUN5VLSxK','2023-05-01 04:58:47.427',6),('IBV0ELR5bTAS8BWe','ENGCC301','เขียนแบบวิศวกรรม',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 05:01:01.828','v1__FVXkUN5VLSxK','2023-05-01 05:01:01.828',5),('j-KqmyGTI-Fee_nn','ENGCE107','การออกแบบและการอินเตอร์เฟสไมโครคอนโทรลเลอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:35:53.124','v1__FVXkUN5VLSxK','2023-05-01 04:35:53.124',5),('j9Q9Jihn2ZOmt1pw','ENGCE154','ปฏิบัติการฮาร์ดแวร์',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:43:35.924','v1__FVXkUN5VLSxK','2023-05-01 04:43:35.924',1),('jOrwLyzbP-LyiqqH','ENGCE112','การออกแบบและพัฒนาซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:37:59.313','v1__FVXkUN5VLSxK','2023-05-01 04:37:59.313',5),('K0ZJ0fVQse0Sd4nj','FUNSC101','ฟิสิกส์ 1 สำหรับวิศวกร',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:00:30.843','v1__FVXkUN5VLSxK','2023-05-01 05:00:30.843',6),('l2fwU0jknq1MkwjP','ENGCE108','การวิเคราะห์และออกแบบระบบ',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:36:09.072','v1__FVXkUN5VLSxK','2023-05-01 04:36:09.072',6),('lGIp23WzLYAScv1l','GEBSO102','การพัฒนาคุณภาพชีวิตและสังคม',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:45.152','v1__FVXkUN5VLSxK','2023-05-01 04:57:45.152',6),('msWIjC3xK6xFoIwk','ENGCE156','การโต้ตอบระหว่างคอมพิวเตอร์กับมนุษย์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:43:58.939','v1__FVXkUN5VLSxK','2023-05-01 04:43:58.939',5),('mUwHHAAxC6n1ELNg','ENGCE135','การออกแบบและวางแผนการจัดการระบบเครือข่าย',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:41:29.175','v1__FVXkUN5VLSxK','2023-05-01 04:41:29.175',6),('N6gSo9AQTD05hd5t','GEBSO101','ปรัชญาเศรษฐกิจพอเพียงและภูมิปัญญาในการดำเนินชีวิต',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:34.588','v1__FVXkUN5VLSxK','2023-05-01 04:57:34.588',6),('naBrJZ5Phw6EdJDj','ENGCE133','การวัดทดสอบและประเมินประสิทธิภาพของระบบเครือข่าย',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:41:02.251','v1__FVXkUN5VLSxK','2023-05-01 04:41:02.251',4),('nbSMkaVEnUDRVY7V','ENGEE106','เครื่องมือวัดและการวัดทางไฟฟ้า',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 05:04:30.866','v1__FVXkUN5VLSxK','2023-05-01 05:04:30.866',5),('nTtmfcDJjXwJxC1K','ENGCE131','การสื่อสารเชิงดิจิทัล',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:40:38.638','v1__FVXkUN5VLSxK','2023-05-01 04:40:38.638',6),('Nz-kys4FyulnQ9Jx','ENGCE173','การวิเคราะห์และออกแบบเชิงวัตถุ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:47:48.864','v1__FVXkUN5VLSxK','2023-05-01 04:47:48.864',5),('ohmJlcATcBwdzIi4','GEBIN101','กระบวนการคิดและการแก้ปัญหา',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:05.974','v1__FVXkUN5VLSxK','2023-05-01 04:57:05.974',6),('pGqnZ6HP8GcF16rF','GEBLC103','ภาษาอังกฤษเชิงวิชาการ',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:56:28.015','v1__FVXkUN5VLSxK','2023-05-01 04:56:28.015',6),('puFg5Og4PnZUGamk','ENGCE176','การเขียนโปรแกรมบนเว็บ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:52:09.871','v1__FVXkUN5VLSxK','2023-05-01 04:52:09.871',5),('pX81Da7Tz7lVrOxR','GEBSO106','จิตวิทยาเพื่อการดำเนินชีวิตและการทำงาน',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:26.778','v1__FVXkUN5VLSxK','2023-05-01 04:58:26.778',6),('q83A8FHsPjWGjIv1','ENGCE102','คณิตศาสตร์พื้นฐานสำหรับวิศวกรรมคอมพิวเตอร์',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:34:27.659','v1__FVXkUN5VLSxK','2023-05-01 04:34:27.659',6),('qdkiwzmlqMfPzbOq','GEBSC103','การคิดและการตัดสินใจเชิงวิทยาศาสตร์',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:58:58.670','v1__FVXkUN5VLSxK','2023-05-01 04:58:58.670',6),('qVwN_Yc7OGXyduxT','ENGCE106','การสื่อสารข้อมูลและเครือข่าย',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:35:34.476','v1__FVXkUN5VLSxK','2023-05-01 04:35:34.476',5),('qYLjEyWffuEzpYPB','ENGCE150','อินเตอร์เน็ตในทุกสิ่ง',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:42:39.104','v1__FVXkUN5VLSxK','2023-05-01 04:42:39.104',4),('sd77q3Yj9Syq53Rp','ENGCE111','วิศวกรรมฐานข้อมูลและข้อมูลขนาดใหญ่เบื้องต้น',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:36:52.867','v1__FVXkUN5VLSxK','2023-05-01 04:36:52.867',5),('SGwIWCcr28SzLWN5','ENGEE105','การฝึกเบื้องต้นทางวิศวกรรม',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 05:04:18.431','v1__FVXkUN5VLSxK','2023-05-01 05:04:18.431',1),('sHgFqmzX-6SRDaXq','ENGCE182','การพัฒนาโปรแกรมประยุกต์และเกมสำหรับอุปกรณ์เคลื่อนที่',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:53:26.231','v1__FVXkUN5VLSxK','2023-05-01 04:53:26.231',5),('tIGParx304tXl0Hg','FUNMA105','แคลคูลัส 1 สำหรับวิศวกร',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 05:00:00.712','v1__FVXkUN5VLSxK','2023-05-01 05:00:00.712',6),('ttRVIbKaTp41ZlLq','ENGCE174','การเขียนโปรแกรมเชิงวัตถุ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:48:01.116','v1__FVXkUN5VLSxK','2023-05-01 04:48:01.116',5),('U_Pq4xeeenNCIFGh','ENGCE177','หัวข้อความก้าวล้ำในงานวิศวกรรมซอฟต์แวร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:52:24.335','v1__FVXkUN5VLSxK','2023-05-01 04:52:24.335',5),('U4GLeSYZXNwJdUBp','ENGEL105','อิเล็กทรอนิกส์วิศวกรรม',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:39:36.954','v1__FVXkUN5VLSxK','2023-05-01 04:39:36.954',5),('US8ETHTaJcCp1HGL','ENGCE101','งานฝึกพื้นฐานทางวิศวกรรมคอมพิวเตอร์',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:32:32.934','v1__FVXkUN5VLSxK','2023-05-01 04:33:57.241',1),('uT4ojUY8OTZRoz5y','GEBSO103','สังคม เศรษฐกิจ การเมือง และกฎหมาย',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:55.812','v1__FVXkUN5VLSxK','2023-05-01 04:57:55.812',6),('v4stLcCnK_M8mr4C','FUNSC102','ปฏิบัติการฟิสิกส์ 1 สำหรับวิศวกร',1,0,3,1,'v1__FVXkUN5VLSxK','2023-05-01 05:00:46.119','v1__FVXkUN5VLSxK','2023-05-01 05:00:46.119',1),('VAeHPqu0_vwgPeiU','ENGCE137','การดูแลระบบยูนิกซ์',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:41:53.295','v1__FVXkUN5VLSxK','2023-05-01 04:42:02.496',4),('vvIlcQySMjSu56Cl','GEBIN103','ศิลปะการใช้ชีวิต',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:57:23.752','v1__FVXkUN5VLSxK','2023-05-01 04:57:23.752',6),('w2jrGsaUlgA2XP21','ENGCE157','ระบบสมองกลฝังตัวและอินเทอร์เน็ตในทุกสรรพสิ่ง',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:44:16.452','v1__FVXkUN5VLSxK','2023-05-01 04:44:16.452',5),('XaJk6RJoQH_3_GtT','ENGCE172','กระบวนการซอฟต์แวร์และการประกันคุณภาพ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:46:52.211','v1__FVXkUN5VLSxK','2023-05-01 04:46:52.211',5),('xDBrS8j0TljY8sSZ','ENGCE138','การสื่อสารข้อมูลมัลติมีเดียบนระบบเครือข่าย',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:42:18.934','v1__FVXkUN5VLSxK','2023-05-01 04:42:18.934',4),('XFnv3bmRsKh1j6oD','GEBLC101','ภาษาอังกฤษเพื่อการสื่อสารในชีวิตประจำวัน',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:56:04.995','v1__FVXkUN5VLSxK','2023-05-01 04:56:04.995',6),('XnbxtuKiC1uOV-wt','ENGCE105','ระบบปฏิบัติการ',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:35:18.982','v1__FVXkUN5VLSxK','2023-05-01 04:35:18.982',5),('y3Nm6Q-8RDmyEGZa','GEBSC104','การสร้างกระบวนการทางวิทยาศาสตร์เพื่อทำงานวิจัย และการสร้างนวัตกรรม',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:59:14.340','v1__FVXkUN5VLSxK','2023-05-01 04:59:14.340',6),('Ysv_QlXBP09E_J46','GEBSC106','สิ่งแวดล้อมกับการพัฒนา',3,3,0,1,'v1__FVXkUN5VLSxK','2023-05-01 04:59:46.710','v1__FVXkUN5VLSxK','2023-05-01 04:59:46.710',6),('YvUfoRXHezEGHjo3','ENGCE132','การคำนวณสมรรถนะสูงและสถาปัตยกรรมแบบคลาวด์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 04:40:50.923','v1__FVXkUN5VLSxK','2023-05-01 04:40:50.923',5),('yxWz5brifgbXrae2','ENGCE130','การติดตั้งและบำรุงรักษาสายสัญญาณเครือข่ายคอมพิวเตอร์',3,1,6,1,'v1__FVXkUN5VLSxK','2023-05-01 04:40:25.324','v1__FVXkUN5VLSxK','2023-05-01 04:40:25.324',4),('z_67M6WcnXqDNXvi','ENGCC304','การเขียนโปรแกรมคอมพิวเตอร์',3,2,3,1,'v1__FVXkUN5VLSxK','2023-05-01 05:01:40.088','v1__FVXkUN5VLSxK','2023-05-01 05:01:40.088',5);
/*!40000 ALTER TABLE `Subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Token`
--

DROP TABLE IF EXISTS `Token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Token` (
  `id` varchar(191) NOT NULL,
  `token` tinytext NOT NULL,
  `iat` datetime(3) NOT NULL,
  `exp` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Token_userId_idx` (`userId`),
  CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Token`
--

LOCK TABLES `Token` WRITE;
/*!40000 ALTER TABLE `Token` DISABLE KEYS */;
INSERT INTO `Token` VALUES ('AJO5VDhFW6D5KCWf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkFOWlNZakM1aDVtNEpmRnAiLCJqdGkiOiI1MTI1NDdlODJkZjY2MmVjIiwiaWF0IjoxNjgzNzg3MTQzLCJleHAiOjE2ODYzNzkxNDN9.L9bpcv2QzBZQWmkkYaWrF5JGE2lKuvMRrooshPQ3YYQ','2023-05-11 06:39:03.883','2023-06-10 06:39:03.883','ANZSYjC5h5m4JfFp'),('CE9bZ6HHp1yax9kB','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InYxX19GVlhrVU41VkxTeEsiLCJqdGkiOiI3YzU4ZTE3ZDVmMDYxMWM2IiwiaWF0IjoxNjgzMjczNTY4LCJleHAiOjE2ODU4NjU1Njh9.-xTHamnMd1DXTnbIj8raubNT_7rAARlSMtrxxdjqBXI','2023-05-05 07:59:28.766','2023-06-04 07:59:28.766','v1__FVXkUN5VLSxK'),('L7E5QVMKGOhvY-v7','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InYxX19GVlhrVU41VkxTeEsiLCJqdGkiOiIyNjQzN2M2M2IwZjY5ZWY2IiwiaWF0IjoxNjgzNTE3MjYwLCJleHAiOjE2ODYxMDkyNjB9.iQtTNkLKi8WL5QikmmWQMENvzKMBIKDL0RJmwBoOncA','2023-05-08 03:41:00.159','2023-06-07 03:41:00.159','v1__FVXkUN5VLSxK'),('NgpX1rBfvTbVvknP','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InYxX19GVlhrVU41VkxTeEsiLCJqdGkiOiIxMDk0MzZkNDlmNmFmZTQ3IiwiaWF0IjoxNjgzNTM2NjMwLCJleHAiOjE2ODYxMjg2MzB9.E5qn39TLF_7IHYEChYPR_NqCpgy6BzFuji3ijQDyXLE','2023-05-08 09:03:50.939','2023-06-07 09:03:50.939','v1__FVXkUN5VLSxK'),('ZQTfVOn05tFgVgv_','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InYxX19GVlhrVU41VkxTeEsiLCJqdGkiOiI4OWJmZTRjYjcwZGZiMDcxIiwiaWF0IjoxNjgzMjc2NjUxLCJleHAiOjE2ODU4Njg2NTF9.vIut14KtrlaV2HXEcTDerWDhQn0HMQb0NZ7uLZ1shOo','2023-05-05 08:50:51.707','2023-06-04 08:50:51.707','v1__FVXkUN5VLSxK');
/*!40000 ALTER TABLE `Token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('ANZSYjC5h5m4JfFp','auksorn','7b7bae8e727c071b9f8227fb0d3f7f5a.f193915dc84b41a6e864d4548a8d774d419c06944b160269fb46b6424d439b5a','user','2023-05-11 04:16:43.227','2023-05-11 04:16:43.227'),('v1__FVXkUN5VLSxK','admin','f13a7b2c922c9e93c3a5b46d1251e61d.417feae8fe64f6c10aec4f594f9db5a3443c4dde76758d5a6af44d089a9fc9fa','admin','2023-04-25 19:35:07.175','2023-04-25 19:35:07.175');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_ExamToInstructor`
--

DROP TABLE IF EXISTS `_ExamToInstructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_ExamToInstructor` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL,
  UNIQUE KEY `_ExamToInstructor_AB_unique` (`A`,`B`),
  KEY `_ExamToInstructor_B_index` (`B`),
  CONSTRAINT `_ExamToInstructor_A_fkey` FOREIGN KEY (`A`) REFERENCES `Exam` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_ExamToInstructor_B_fkey` FOREIGN KEY (`B`) REFERENCES `Instructor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_ExamToInstructor`
--

LOCK TABLES `_ExamToInstructor` WRITE;
/*!40000 ALTER TABLE `_ExamToInstructor` DISABLE KEYS */;
INSERT INTO `_ExamToInstructor` VALUES ('-_akGAaWkZSc-rlw','HI--X8RYfwLf6NqN'),('6utQ5uBrs7OIb63c','0SHqN3F3cwPuIsfA'),('6utQ5uBrs7OIb63c','9P-MNMNmJSSwJQ5V'),('8pp7ZAhGOYlqM86m','tRwfdfroVEhHS7eA'),('abIluqNWzTx_MtMb','fiepw6p7pLvL1TqW'),('EZMC83MRfELgjgWp','HI--X8RYfwLf6NqN'),('EZMC83MRfELgjgWp','T7vG2VMAGRHAuj4_'),('uoF1d7sfdbBNmyaU','tRwfdfroVEhHS7eA');
/*!40000 ALTER TABLE `_ExamToInstructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_ExamToSection`
--

DROP TABLE IF EXISTS `_ExamToSection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_ExamToSection` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL,
  UNIQUE KEY `_ExamToSection_AB_unique` (`A`,`B`),
  KEY `_ExamToSection_B_index` (`B`),
  CONSTRAINT `_ExamToSection_A_fkey` FOREIGN KEY (`A`) REFERENCES `Exam` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_ExamToSection_B_fkey` FOREIGN KEY (`B`) REFERENCES `Section` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_ExamToSection`
--

LOCK TABLES `_ExamToSection` WRITE;
/*!40000 ALTER TABLE `_ExamToSection` DISABLE KEYS */;
INSERT INTO `_ExamToSection` VALUES ('-_akGAaWkZSc-rlw','S0J483AjOBgpp_wP'),('6utQ5uBrs7OIb63c','0st41adspk0FJCQi'),('6utQ5uBrs7OIb63c','4gdUroUMleftxru4'),('8pp7ZAhGOYlqM86m','aoJEAiAdgp3j9RX3'),('abIluqNWzTx_MtMb','AfyIF1tRQjG_uwdo'),('EZMC83MRfELgjgWp','0st41adspk0FJCQi'),('EZMC83MRfELgjgWp','jaJTITg6oB2V3gls'),('EZMC83MRfELgjgWp','jXA0m8mQspDbRSbT'),('EZMC83MRfELgjgWp','LABychfdr_r0fPs2'),('EZMC83MRfELgjgWp','z7aYYxIKSCxWaCAi'),('uoF1d7sfdbBNmyaU','aoJEAiAdgp3j9RX3');
/*!40000 ALTER TABLE `_ExamToSection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_InstructorToSection`
--

DROP TABLE IF EXISTS `_InstructorToSection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_InstructorToSection` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL,
  UNIQUE KEY `_InstructorToSection_AB_unique` (`A`,`B`),
  KEY `_InstructorToSection_B_index` (`B`),
  CONSTRAINT `_InstructorToSection_A_fkey` FOREIGN KEY (`A`) REFERENCES `Instructor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_InstructorToSection_B_fkey` FOREIGN KEY (`B`) REFERENCES `Section` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_InstructorToSection`
--

LOCK TABLES `_InstructorToSection` WRITE;
/*!40000 ALTER TABLE `_InstructorToSection` DISABLE KEYS */;
INSERT INTO `_InstructorToSection` VALUES ('fiepw6p7pLvL1TqW','CUw3AFDC_QA0_Y8j'),('fiepw6p7pLvL1TqW','qc2_z5cuZHPE40aE'),('fiepw6p7pLvL1TqW','S0J483AjOBgpp_wP'),('fiepw6p7pLvL1TqW','vu1BfIbLhhA2VThe'),('HI--X8RYfwLf6NqN','0st41adspk0FJCQi'),('HI--X8RYfwLf6NqN','ii-BcdmWx3YLDJ4d'),('HI--X8RYfwLf6NqN','KrbGQ0iJs_zxub7Y'),('HI--X8RYfwLf6NqN','LABychfdr_r0fPs2'),('HI--X8RYfwLf6NqN','sjOeYCDt4WacBiF6'),('HI--X8RYfwLf6NqN','VXPL3k1Tggrjna6X'),('HI--X8RYfwLf6NqN','z7aYYxIKSCxWaCAi'),('HI--X8RYfwLf6NqN','ZgYLxNbS9z7lFpq-'),('HI--X8RYfwLf6NqN','zlDcS6mNNrSGtJ0J'),('iidyYl5NyMXBzafN','_UJOsuy9EGs6FxO3'),('T7vG2VMAGRHAuj4_','4TOZk9I96pz5MDI8'),('T7vG2VMAGRHAuj4_','kxB37b37LtBPgUbd'),('T7vG2VMAGRHAuj4_','qc2_z5cuZHPE40aE'),('T7vG2VMAGRHAuj4_','ZgYLxNbS9z7lFpq-'),('T7vG2VMAGRHAuj4_','zlDcS6mNNrSGtJ0J'),('tRwfdfroVEhHS7eA','4gdUroUMleftxru4'),('tRwfdfroVEhHS7eA','4TOZk9I96pz5MDI8'),('tRwfdfroVEhHS7eA','9Flubxnkl_KNZBI2'),('tRwfdfroVEhHS7eA','AfyIF1tRQjG_uwdo'),('tRwfdfroVEhHS7eA','aoJEAiAdgp3j9RX3'),('tRwfdfroVEhHS7eA','f2D02aMYGxeFAkgR'),('tRwfdfroVEhHS7eA','jXA0m8mQspDbRSbT'),('tRwfdfroVEhHS7eA','LABychfdr_r0fPs2'),('tRwfdfroVEhHS7eA','S0J483AjOBgpp_wP'),('ZSEXFO25YcoTEDsd','QsraLbNNIVjGgOTH');
/*!40000 ALTER TABLE `_InstructorToSection` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-18  9:08:20
