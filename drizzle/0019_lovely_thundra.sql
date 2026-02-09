CREATE TABLE `auditLogs_dev_corrupted` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`type` varchar(20) NOT NULL DEFAULT 'STANDARD',
	`statusCode` int NOT NULL,
	`duration` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`ip` varchar(45),
	`userAgent` varchar(512),
	`requestId` varchar(64),
	`hash` varchar(64) NOT NULL,
	`prevHash` varchar(64),
	`frozen_at` timestamp NOT NULL DEFAULT (now()),
	`frozen_reason` varchar(255) NOT NULL DEFAULT 'Development phase audit chain corruption - isolated for forensic reference',
	CONSTRAINT `auditLogs_dev_corrupted_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_legacy_user_timestamp` ON `auditLogs_dev_corrupted` (`userId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_audit_legacy_hash` ON `auditLogs_dev_corrupted` (`hash`);--> statement-breakpoint
CREATE INDEX `idx_audit_legacy_timestamp` ON `auditLogs_dev_corrupted` (`timestamp`);