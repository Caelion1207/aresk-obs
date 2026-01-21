CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int NOT NULL,
	`duration` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`ip` varchar(45),
	`userAgent` varchar(512),
	`requestId` varchar(64),
	`hash` varchar(64) NOT NULL,
	`prevHash` varchar(64),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_user_timestamp` ON `auditLogs` (`userId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_audit_hash` ON `auditLogs` (`hash`);--> statement-breakpoint
CREATE INDEX `idx_audit_timestamp` ON `auditLogs` (`timestamp`);