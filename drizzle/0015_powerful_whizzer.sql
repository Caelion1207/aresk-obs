CREATE TABLE `protocolEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol` varchar(10) NOT NULL,
	`eventType` varchar(50) NOT NULL,
	`sessionId` int NOT NULL,
	`messageId` int,
	`eventData` text NOT NULL,
	`coherenceScore` decimal(5,3),
	`stabilityScore` decimal(5,3),
	`ethicalScore` decimal(5,3),
	`status` varchar(20) NOT NULL,
	`severity` varchar(20),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocolEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_protocol_session` ON `protocolEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idx_protocol_type` ON `protocolEvents` (`protocol`);--> statement-breakpoint
CREATE INDEX `idx_protocol_status` ON `protocolEvents` (`status`);--> statement-breakpoint
CREATE INDEX `idx_protocol_timestamp` ON `protocolEvents` (`timestamp`);