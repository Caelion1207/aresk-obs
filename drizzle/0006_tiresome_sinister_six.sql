CREATE TABLE `sessionAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`alertType` enum('low_tpr','high_lyapunov','frequent_collapses','unstable_omega') NOT NULL,
	`severity` enum('critical','warning','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`metricValue` float,
	`dismissed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionAlerts_id` PRIMARY KEY(`id`)
);
