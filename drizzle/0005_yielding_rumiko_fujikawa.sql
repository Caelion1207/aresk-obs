CREATE TABLE `timeMarkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`messageIndex` int NOT NULL,
	`markerType` enum('colapso_semantico','recuperacion','transicion','observacion') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeMarkers_id` PRIMARY KEY(`id`)
);
