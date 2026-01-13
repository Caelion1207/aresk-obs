CREATE TABLE `erosionAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`alertType` enum('critical_trend','high_erosion_period','sustained_drainage') NOT NULL,
	`severity` enum('critical','high','moderate') NOT NULL,
	`trendChange` float NOT NULL,
	`message` text NOT NULL,
	`notified` boolean NOT NULL DEFAULT false,
	`dismissed` boolean NOT NULL DEFAULT false,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erosionAlerts_id` PRIMARY KEY(`id`)
);
